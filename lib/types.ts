// ---------------------------------------------------------------
// Core types used across the app
// ---------------------------------------------------------------

export interface SpecRow {
  label: string;
  value?: string;
  values?: Record<string, string>;
}

export interface SpecGroup {
  title: string;
  rows: SpecRow[];
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface Product {
  id: string;
  slug: string;
  categoryId: string;
  categorySlug: string;       // computed from category join
  categoryPath: string[];     // full path slugs e.g. ['machine-tools','machining-centers','vertical-machining-centers']
  name: string;
  tagline: string;
  description: string[];
  image: string;
  images?: ProductImage[];
  variants?: string[];
  specGroups?: SpecGroup[];
  standardEquipment?: string[];
  keywords: string[];
}

// A node in the category tree
export interface CategoryNode {
  id: string;
  parentId: string | null;
  slug: string;
  name: string;
  shortName: string;
  intro: string;
  description: string[];
  heroImage: string;
  metaDescription: string;
  sortOrder: number;
  depth: number;
  pathIds: string[];
  pathSlugs: string[];     // e.g. ['machine-tools','machining-centers']
  pathNames: string[];
  children: CategoryNode[];
}

// Flat row returned directly from get_category_tree()
export interface CategoryRow {
  id: string;
  parent_id: string | null;
  slug: string;
  name: string;
  short_name: string;
  intro: string;
  description: string[];
  hero_image: string;
  meta_description: string;
  sort_order: number;
  depth: number;
  path_ids: string[];
  path_slugs: string[];
  path_names: string[];
}

export interface CartItem {
  id: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  variant?: string;
  image?: string;
  quantity: number;
  notes?: string;
}

export interface SearchResult {
  type: 'product' | 'category';
  id: string;
  name: string;
  tagline: string;
  image: string;
  slug: string;
  path_slugs: string[];
}
