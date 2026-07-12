-- ============================================================
-- Neo Synergy — Full Schema v2
-- Self-referencing category tree + unified products table
-- Run in Supabase SQL Editor
-- ============================================================

create extension if not exists "pgcrypto";
create extension if not exists pg_trgm; -- for full-text search

-- ---------------------------------------------------------------
-- SERVICES (unchanged)
-- ---------------------------------------------------------------
create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  name          text not null,
  short_description text not null default '',
  description   jsonb not null default '[]',
  icon          text not null default 'Cog',
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- CATEGORIES — self-referencing tree (unlimited depth)
-- ---------------------------------------------------------------
create table if not exists categories (
  id               uuid primary key default gen_random_uuid(),
  parent_id        uuid references categories(id) on delete cascade,
  slug             text not null,
  name             text not null,
  short_name       text not null default '',
  intro            text not null default '',
  description      jsonb not null default '[]',
  hero_image       text not null default '',
  meta_description text not null default '',
  sort_order       integer not null default 0,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),
  -- slug must be unique within siblings (same parent)
  unique (parent_id, slug)
);

-- index for tree traversal
create index if not exists idx_categories_parent on categories(parent_id);
create index if not exists idx_categories_slug   on categories(slug);

-- ---------------------------------------------------------------
-- PRODUCTS — unified (replaces old products + catalog_items)
-- Every product belongs to exactly one category (any level)
-- Spec groups/rows are separate tables (unchanged)
-- Images are in product_images table
-- ---------------------------------------------------------------
create table if not exists products (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique,
  category_id        uuid not null references categories(id) on delete cascade,
  name               text not null,
  tagline            text not null default '',
  description        jsonb not null default '[]',
  -- primary/hero image kept for quick rendering (card thumbnails)
  image              text not null default '',
  variants           jsonb,
  standard_equipment jsonb,
  keywords           jsonb not null default '[]',
  sort_order         integer not null default 0,
  -- search vector updated by trigger
  search_vector      tsvector,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

create index if not exists idx_products_category     on products(category_id);
create index if not exists idx_products_search       on products using gin(search_vector);

-- ---------------------------------------------------------------
-- PRODUCT IMAGES — gallery (multiple per product, ordered)
-- ---------------------------------------------------------------
create table if not exists product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  url        text not null,
  alt        text not null default '',
  sort_order integer not null default 0
);

create index if not exists idx_product_images_product on product_images(product_id);

-- ---------------------------------------------------------------
-- RELATED PRODUCTS — manually curated per product, ordered
-- ---------------------------------------------------------------
create table if not exists related_products (
  product_id         uuid not null references products(id) on delete cascade,
  related_product_id uuid not null references products(id) on delete cascade,
  sort_order         integer not null default 0,
  primary key (product_id, related_product_id),
  check (product_id <> related_product_id)
);

create index if not exists idx_related_products_product on related_products(product_id);

-- ---------------------------------------------------------------
-- SPEC GROUPS + ROWS (unchanged structure)
-- ---------------------------------------------------------------
create table if not exists spec_groups (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references products(id) on delete cascade,
  title      text not null,
  sort_order integer not null default 0
);

create table if not exists spec_rows (
  id            uuid primary key default gen_random_uuid(),
  spec_group_id uuid not null references spec_groups(id) on delete cascade,
  label         text not null,
  value         text,
  values        jsonb,
  sort_order    integer not null default 0
);

create index if not exists idx_spec_groups_product on spec_groups(product_id);
create index if not exists idx_spec_rows_group     on spec_rows(spec_group_id);

-- ---------------------------------------------------------------
-- RECURSIVE category tree function
-- Returns flat list with depth + full path info
-- ---------------------------------------------------------------
create or replace function get_category_tree()
returns table (
  id            uuid,
  parent_id     uuid,
  slug          text,
  name          text,
  short_name    text,
  intro         text,
  description   jsonb,
  hero_image    text,
  meta_description text,
  sort_order    integer,
  depth         integer,
  path_ids      uuid[],
  path_slugs    text[],
  path_names    text[]
) language sql stable as $$
  with recursive tree as (
    -- Root nodes
    select
      c.id, c.parent_id, c.slug, c.name, c.short_name,
      c.intro, c.description, c.hero_image, c.meta_description, c.sort_order,
      0 as depth,
      array[c.id] as path_ids,
      array[c.slug] as path_slugs,
      array[c.name] as path_names
    from categories c
    where c.parent_id is null

    union all

    -- Children
    select
      c.id, c.parent_id, c.slug, c.name, c.short_name,
      c.intro, c.description, c.hero_image, c.meta_description, c.sort_order,
      t.depth + 1,
      t.path_ids   || c.id,
      t.path_slugs || c.slug,
      t.path_names || c.name
    from categories c
    join tree t on c.parent_id = t.id
  )
  select * from tree
  order by path_slugs;
$$;

-- ---------------------------------------------------------------
-- Search function across products + categories
-- ---------------------------------------------------------------
create or replace function search_catalog(query text)
returns table (
  type       text,
  id         uuid,
  name       text,
  tagline    text,
  image      text,
  slug       text,
  path_slugs text[]
) language sql stable as $$
  -- Products
  select
    'product' as type,
    p.id,
    p.name,
    p.tagline,
    p.image,
    p.slug,
    ct.path_slugs
  from products p
  join get_category_tree() ct on ct.id = p.category_id
  where
    p.search_vector @@ plainto_tsquery('english', query)
    or p.name ilike '%' || query || '%'
    or p.tagline ilike '%' || query || '%'

  union all

  -- Categories
  select
    'category' as type,
    ct.id,
    ct.name,
    ct.intro as tagline,
    ct.hero_image as image,
    ct.slug,
    ct.path_slugs
  from get_category_tree() ct
  where
    ct.name ilike '%' || query || '%'
    or ct.intro ilike '%' || query || '%'

  order by name
  limit 20;
$$;

-- ---------------------------------------------------------------
-- Search vector trigger
-- ---------------------------------------------------------------
create or replace function update_product_search_vector()
returns trigger language plpgsql as $$
begin
  new.search_vector :=
    setweight(to_tsvector('english', coalesce(new.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(new.tagline, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(new.description::text, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(new.keywords::text, '')), 'C');
  return new;
end;
$$;

drop trigger if exists trg_product_search on products;
create trigger trg_product_search
  before insert or update on products
  for each row execute function update_product_search_vector();

-- ---------------------------------------------------------------
-- updated_at triggers
-- ---------------------------------------------------------------
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists set_updated_at_services   on services;
drop trigger if exists set_updated_at_categories on categories;
drop trigger if exists set_updated_at_products   on products;

create trigger set_updated_at_services
  before update on services for each row execute function set_updated_at();
create trigger set_updated_at_categories
  before update on categories for each row execute function set_updated_at();
create trigger set_updated_at_products
  before update on products for each row execute function set_updated_at();

-- ---------------------------------------------------------------
-- Row-Level Security
-- ---------------------------------------------------------------
alter table services         enable row level security;
alter table categories       enable row level security;
alter table products         enable row level security;
alter table product_images   enable row level security;
alter table spec_groups      enable row level security;
alter table spec_rows        enable row level security;
alter table related_products enable row level security;

-- Public read
create policy "Public read services"         on services         for select using (true);
create policy "Public read categories"       on categories       for select using (true);
create policy "Public read products"         on products         for select using (true);
create policy "Public read product_images"   on product_images   for select using (true);
create policy "Public read spec_groups"      on spec_groups      for select using (true);
create policy "Public read spec_rows"        on spec_rows        for select using (true);
create policy "Public read related_products" on related_products for select using (true);

-- Authenticated (admin) full access
create policy "Admin all services"        on services        for all using (auth.role() = 'authenticated');
create policy "Admin all categories"      on categories      for all using (auth.role() = 'authenticated');
create policy "Admin all products"        on products        for all using (auth.role() = 'authenticated');
create policy "Admin all product_images"  on product_images  for all using (auth.role() = 'authenticated');
create policy "Admin all spec_groups"     on spec_groups     for all using (auth.role() = 'authenticated');
create policy "Admin all spec_rows"        on spec_rows        for all using (auth.role() = 'authenticated');
create policy "Admin all related_products" on related_products for all using (auth.role() = 'authenticated');

-- ---------------------------------------------------------------
-- Storage bucket
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

create policy "Public read images"
  on storage.objects for select using (bucket_id = 'images');
create policy "Admin upload images"
  on storage.objects for insert
  with check (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Admin update images"
  on storage.objects for update
  using (bucket_id = 'images' and auth.role() = 'authenticated');
create policy "Admin delete images"
  on storage.objects for delete
  using (bucket_id = 'images' and auth.role() = 'authenticated');
