export interface DbCategory {
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
  created_at: string;
  updated_at: string;
}

export interface DbProduct {
  id: string;
  slug: string;
  category_id: string;
  name: string;
  tagline: string;
  description: string[];
  image: string;
  variants: string[] | null;
  standard_equipment: string[] | null;
  keywords: string[];
  sort_order: number;
  is_featured: boolean;
  featured_sort: number;
  created_at: string;
  updated_at: string;
}

export interface DbProductImage {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  sort_order: number;
}

export interface DbSpecGroup {
  id: string;
  product_id: string;
  title: string;
  sort_order: number;
}

export interface DbSpecRow {
  id: string;
  spec_group_id: string;
  label: string;
  value: string | null;
  values: Record<string, string> | null;
  sort_order: number;
}

export interface DbService {
  id: string;
  slug: string;
  name: string;
  short_description: string;
  description: string[];
  icon: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
