#!/usr/bin/env node
/**
 * Copy the Neo Synergy catalogue from one Supabase project to another:
 * table rows (with their original ids), storage images, and every stored URL
 * that points at the old project.
 *
 *   node scripts/migrate-supabase.mjs           dry run — reads both projects, writes nothing
 *   node scripts/migrate-supabase.mjs --apply   copy
 *
 * Configuration comes from .env.local:
 *   source  NEXT_PUBLIC_SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY  (the current project)
 *           — or MIGRATE_FROM_URL + MIGRATE_FROM_SERVICE_ROLE_KEY to override
 *   target  MIGRATE_TO_URL + MIGRATE_TO_SERVICE_ROLE_KEY           (required)
 *
 * Before running: create the new project and run supabase/schema.sql in its SQL
 * editor, once, and nothing else. NOT seed.sql — it is an older, different
 * catalogue, and its slugs collide with real rows.
 *
 * The source project is only ever read. Re-running is safe: rows are upserted on
 * their primary key and images already present at the same size are skipped, so
 * an interrupted run can simply be started again.
 *
 * Admin accounts are listed but not copied — Supabase cannot export password
 * hashes through the API, and inviting them would send email on your behalf.
 */

import { createClient } from "@supabase/supabase-js";
import { existsSync } from "node:fs";

const APPLY = process.argv.includes("--apply");
const BUCKET = "images";
const PAGE = 1000;   // PostgREST's default max rows per request
const CHUNK = 500;   // rows per upsert request
// Matches IMAGE_CACHE_CONTROL in lib/supabase/storage.ts. Upload paths are
// unique per upload, so the files are safe to cache for a year.
const IMAGE_CACHE_CONTROL = "31536000";

// Dependency order: every table comes after the tables its foreign keys point at.
const TABLES = [
  { name: "services",         key: ["id"] },
  { name: "categories",       key: ["id"] }, // also parents before children — see writeCategories
  { name: "products",         key: ["id"], drop: ["search_vector"] }, // recomputed by a BEFORE trigger
  { name: "product_images",   key: ["id"] },
  { name: "spec_groups",      key: ["id"] },
  { name: "spec_rows",        key: ["id"] },
  { name: "related_products", key: ["product_id", "related_product_id"] },
];

// ---------------------------------------------------------------------------
// Output
// ---------------------------------------------------------------------------
const log = (...a) => console.log(...a);
const ok = (m) => log(`  ✓ ${m}`);
const warn = (m) => log(`  ! ${m}`);
const head = (m) => log(`\n${m}`);
function fail(m) {
  console.error(`\n✗ ${m}\n`);
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------
if (existsSync(".env.local")) process.loadEnvFile(".env.local");
const env = (k) => process.env[k]?.trim() || undefined;

const src = {
  url: env("MIGRATE_FROM_URL") ?? env("NEXT_PUBLIC_SUPABASE_URL"),
  key: env("MIGRATE_FROM_SERVICE_ROLE_KEY") ?? env("SUPABASE_SERVICE_ROLE_KEY"),
};
const dst = {
  url: env("MIGRATE_TO_URL"),
  key: env("MIGRATE_TO_SERVICE_ROLE_KEY"),
};

if (!src.url || !src.key) {
  fail("Source not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local (or MIGRATE_FROM_*).");
}
if (!dst.url || !dst.key) {
  fail("Target not configured. Add MIGRATE_TO_URL and MIGRATE_TO_SERVICE_ROLE_KEY for the NEW project to .env.local.");
}

const srcOrigin = new URL(src.url).origin;
const dstOrigin = new URL(dst.url).origin;
if (srcOrigin === dstOrigin) {
  // Most likely cause: .env.local was already switched to the new project, so
  // the "source" defaults now point at the target.
  fail(`Source and target are the same project (${srcOrigin}). If .env.local already points at the new project, set MIGRATE_FROM_URL and MIGRATE_FROM_SERVICE_ROLE_KEY to the old one.`);
}

/**
 * A publishable/anon key would let reads through RLS's public policies and make
 * the copy look like it worked while silently missing storage listings and
 * failing every write. Catch it before anything runs.
 */
function assertServiceKey(label, key) {
  if (key.startsWith("sb_secret_")) return;
  if (key.startsWith("sb_publishable_")) {
    fail(`${label} key is a publishable key. Use the secret (service role) key.`);
  }
  try {
    const claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString());
    if (claims.role === "service_role") return;
    fail(`${label} key has role "${claims.role}". Use the service role key.`);
  } catch {
    fail(`${label} key is not a recognisable Supabase key.`);
  }
}
assertServiceKey("Source", src.key);
assertServiceKey("Target", dst.key);

const clientOpts = { auth: { persistSession: false, autoRefreshToken: false } };
const from = createClient(src.url, src.key, clientOpts);
const to = createClient(dst.url, dst.key, clientOpts);

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function readAll(client, table, order) {
  const rows = [];
  for (let start = 0; ; start += PAGE) {
    let q = client.from(table).select("*");
    for (const col of order) q = q.order(col);
    const { data, error } = await q.range(start, start + PAGE - 1);
    if (error) throw new Error(`reading ${table}: ${error.message}`);
    rows.push(...data);
    if (data.length < PAGE) return rows;
  }
}

async function upsert(client, table, rows, key) {
  for (let i = 0; i < rows.length; i += CHUNK) {
    const { error } = await client
      .from(table)
      .upsert(rows.slice(i, i + CHUNK), { onConflict: key.join(",") });
    if (error) throw new Error(`writing ${table}: ${error.message}`);
  }
}

const rowKey = (row, key) => key.map((k) => row[k]).join("|");

/** Swap the old project's origin for the new one anywhere in a value, including inside jsonb. */
function rewrite(value) {
  if (typeof value === "string") return value.split(srcOrigin).join(dstOrigin);
  if (Array.isArray(value)) return value.map(rewrite);
  if (value && typeof value === "object") {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, rewrite(v)]));
  }
  return value;
}

/** Every string anywhere in a value that still mentions the given origin. */
function findOrigin(value, origin, out = []) {
  if (typeof value === "string") {
    if (value.includes(origin)) out.push(value);
  } else if (Array.isArray(value)) {
    value.forEach((v) => findOrigin(v, origin, out));
  } else if (value && typeof value === "object") {
    Object.values(value).forEach((v) => findOrigin(v, origin, out));
  }
  return out;
}

/** Depth of every category, so a whole level can be written before the next. */
function categoryDepths(rows) {
  const byId = new Map(rows.map((r) => [r.id, r]));
  const depth = new Map();
  const visit = (row, trail) => {
    if (depth.has(row.id)) return depth.get(row.id);
    if (!row.parent_id) {
      depth.set(row.id, 0);
      return 0;
    }
    if (trail.has(row.id)) throw new Error(`categories: parent cycle through "${row.slug}"`);
    trail.add(row.id);
    const parent = byId.get(row.parent_id);
    if (!parent) throw new Error(`categories: "${row.slug}" points at missing parent ${row.parent_id}`);
    const d = visit(parent, trail) + 1;
    depth.set(row.id, d);
    return d;
  };
  rows.forEach((r) => visit(r, new Set()));
  return depth;
}

async function listStorage(client, prefix = "") {
  const files = [];
  for (let offset = 0; ; offset += PAGE) {
    const { data, error } = await client.storage
      .from(BUCKET)
      .list(prefix, { limit: PAGE, offset, sortBy: { column: "name", order: "asc" } });
    if (error) throw new Error(`listing storage "${prefix || "/"}": ${error.message}`);
    for (const item of data) {
      const path = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null) {
        files.push(...(await listStorage(client, path))); // folder
      } else if (item.name !== ".emptyFolderPlaceholder") {
        files.push({
          path,
          size: item.metadata?.size ?? null,
          contentType: item.metadata?.mimetype ?? undefined,
        });
      }
    }
    if (data.length < PAGE) return files;
  }
}

/**
 * One cheap request before anything else, so the three common mistakes each get
 * their own message instead of surfacing later as a confusing table error:
 * wrong URL, wrong key, or schema.sql never run.
 */
async function checkProject(client, label, origin) {
  const { error } = await client.from("services").select("id").limit(1);
  if (!error) return;
  const msg = error.message ?? String(error);
  if (/fetch failed|ENOTFOUND|ECONNREFUSED|getaddrinfo/i.test(msg)) {
    fail(`Cannot reach the ${label} project at ${origin}. Check the URL.`);
  }
  if (/invalid api key|jwt|unauthori[sz]ed/i.test(msg)) {
    fail(`The ${label} project rejected its key. Check it is that project's secret key, not another project's.`);
  }
  if (error.code === "42P01" || error.code === "PGRST205" || /does not exist|could not find the table/i.test(msg)) {
    fail(`The ${label} project has no catalogue tables. Run supabase/schema.sql in its SQL editor first.`);
  }
  fail(`The ${label} project returned an unexpected error: ${msg}`);
}

async function listUsers(client) {
  const users = [];
  for (let page = 1; ; page++) {
    const { data, error } = await client.auth.admin.listUsers({ page, perPage: PAGE });
    if (error) throw new Error(`listing users: ${error.message}`);
    users.push(...data.users);
    if (data.users.length < PAGE) return users;
  }
}

// ---------------------------------------------------------------------------
// Run
// ---------------------------------------------------------------------------
log(`Supabase migration — ${APPLY ? "APPLY" : "dry run (nothing will be written)"}`);
log(`  from ${srcOrigin}  (read only)`);
log(`  to   ${dstOrigin}`);

try {
  await checkProject(from, "source", srcOrigin);
  await checkProject(to, "target", dstOrigin);

  // ---- 1. Read the source --------------------------------------------------
  head("Reading source");
  const source = {};
  for (const t of TABLES) {
    source[t.name] = await readAll(from, t.name, t.key);
    ok(`${t.name}: ${source[t.name].length}`);
  }
  const srcFiles = await listStorage(from);
  ok(`storage/${BUCKET}: ${srcFiles.length} files`);

  // ---- 2. Preflight the target -------------------------------------------
  head("Checking target");
  const problems = [];

  const { error: bucketErr } = await to.storage.getBucket(BUCKET);
  if (bucketErr) {
    problems.push(`Storage bucket "${BUCKET}" is missing — the storage section of schema.sql has not run.`);
  } else {
    ok(`bucket "${BUCKET}" exists`);
  }

  const target = {};
  for (const t of TABLES) {
    const rows = source[t.name];

    // Schema drift: a column that exists in the old project but not in
    // schema.sql would fail every insert. Find it now, not halfway through.
    // An empty table still gets checked with "*", which confirms it exists.
    const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter(
      (c) => !(t.drop ?? []).includes(c)
    );
    const { error: colErr } = await to
      .from(t.name)
      .select(cols.length > 0 ? cols.join(",") : "*")
      .limit(0);
    if (colErr) {
      problems.push(`${t.name}: target schema does not match the source — ${colErr.message}`);
      continue;
    }

    // Rows in the target that did not come from the source mean something else
    // was loaded first — almost always seed.sql. Upserting on top would collide
    // on unique slugs and leave a mixed catalogue.
    try {
      target[t.name] = await readAll(to, t.name, t.key);
    } catch (err) {
      // Collected rather than thrown, so every problem is reported in one pass
      problems.push(err.message);
      continue;
    }
    const srcKeys = new Set(rows.map((r) => rowKey(r, t.key)));
    const foreign = target[t.name].filter((r) => !srcKeys.has(rowKey(r, t.key)));
    if (foreign.length > 0) {
      const sample = foreign.slice(0, 3).map((r) => r.slug ?? r.name ?? r.title ?? rowKey(r, t.key));
      problems.push(
        `${t.name}: target already holds ${foreign.length} row(s) that are not in the source (e.g. ${sample.join(", ")}). ` +
          `Was seed.sql run? Empty these tables or recreate the project and run only schema.sql.`
      );
    } else if (target[t.name].length > 0) {
      ok(`${t.name}: ${target[t.name].length} row(s) already copied by an earlier run — will be updated`);
    }
  }

  if (problems.length > 0) {
    head("Cannot continue:");
    problems.forEach((p) => warn(p));
    process.exit(1);
  }
  ok("schema matches, no foreign rows");

  // ---- 3. Plan ---------------------------------------------------------------
  head("Plan");

  const dstFiles = bucketErr ? [] : await listStorage(to);
  const dstSizes = new Map(dstFiles.map((f) => [f.path, f.size]));
  const toCopy = srcFiles.filter((f) => dstSizes.get(f.path) !== f.size);
  ok(`images: ${toCopy.length} to copy, ${srcFiles.length - toCopy.length} already present`);

  // URLs that point at the old project, and whether the file they name exists
  const storagePrefix = `${srcOrigin}/storage/v1/object/public/`;
  const srcPaths = new Set(srcFiles.map((f) => `${BUCKET}/${f.path}`));
  let urlCount = 0;
  const dangling = [];
  for (const t of TABLES) {
    for (const row of source[t.name]) {
      for (const url of findOrigin(row, srcOrigin)) {
        urlCount++;
        const objectPath = url.startsWith(storagePrefix) ? url.slice(storagePrefix.length).split("?")[0] : null;
        if (!objectPath || !srcPaths.has(decodeURIComponent(objectPath))) {
          dangling.push(`${t.name}: ${url}`);
        }
      }
    }
  }
  ok(`${urlCount} stored URL(s) will be rewritten to ${dstOrigin}`);
  if (dangling.length > 0) {
    warn(`${dangling.length} URL(s) name a file that is not in the source bucket — they are already broken and will stay broken:`);
    dangling.forEach((d) => log(`      ${d}`));
  }

  const totalRows = TABLES.reduce((n, t) => n + source[t.name].length, 0);
  ok(`${totalRows} rows across ${TABLES.length} tables`);

  if (!APPLY) {
    head("Dry run complete. Nothing was written.");
    log("  Re-run with --apply to copy.");
    process.exit(0);
  }

  // ---- 4. Copy images ------------------------------------------------------
  // Images go first, so no copied row ever points at a file that isn't there yet.
  head("Copying images");
  for (const [i, f] of toCopy.entries()) {
    const { data: blob, error: dlErr } = await from.storage.from(BUCKET).download(f.path);
    if (dlErr) throw new Error(`downloading ${f.path}: ${dlErr.message}`);
    const { error: upErr } = await to.storage.from(BUCKET).upload(f.path, blob, {
      contentType: f.contentType,
      cacheControl: IMAGE_CACHE_CONTROL,
      upsert: true,
    });
    if (upErr) throw new Error(`uploading ${f.path}: ${upErr.message}`);
    log(`  ${String(i + 1).padStart(String(toCopy.length).length)}/${toCopy.length}  ${f.path}`);
  }
  ok(toCopy.length > 0 ? "images copied" : "nothing to copy");

  // ---- 5. Copy rows --------------------------------------------------------
  head("Copying rows");
  for (const t of TABLES) {
    const rows = source[t.name].map((r) => {
      const copy = rewrite(r);
      for (const c of t.drop ?? []) delete copy[c];
      return copy;
    });
    if (rows.length === 0) {
      ok(`${t.name}: none`);
      continue;
    }

    if (t.name === "categories") {
      // One depth level per request, so every parent exists before its children.
      const depth = categoryDepths(rows);
      const levels = Math.max(...depth.values()) + 1;
      for (let d = 0; d < levels; d++) {
        await upsert(to, t.name, rows.filter((r) => depth.get(r.id) === d), t.key);
      }
      ok(`${t.name}: ${rows.length} across ${levels} levels`);
    } else {
      await upsert(to, t.name, rows, t.key);
      ok(`${t.name}: ${rows.length}`);
    }
  }

  // ---- 6. Verify -------------------------------------------------------------
  head("Verifying target");
  let mismatch = false;
  for (const t of TABLES) {
    const after = await readAll(to, t.name, t.key);
    const leftovers = after.flatMap((r) => findOrigin(r, srcOrigin));
    if (after.length !== source[t.name].length) {
      mismatch = true;
      warn(`${t.name}: source ${source[t.name].length}, target ${after.length}`);
    } else if (leftovers.length > 0) {
      mismatch = true;
      warn(`${t.name}: ${leftovers.length} value(s) still point at the old project`);
    } else {
      ok(`${t.name}: ${after.length} rows, no old URLs`);
    }
  }
  const finalFiles = await listStorage(to);
  const finalPaths = new Set(finalFiles.map((f) => f.path));
  const missing = srcFiles.filter((f) => !finalPaths.has(f.path));
  if (missing.length > 0) {
    mismatch = true;
    warn(`${missing.length} image(s) missing from the target: ${missing.map((f) => f.path).join(", ")}`);
  } else {
    ok(`storage: all ${srcFiles.length} images present`);
  }

  // ---- 7. Admin accounts -------------------------------------------------------
  head("Admin accounts (not copied — re-invite these)");
  const [srcUsers, dstUsers] = await Promise.all([listUsers(from), listUsers(to)]);
  const already = new Set(dstUsers.map((u) => u.email));
  for (const u of srcUsers) {
    const seen = u.last_sign_in_at ? `last signed in ${u.last_sign_in_at.slice(0, 10)}` : "never signed in";
    log(`  ${already.has(u.email) ? "✓ exists " : "· invite "} ${u.email}  (${seen})`);
  }

  if (mismatch) fail("Copied, but verification found differences — see warnings above.");
  head("Done. The source project was not modified.");
} catch (err) {
  fail(err.message);
}
