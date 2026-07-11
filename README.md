# Neo Synergy Machinery Trading — Website

A custom-built, SEO-optimized website for **Neo Synergy Machinery Trading L.L.C.** (Dubai, UAE), built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**.

It includes the full company profile (about, vision/mission, team, services), a product catalog organized into 7 categories with detailed spec sheets for key machines, and a **quote-request cart**: visitors add machines/accessories to a cart, review and annotate items, and submit their details — which sends an itemized email to your sales team plus a confirmation email to the customer.

---

## 1. Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

To create a production build:

```bash
npm run build
npm run start
```

---

## 2. Project structure

```
app/                      Pages (App Router)
  page.tsx                 Home
  about/                   Company / vision / mission / team
  services/                Services overview
  products/                Category grid
  products/[category]/     Category listing (models + catalog items)
  products/[category]/[slug]/  Individual product page (specs)
  quote/                   Cart review + quote request form
  contact/                 Contact info + general enquiry form
  api/quote/route.ts       Sends quote/enquiry emails (Resend)
  sitemap.ts, robots.ts    SEO files

components/                UI components (Header, Footer, ProductCard,
                            SpecReadout, CartDrawer, QuoteForm, etc.)

lib/
  data/company.ts           Company info, vision/mission, team copy
  data/services.ts          The 6 services
  data/categories.ts         The 7 product categories + simple catalog items
  data/products.ts          Detailed products with full spec tables
  cart-context.tsx          Quote-cart state (persisted to localStorage)
  types.ts                  Shared TypeScript types

public/images/              Photos extracted from the original company
                            profile PDF, plus the logo
```

---

## 3. Editing content

All text content lives in `lib/data/*.ts` as plain TypeScript objects —
no database required for the current catalog size.

- **Company info, vision/mission, team copy:** `lib/data/company.ts`
- **Services:** `lib/data/services.ts`
- **Categories & simple catalog items** (accessories, DRO/scales, CNC
  retrofit controllers, robotics): `lib/data/categories.ts`
- **Detailed products with spec tables** (VMC 650/850, CNC lathe, tapping
  machine): `lib/data/products.ts`

To add a new detailed product, add an entry to `products` in
`lib/data/products.ts` with a unique `slug`, the `categorySlug` it belongs
to, `specGroups` (grouped spec rows), and an image in `public/images/`.
A page is generated automatically at
`/products/<categorySlug>/<slug>`.

To add a simple "add to quote" item without a full spec page (e.g. a new
accessory), add it to that category's `catalogItems` array in
`lib/data/categories.ts`.

---

## 4. The quote-request flow

1. Every product/catalog item has an **"Add to quote"** button
   (`components/AddToQuoteButton.tsx`). Items with multiple models (e.g.
   the tapping machine's 1500/1900 RPM variants) show a model selector
   first.
2. Added items are stored in a React context (`lib/cart-context.tsx`) and
   persisted to the browser's `localStorage`, so the cart survives page
   reloads and navigation.
3. The cart icon in the header opens a slide-over drawer
   (`components/CartDrawer.tsx`) showing items, quantities, and a link to
   **Review & request quote**.
4. `/quote` (`components/QuoteForm.tsx`) lets the visitor adjust
   quantities, add a note per item (e.g. voltage, configuration), and
   enter their contact details.
5. On submit, the form posts to `app/api/quote/route.ts`, which:
   - builds an itemized HTML email and sends it to your sales team, and
   - sends a confirmation copy to the customer.

### Configuring email sending

The quote API uses [Resend](https://resend.com) (a transactional email
API). Copy `.env.example` to `.env.local` and fill in:

```
RESEND_API_KEY=your_resend_api_key
QUOTE_FROM_EMAIL="Neo Synergy Website <quotes@neosynergy.ae>"
SALES_EMAILS="sales@neosynergy.ae,info@neosynergy.ae"
```

You'll need to verify a sending domain in Resend (e.g. `neosynergy.ae`) so
`QUOTE_FROM_EMAIL` can use that domain.

**If `RESEND_API_KEY` is not set**, the API route logs the full
submission (contact details + items) to the server console and returns
success — this lets you test the entire flow locally without an email
account. Swapping in Resend (or any other provider — SendGrid, Mailgun,
SMTP via Nodemailer, etc.) only requires editing `app/api/quote/route.ts`.

---

## 5. SEO

- Per-page `metadata` (title, description, canonical URL) is set in each
  `page.tsx`, using a title template defined in `app/layout.tsx`.
- `app/sitemap.ts` and `app/robots.ts` generate `/sitemap.xml` and
  `/robots.txt` automatically from the categories/products data.
- `Organization` JSON-LD is included site-wide (`app/layout.tsx`), and
  `Product` JSON-LD is included on each product page.
- Update `company.website` in `lib/data/company.ts` if the production
  domain changes — it's used for `metadataBase`, canonical URLs, and the
  sitemap.
- Each category and product page has its own `metaDescription` /
  `keywords` field in `lib/data/categories.ts` and
  `lib/data/products.ts` — update these as you learn which search terms
  bring in traffic.

---

## 6. Moving to a headless CMS (optional)

The current data layer (`lib/data/*.ts`) is intentionally shaped like
content you'd pull from a CMS — each `Product` and `Category` is a plain
object with a stable `slug`. If you outgrow editing TypeScript files
directly, you can:

1. Create matching schemas in a headless CMS (e.g. **Sanity**,
   **Contentful**, or **Payload**).
2. Replace the `getProduct` / `getProductsByCategory` / `getCategory`
   helper functions in `lib/data/*.ts` with calls to the CMS's API
   (these are the **only** places the rest of the app needs to change,
   since all pages import from these helpers).
3. Re-run `generateStaticParams` in the `[category]` and `[slug]` pages
   — they already iterate over `categories` / `products`, so switching
   those to CMS-backed arrays is enough for static generation to keep
   working.

---

## 7. Images

Product and lifestyle photos in `public/images/` were extracted from the
original company profile PDF. Replace any of them with higher-resolution
studio photography as it becomes available — just keep the same filename
(referenced from `lib/data/*.ts`) or update the `image` field.

---

## 8. Deployment

This is a standard Next.js app and deploys cleanly to **Vercel** (1-click,
recommended), or any Node host that can run `npm run build && npm run
start`. Set the environment variables from `.env.example` in your hosting
provider's dashboard.

After deploying:

1. Point your domain (`neosynergy.ae`) at the deployment.
2. Submit `/sitemap.xml` to Google Search Console.
3. Set up the Resend sending domain and environment variables so quote
   requests are emailed.

---

## 9. Admin panel

The admin panel lives at `/admin` (protected by Supabase Auth) and `/admin-login` (the login page).

### What you can manage

- **Categories** — name, slug, description, hero image, meta description, and catalog items (simple quote-able accessories with no dedicated spec page)
- **Products** — full spec-sheet products with name, tagline, images, variant selectors, spec builder (groups → rows), standard equipment lists, and SEO keywords
- **Services** — the six (or more) service offerings shown on the Services page

### Setting up auth

1. In your Supabase project, go to **Authentication → Users** and create a user (e.g. admin@neosynergy.ae) with a strong password. This user will have access to the admin panel.
2. In **Authentication → Settings**, disable public signups (so only manually created users can log in).

### Image uploads

Images in the admin panel upload to Supabase Storage (the `images` bucket). The schema.sql creates this bucket and sets the correct RLS policies. Any uploaded images get a public CDN URL that's stored in the database and served directly.

### Seeding initial data

After running schema.sql in the SQL Editor, run seed.sql to populate the database with all the content from the original company profile (categories, products with full spec tables, services, and catalog items). This gives you a complete working dataset immediately.

### Admin URL structure

| URL | Purpose |
|---|---|
| /admin-login | Login page |
| /admin | Dashboard with content counts |
| /admin/categories | List all categories |
| /admin/categories/new | Create a new category |
| /admin/categories/[id] | Edit category + manage its catalog items |
| /admin/products | List all products |
| /admin/products/new | Create a new product with spec builder |
| /admin/products/[id] | Edit product and its spec groups/rows |
| /admin/services | List all services |
| /admin/services/new | Create a new service |
| /admin/services/[id] | Edit a service |
