-- ============================================================
-- Related products — manually curated per product
-- Run once in the Supabase SQL Editor (idempotent).
-- ============================================================

create table if not exists related_products (
  product_id         uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  sort_order         integer not null default 0,
  primary key (product_id, related_product_id),
  check (product_id <> related_product_id)
);

create index if not exists idx_related_products_product on related_products(product_id);

alter table related_products enable row level security;

drop policy if exists "Public read related_products" on related_products;
create policy "Public read related_products"
  on related_products for select using (true);

drop policy if exists "Admin all related_products" on related_products;
create policy "Admin all related_products"
  on related_products for all using (auth.role() = 'authenticated');
