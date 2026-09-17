-- ============================================================
-- Featured products — curated homepage selection
-- Run once in the Supabase SQL Editor (idempotent).
--
-- Replaces the hard-coded `featuredSlugs` array that used to live in
-- app/page.tsx, so the client can change the homepage selection from the
-- admin panel instead of needing a code change and a redeploy.
-- ============================================================

alter table products
  add column if not exists is_featured   boolean not null default false,
  add column if not exists featured_sort integer not null default 0;

-- Partial index: the homepage only ever asks for the featured rows, and in a
-- catalogue of thousands that is a tiny fraction of the table.
create index if not exists idx_products_featured
  on products(featured_sort, name)
  where is_featured;

comment on column products.is_featured is
  'Show this product in the Featured machines section of the homepage.';
comment on column products.featured_sort is
  'Order within the featured list — lower first, ties broken by name.';

-- ------------------------------------------------------------
-- Seed the current selection so the homepage is not empty on first deploy.
-- Only the two slugs that actually exist are listed here; the previous
-- hard-coded array also named cnc-lathe-1020 and rtm-u324, which were left
-- over from the old static catalogue and have never existed in this database.
-- ------------------------------------------------------------
update products
   set is_featured = true,
       featured_sort = case slug
         when 'vmc-850' then 1
         when 'vmc-650' then 2
         else 0
       end
 where slug in ('vmc-850', 'vmc-650');

-- Existing RLS policies on `products` cover these columns: public read,
-- authenticated write. No policy changes needed.
