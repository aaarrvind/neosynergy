# PLAN: Product URL canonicalization, legacy-path redirects, and search fallback

**Rank: 5 of 5. Do this AFTER PLAN-fix-public-content-pipeline (it depends on the DB tree
being the single source of truth for URLs).**

## Goal

Three related correctness/SEO problems in the public catalog routing:

1. **Any URL ending in a valid product slug renders the product.**
   [app/products/[[...slug]]/page.tsx](app/products/[[...slug]]/page.tsx) resolves products
   by the LAST path segment only (`getProductBySlug(slugs[slugs.length - 1])`, lines
   404–406) and never checks that the preceding segments match the product's real category
   path. `/products/anything/at/all/vmc-850` renders fine, and its
   `<link rel="canonical">` echoes the wrong URL (metadata uses `slugs.join("/")`,
   line 72) — infinite duplicate-content URLs, each self-canonicalizing.
2. **Old flat category URLs 404 after the content pipeline fix.** The static-fallback tree
   used flat slugs (`/products/cnc-lathes`); the DB tree nests them
   (`/products/machine-tools/cnc-lathes`). Any indexed/bookmarked flat URL breaks.
3. **Site search is dead without Supabase.** `searchCatalog` in
   [lib/supabase/queries.ts:351](lib/supabase/queries.ts:351) returns `[]` in its catch,
   even though a full static catalog exists in `lib/data/` — in fallback mode the search
   modal silently finds nothing.

## Files to touch

1. `app/products/[[...slug]]/page.tsx` — canonical path enforcement + redirects
2. `lib/supabase/queries.ts` — static search fallback
3. `app/robots.ts` — disallow `/admin`

## Implementation order

### Step 1 — Enforce the canonical product path with a redirect

In the default export of `app/products/[[...slug]]/page.tsx` (lines 387–409), after
`getProductBySlug(productSlug)` succeeds, compare the requested category segments with the
product's true path:

```ts
import { redirect } from "next/navigation"; // add to existing next/navigation import

const requestedPath = slugs.slice(0, -1).join("/");
const canonicalPath = product.categoryPath.join("/");
if (requestedPath !== canonicalPath && canonicalPath) {
  redirect(`/products/${canonicalPath}/${product.slug}`);
}
```

Do the same check in `generateMetadata` (lines 64–74): when the requested path is
non-canonical, return `{}` (the page will redirect anyway; don't emit metadata for a
non-canonical URL). When canonical, build `alternates.canonical` from
`product.categoryPath`, not from the request's `slugs`.

### Step 2 — Redirect legacy flat category URLs

Still in the default export, before calling `notFound()`: if `slugs.length === 1` and no
category/product matched, search the flattened tree for a node whose LAST path segment
equals `slugs[0]`:

```ts
const legacy = flat.find(n => n.pathSlugs[n.pathSlugs.length - 1] === slugs[0]);
if (legacy) redirect(`/products/${legacy.pathSlugs.join("/")}`);
```

`redirect()` issues a 307; that's acceptable. (If you want 308/301 for SEO, use
`permanentRedirect()` from `next/navigation` instead — prefer `permanentRedirect` here
since these mappings are stable.)

### Step 3 — Static search fallback in `queries.ts`

Rewrite `searchCatalog`'s catch/unconfigured path to search the static data instead of
returning `[]`. Match the `SearchResult` shape used by
[components/SearchModal.tsx](components/SearchModal.tsx) — it consumes
`{ type, id, name, tagline, image, slug, path_slugs }` (see `lib/types.ts` for the exact
interface; check it before writing). Implementation:

```ts
function staticSearch(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const prods = staticProducts
    .filter(p => p.name.toLowerCase().includes(q) || p.tagline.toLowerCase().includes(q)
      || (p.keywords ?? []).some(k => k.toLowerCase().includes(q)))
    .map(p => ({ type: "product" as const, id: p.slug, name: p.name, tagline: p.tagline,
      image: p.image, slug: p.slug, path_slugs: [p.categorySlug] }));
  const cats = getStaticFlatCategories()
    .filter(c => c.name.toLowerCase().includes(q) || c.intro.toLowerCase().includes(q))
    .map(c => ({ type: "category" as const, id: c.id, name: c.name, tagline: c.intro,
      image: c.heroImage, slug: c.slug, path_slugs: c.pathSlugs }));
  return [...prods, ...cats].slice(0, 20);
}
```

Use it both when Supabase is unconfigured and when the RPC errors (log the error first,
same policy as PLAN-fix-public-content-pipeline).

### Step 4 — robots.txt

In [app/robots.ts](app/robots.ts), add `"/admin"` and `"/admin-login"` to the `disallow`
array (the admin pages already have a noindex meta tag via their layout, but robots should
not invite crawling at all; note `/quote` is a normal user page — leave it allowed).

### Step 5 — Build and crawl-check

`npm run build && npm run start`, then verify the acceptance criteria below with `curl -i`.

## Edge cases a weaker model would miss

1. **`redirect()` throws — never wrap it in try/catch**, and don't call it after starting
   to build JSX. Both call sites in Step 1/2 must be plain top-level statements in the
   async component.
2. **`product.categoryPath` can be empty** when the product's category id isn't found in
   the tree (`getProductBySlug` line 284: `node?.pathSlugs ?? []`). The `&& canonicalPath`
   guard in Step 1 prevents a redirect loop to `/products//slug` in that degraded case —
   keep it.
3. **A category and a product could share a slug.** The router checks category paths
   first (line 400), so `/products/<x>` resolves as category when both exist. The legacy
   redirect in Step 2 runs only after both checks miss, so it cannot shadow a product.
   Preserve this ordering.
4. **In static-fallback mode, product URLs are `/products/<categorySlug>/<slug>`** (single
   category segment). The Step 1 canonical check must still pass there:
   `product.categoryPath` is `[p.categorySlug]` in fallback mode, so it does — don't
   special-case it.
5. **`generateMetadata` runs before the page component** and independently resolves the
   product; if you only fix the page, non-canonical URLs still emit self-referencing
   canonicals in the brief window before redirect. Fix both (Step 1 covers this).
6. **SearchModal's href builder** (line 53) builds product links as
   `/products/${path_slugs.join("/")}/${slug}` — the static fallback's `path_slugs:
   [p.categorySlug]` matches that contract. Don't return `path_slugs: []` or search
   results will link to `/products//slug`.
7. **Case sensitivity:** DB search uses `ilike`; make the static fallback lowercase both
   sides (the snippet above does).

## Acceptance criteria

Run with real Supabase env (`.env.local` as-is), production build.

- [ ] `curl -i localhost:3000/products/wrong/path/vmc-850` (use any real product slug from
      the DB) → 308 to the product's true `/products/<real-category-path>/<slug>`; the
      destination returns 200 and its HTML contains
      `rel="canonical" href=".../products/<real-category-path>/<slug>"`.
- [ ] `curl -i localhost:3000/products/cnc-lathes` (legacy flat slug) → 308 to the nested
      DB path, which returns 200.
- [ ] `curl -i localhost:3000/products/definitely-not-real` → 404.
- [ ] Canonical product URL renders exactly as before (no redirect, 200).
- [ ] With `NEXT_PUBLIC_SUPABASE_URL=placeholder npm run dev`:
      `curl "localhost:3000/api/search?q=lathe"` returns non-empty `results` including a
      product with `path_slugs` of length ≥ 1; the search modal in the browser shows
      results and clicking one navigates to a working page.
- [ ] `curl localhost:3000/robots.txt` shows `Disallow: /admin` and existing `/api/` rule.
- [ ] `npm run build` passes.
