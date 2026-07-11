# PLAN: Fix the public content pipeline (Supabase data never reaches public pages)

**Rank: 1 of 5 — do this first.**

## Goal

Make the public site actually serve content from Supabase. Today the admin panel edits the
database, but the public product pages are **prerendered at build time with the hard-coded
static fallback data** from `lib/data/*.ts`, and there is no revalidation — so admin edits
never appear on the live site. Additionally, two different URL trees exist simultaneously
(flat fallback paths like `/products/cnc-lathes` and DB paths like
`/products/machine-tools/...`), and the sitemap disagrees with the prerendered pages.

## Root cause (verified — do not re-investigate)

- Every public read goes through `lib/supabase/queries.ts`, which calls
  `createServerSupabaseClient()` from [lib/supabase/server.ts](lib/supabase/server.ts).
  That function calls `cookies()` from `next/headers`.
- `/products/[[...slug]]/page.tsx` has `generateStaticParams`, so Next.js prerenders it at
  build time. During prerendering, `cookies()` throws `DynamicServerError`.
- Every function in `queries.ts` wraps its body in `try { ...supabase... } catch { return
  staticFallback }`. The catch **swallows the DynamicServerError**, so Next.js never learns
  the page is dynamic and bakes the static fallback data into the SSG output.
- `npm run build` output confirms it: `● /products/[[...slug]]` is SSG, and the generated
  paths are the flat static slugs (`/products/vertical-milling-centers`,
  `/products/cnc-lathes`, …) — NOT the DB tree (`/products/machine-tools/...`).
- There is no `export const revalidate` anywhere in the repo (verified by grep), so these
  stale pages never refresh.
- Meanwhile `app/sitemap.ts` and `app/layout.tsx` (header/footer nav) render dynamically at
  request time, DO reach Supabase, and emit the DB paths — so nav/sitemap link to a
  different URL tree than the prerendered pages.

## Files to touch

1. `lib/supabase/public.ts` — **new file**
2. `lib/supabase/queries.ts` — switch client, fix fallback semantics
3. `app/products/[[...slug]]/page.tsx` — add revalidation
4. `app/sitemap.ts` — add revalidation
5. `app/layout.tsx` — no change needed unless verification fails (see step 6)

## Implementation order

### Step 1 — Create a cookie-free public client

Create `lib/supabase/public.ts`:

```ts
import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for PUBLIC reads (anon key, RLS public-read
 * policies). Safe to call during build/ISR where next/headers is unavailable.
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes("placeholder");
}
```

### Step 2 — Switch `queries.ts` to the public client and fix fallback semantics

In [lib/supabase/queries.ts](lib/supabase/queries.ts):

- Replace `import { createServerSupabaseClient } from "./server";` with imports from
  `./public`.
- Replace every `const supabase = createServerSupabaseClient();` (occurs in
  `getCategoryTree`, `getProductsByCategory`, `getProductBySlug`, `getAllProductSlugs`,
  `getServices`, `searchCatalog`) with `const supabase = createPublicSupabaseClient();`.
- Change the fallback policy in each function from "any error → static fallback" to:
  - If `!isSupabaseConfigured()` → return the static fallback (keep the current fallback
    code paths; they support local dev without a database).
  - If configured but the query errors → `console.error("[queries] <fn> failed:", error)`
    and **still return the static fallback for reads** (the site must not 500), BUT the
    error must be logged so failures are visible. Do not silently swallow.
- Keep `_treeCache` (30s TTL) as is — it is per-server-instance and harmless under ISR.

Do NOT delete `lib/supabase/server.ts` — the admin pages and API routes still need the
cookie-aware client for auth.

### Step 3 — Add ISR revalidation to the products page

In [app/products/[[...slug]]/page.tsx](app/products/[[...slug]]/page.tsx), add at the top
(module scope, alongside `generateStaticParams`):

```ts
export const revalidate = 300; // re-render from Supabase every 5 minutes
```

### Step 4 — Add revalidation to the sitemap

In [app/sitemap.ts](app/sitemap.ts) add `export const revalidate = 3600;`.

### Step 5 — Rebuild and inspect the route table

Run `npm run build`. In the output:

- `/products/[[...slug]]` must still be `●` (SSG/ISR), and the listed sample paths must now
  be the **DB tree paths** (e.g. `/products/machine-tools`, `/products/automation-robotics`,
  and nested children), not the flat fallback slugs. `.env.local` in this repo has real
  Supabase credentials, so the build can reach the DB.
- If the paths are still the flat fallback slugs, `generateStaticParams` is still failing —
  add a temporary `console.error` in the catch blocks to see why before proceeding.

### Step 6 — Verify the layout nav and prerendered pages agree

Run `npm run start` (or `npm run dev`) and check that the mega-menu category links
(rendered by `app/layout.tsx` → `Header`) land on prerendered category pages without a 404,
and that the breadcrumb paths on a product page match the URL.

Known trap while verifying: `app/layout.tsx` reads `headers().get("x-next-pathname")` to
decide whether to skip the public Header/Footer for `/admin` routes. During static
prerendering, `headers()` may make the page dynamic or return empty. If Step 5 shows the
products route flipped to `ƒ` (dynamic), the culprit is the root layout, not your changes —
in that case leave the products page dynamic-with-`revalidate` (Next will still cache) and
note it, rather than fighting the layout in this task.

## Edge cases a weaker model would miss

1. **The catch blocks are load-bearing for two different situations.** They currently
   handle both "Supabase not configured" AND "Next.js threw DynamicServerError from
   cookies()". Removing them entirely breaks local dev without a DB; keeping them as-is
   keeps the bug. The fix is switching to a cookie-free client (removes the
   DynamicServerError case) while keeping an explicit configured-check for the dev case.
2. **The static fallback and the DB use different URL shapes.** Fallback categories are
   flat (`pathSlugs: [c.slug]`, depth 0); DB categories are a 2–3 level tree. Any cached
   HTML built from the fallback links to URLs that don't exist in the DB tree and
   vice-versa. After this fix, old flat URLs (e.g. `/products/cnc-lathes`) will render
   on-demand as catch-all misses: the DB has a *nested* `cnc-lathes` under `machine-tools`,
   and `findNodeByPath(tree, ["cnc-lathes"])` matches on the FULL path string, so
   `/products/cnc-lathes` falls through to the product-slug branch and then 404s. That is
   acceptable for now (canonical URL handling is PLAN-seo-canonical-and-search-fallback),
   but do not "fix" it here by matching partial paths.
3. **`getProductsByCategory` in fallback mode keys on `categorySlug`, in DB mode on the
   category UUID.** Callers pass `node.id`, which is the slug in fallback mode and a UUID
   in DB mode — the two fallback paths are consistent with each other; don't unify them.
4. **On-demand ISR caching:** without `revalidate`, a catch-all path rendered on demand is
   cached indefinitely. That's why `revalidate` is required even though the pages "work"
   when first visited.
5. **Do not use the public client in admin code paths.** Admin pages rely on the
   cookie-aware client so RLS `authenticated` policies apply.

## Acceptance criteria

- [ ] `npm run build` succeeds; `/products/[[...slug]]` sample paths in the build output are
      DB tree paths (contain `machine-tools` / `automation-robotics` / `accessories-tooling`
      style roots), not the seven flat fallback slugs.
- [ ] With the dev server running (`npm run dev`), edit a product's tagline in
      `/admin/products/[id]`, save, then reload the public product page: after at most the
      revalidate window (or immediately in dev), the new tagline appears. In production mode
      (`npm run build && npm run start`), the change appears after ≤300s on next request.
- [ ] `curl -s localhost:3000/sitemap.xml` lists the same category/product URLs that the
      mega-menu links to (spot-check 3 URLs; each returns HTTP 200).
- [ ] With `NEXT_PUBLIC_SUPABASE_URL` unset or containing `placeholder`
      (e.g. `NEXT_PUBLIC_SUPABASE_URL=placeholder npm run build`), the build still succeeds
      and pages render the static fallback catalog — local-dev-without-DB still works.
- [ ] No public page imports `lib/supabase/server.ts` (grep: only admin pages, admin API
      routes, and middleware may import it).
