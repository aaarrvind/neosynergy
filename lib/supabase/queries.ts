import { createPublicSupabaseClient, isSupabaseConfigured } from "./public";
import {
  CategoryNode, CategoryRow, Product, ProductImage,
  SpecGroup, SearchResult
} from "../types";
import { DbProduct, DbSpecGroup, DbSpecRow, DbProductImage } from "./db-types";
import { Service } from "../data/services";

// ---------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------

/** Build a nested tree from the flat recursive query result */
function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];

  for (const row of rows) {
    map.set(row.id, {
      id: row.id,
      parentId: row.parent_id,
      slug: row.slug,
      name: row.name,
      shortName: row.short_name,
      intro: row.intro,
      description: Array.isArray(row.description) ? row.description : [],
      heroImage: row.hero_image,
      metaDescription: row.meta_description,
      sortOrder: row.sort_order,
      depth: row.depth,
      pathIds: row.path_ids,
      pathSlugs: row.path_slugs,
      pathNames: row.path_names,
      children: [],
    });
  }

  for (const node of Array.from(map.values())) {
    if (node.parentId === null) {
      roots.push(node);
    } else {
      const parent = map.get(node.parentId);
      if (parent) parent.children.push(node);
    }
  }

  return roots;
}

function mapProduct(
  p: DbProduct,
  categoryPath: string[],
  specGroups: DbSpecGroup[],
  specRows: DbSpecRow[],
  images: DbProductImage[]
): Product {
  const rowsByGroup: Record<string, DbSpecRow[]> = {};
  for (const r of specRows) {
    if (!rowsByGroup[r.spec_group_id]) rowsByGroup[r.spec_group_id] = [];
    rowsByGroup[r.spec_group_id].push(r);
  }

  const mappedSpecGroups: SpecGroup[] = specGroups
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(g => ({
      title: g.title,
      rows: (rowsByGroup[g.id] ?? [])
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(r => ({
          label: r.label,
          value: r.value ?? undefined,
          values: r.values ?? undefined,
        })),
    }));

  const mappedImages: ProductImage[] = images
    .sort((a, b) => a.sort_order - b.sort_order)
    .map(i => ({ id: i.id, url: i.url, alt: i.alt, sort_order: i.sort_order }));

  return {
    id: p.id,
    slug: p.slug,
    categoryId: p.category_id,
    categorySlug: categoryPath[categoryPath.length - 1] ?? "",
    categoryPath,
    name: p.name,
    tagline: p.tagline,
    description: Array.isArray(p.description) ? p.description : [],
    image: p.image || (mappedImages.length > 0 ? mappedImages[0].url : ""),
    images: mappedImages.length > 0 ? mappedImages : undefined,
    variants: p.variants ?? undefined,
    specGroups: mappedSpecGroups.length > 0 ? mappedSpecGroups : undefined,
    standardEquipment: p.standard_equipment ?? undefined,
    keywords: Array.isArray(p.keywords) ? p.keywords : [],
  };
}

// ---------------------------------------------------------------
// Static fallbacks (used when Supabase is not yet configured)
// ---------------------------------------------------------------
// Static fallbacks
import { categories as staticCategories } from "../data/categories";
import { products as staticProducts, products } from "../data/products";
import { services as staticServices } from "../data/services";

function staticCategoryToNode(c: { slug: string; name: string; shortName: string; intro: string; description: string[]; heroImage: string; metaDescription: string }): CategoryNode {
  return {
    id: c.slug,
    parentId: null,
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    intro: c.intro,
    description: c.description,
    heroImage: c.heroImage,
    metaDescription: c.metaDescription,
    sortOrder: 0,
    depth: 0,
    pathIds: [c.slug],
    pathSlugs: [c.slug],
    pathNames: [c.name],
    children: [],
  };
}

function getStaticFlatCategories(): CategoryNode[] {
  return (staticCategories as unknown as { slug: string; name: string; shortName: string; intro: string; description: string[]; heroImage: string; metaDescription: string }[]).map(c => ({
    id: c.slug,
    parentId: null,
    slug: c.slug,
    name: c.name,
    shortName: c.shortName,
    intro: c.intro,
    description: c.description,
    heroImage: c.heroImage,
    metaDescription: c.metaDescription,
    sortOrder: 0,
    depth: 0,
    pathIds: [c.slug],
    pathSlugs: [c.slug],
    pathNames: [c.name],
    children: [],
  }));
}

// ---------------------------------------------------------------
// CATEGORY TREE
// ---------------------------------------------------------------

let _treeCache: { data: CategoryNode[]; ts: number } | null = null;
const CACHE_TTL = 30_000; // 30s

export async function getCategoryTree(): Promise<CategoryNode[]> {
  // Return cached tree if fresh
  if (_treeCache && Date.now() - _treeCache.ts < CACHE_TTL) {
    return _treeCache.data;
  }

  if (!isSupabaseConfigured()) return getStaticFlatCategories();

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("get_category_tree");
    if (error || !data) throw error ?? new Error("empty result");
    const tree = buildTree(data as CategoryRow[]);
    _treeCache = { data: tree, ts: Date.now() };
    return tree;
  } catch (err) {
    console.error("[queries] getCategoryTree failed:", err);
    return getStaticFlatCategories();
  }
}

/** Flatten the tree into an ordered array (depth-first) */
export function flattenTree(nodes: CategoryNode[]): CategoryNode[] {
  const result: CategoryNode[] = [];
  function walk(nodes: CategoryNode[]) {
    for (const n of nodes) {
      result.push(n);
      if (n.children.length) walk(n.children);
    }
  }
  walk(nodes);
  return result;
}

/** Find a single node by its full slug path array */
export function findNodeByPath(
  tree: CategoryNode[],
  pathSlugs: string[]
): CategoryNode | undefined {
  const key = pathSlugs.join("/");
  return flattenTree(tree).find(n => n.pathSlugs.join("/") === key);
}

/** Find a node by id */
export function findNodeById(
  tree: CategoryNode[],
  id: string
): CategoryNode | undefined {
  return flattenTree(tree).find(n => n.id === id);
}

export async function getAllCategorySlugs(): Promise<{ category: string[] }[]> {
  // getCategoryTree already falls back to static data on failure
  const tree = await getCategoryTree();
  return flattenTree(tree).map(n => ({ category: n.pathSlugs }));
}

// ---------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------

type StaticProduct = {
  slug: string; categorySlug: string; name: string; tagline: string;
  description: string[]; image: string; variants?: string[];
  specGroups?: SpecGroup[]; standardEquipment?: string[]; keywords: string[];
};

function staticProductToProduct(p: StaticProduct): Product {
  return {
    id: p.slug,
    slug: p.slug,
    categoryId: p.categorySlug,
    categorySlug: p.categorySlug,
    categoryPath: [p.categorySlug],
    name: p.name,
    tagline: p.tagline,
    description: p.description,
    image: p.image,
    variants: p.variants,
    specGroups: p.specGroups,
    standardEquipment: p.standardEquipment,
    keywords: p.keywords,
  };
}

function getStaticProductsByCategory(categoryId: string): Product[] {
  return (staticProducts as unknown as StaticProduct[])
    .filter(p => p.categorySlug === categoryId)
    .map(staticProductToProduct);
}

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return getStaticProductsByCategory(categoryId);

  try {
    const supabase = createPublicSupabaseClient();
    const tree = await getCategoryTree();
    const node = flattenTree(tree).find(n => n.id === categoryId);
    if (!node) return [];

    const { data: prods, error } = await supabase
      .from("products")
      .select("*")
      .eq("category_id", categoryId)
      .order("sort_order");
    if (error) throw error;
    if (!prods || prods.length === 0) return [];

    const pids = (prods as DbProduct[]).map(p => p.id);

    const [{ data: groups }, { data: imgs }] = await Promise.all([
      supabase.from("spec_groups").select("*").in("product_id", pids).order("sort_order"),
      supabase.from("product_images").select("*").in("product_id", pids).order("sort_order"),
    ]);

    // Scope spec rows to this category's groups. Fetching the whole table and
    // filtering in JS works at small volumes but transfers the entire spec_rows
    // table on every render as the catalog grows.
    const groupIds = (groups as DbSpecGroup[] ?? []).map(g => g.id);
    const { data: rows } = groupIds.length > 0
      ? await supabase.from("spec_rows").select("*").in("spec_group_id", groupIds).order("sort_order")
      : { data: [] };
    const specRows = (rows as DbSpecRow[] ?? []);

    return (prods as DbProduct[]).map(p => {
      const pGroups = (groups as DbSpecGroup[] ?? []).filter(g => g.product_id === p.id);
      const gIds = new Set(pGroups.map(g => g.id));
      const pRows = specRows.filter(r => gIds.has(r.spec_group_id));
      const pImgs = (imgs as DbProductImage[] ?? []).filter(i => i.product_id === p.id);
      return mapProduct(p, node.pathSlugs, pGroups, pRows, pImgs);
    });
  } catch (err) {
    console.error("[queries] getProductsByCategory failed:", err);
    return getStaticProductsByCategory(categoryId);
  }
}

function getStaticProductBySlug(slug: string): Product | undefined {
  const sp = (staticProducts as unknown as StaticProduct[]).find(p => p.slug === slug);
  return sp ? staticProductToProduct(sp) : undefined;
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return getStaticProductBySlug(slug);

  try {
    const supabase = createPublicSupabaseClient();
    // maybeSingle: a missing product is a normal 404, not an error to log
    const { data: p, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) throw error;
    if (!p) return undefined;
    const prod = p as DbProduct;

    const tree = await getCategoryTree();
    const node = flattenTree(tree).find(n => n.id === prod.category_id);
    const pathSlugs = node?.pathSlugs ?? [];

    const [{ data: groups }, { data: imgs }] = await Promise.all([
      supabase.from("spec_groups").select("*").eq("product_id", prod.id).order("sort_order"),
      supabase.from("product_images").select("*").eq("product_id", prod.id).order("sort_order"),
    ]);

    const groupIds = (groups as DbSpecGroup[] ?? []).map(g => g.id);
    const { data: rows } = groupIds.length > 0
      ? await supabase.from("spec_rows").select("*").in("spec_group_id", groupIds).order("sort_order")
      : { data: [] };

    return mapProduct(prod, pathSlugs, groups as DbSpecGroup[] ?? [], rows as DbSpecRow[] ?? [], imgs as DbProductImage[] ?? []);
  } catch (err) {
    console.error("[queries] getProductBySlug failed:", err);
    return getStaticProductBySlug(slug);
  }
}

/**
 * Related products for a product page. Manually curated relations
 * (related_products table, admin-ordered) win; when none are curated —
 * or the table/query is unavailable — fall back to other products in
 * the same category.
 */
export async function getRelatedProducts(product: Product, limit = 4): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = createPublicSupabaseClient();
      const { data: rels, error } = await supabase
        .from("related_products")
        .select("related_product_id, sort_order")
        .eq("product_id", product.id)
        .order("sort_order");
      if (error) throw error;
      const ids = (rels ?? []).map(r => r.related_product_id as string);
      if (ids.length > 0) {
        const { data: prods, error: prodErr } = await supabase
          .from("products")
          .select("*")
          .in("id", ids);
        if (prodErr) throw prodErr;
        const tree = await getCategoryTree();
        const flat = flattenTree(tree);
        const byId = new Map((prods as DbProduct[] ?? []).map(p => [p.id, p]));
        return ids
          .map(id => byId.get(id))
          .filter((p): p is DbProduct => !!p)
          .slice(0, limit)
          .map(p => {
            const node = flat.find(n => n.id === p.category_id);
            // Cards don't need specs/images — pass empty
            return mapProduct(p, node?.pathSlugs ?? [], [], [], []);
          });
      }
    } catch (err) {
      console.error("[queries] getRelatedProducts (curated) failed:", err);
      // fall through to same-category fallback
    }
  }

  return (await getProductsByCategory(product.categoryId))
    .filter(p => p.slug !== product.slug)
    .slice(0, limit);
}

function getStaticProductSlugs(): { slug: string; category: string[] }[] {
  return (staticProducts as unknown as StaticProduct[]).map(p => ({
    slug: p.slug,
    category: [p.categorySlug],
  }));
}

export async function getAllProductSlugs(): Promise<{ slug: string; category: string[] }[]> {
  if (!isSupabaseConfigured()) return getStaticProductSlugs();

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.from("products").select("slug, category_id");
    if (error) throw error;
    if (!data || data.length === 0) return [];
    const tree = await getCategoryTree();
    const flat = flattenTree(tree);
    return (data as { slug: string; category_id: string }[]).map(r => {
      const node = flat.find(n => n.id === r.category_id);
      return { slug: r.slug, category: node?.pathSlugs ?? [] };
    });
  } catch (err) {
    console.error("[queries] getAllProductSlugs failed:", err);
    return getStaticProductSlugs();
  }
}

// ---------------------------------------------------------------
// SERVICES
// ---------------------------------------------------------------
export async function getServices(): Promise<Service[]> {
  if (!isSupabaseConfigured()) return staticServices;

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.from("services").select("*").order("sort_order");
    if (error || !data) throw error ?? new Error("empty result");
    return (data as import("./db-types").DbService[]).map(s => ({
      slug: s.slug, name: s.name,
      shortDescription: s.short_description,
      description: Array.isArray(s.description) ? s.description : [],
      icon: s.icon,
    }));
  } catch (err) {
    console.error("[queries] getServices failed:", err);
    return staticServices;
  }
}

// ---------------------------------------------------------------
// SEARCH
// ---------------------------------------------------------------
function staticSearch(query: string): SearchResult[] {
  const q = query.toLowerCase();
  const prods: SearchResult[] = (staticProducts as unknown as StaticProduct[])
    .filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.tagline.toLowerCase().includes(q) ||
      (p.keywords ?? []).some(k => k.toLowerCase().includes(q))
    )
    .map(p => ({
      type: "product" as const, id: p.slug, name: p.name, tagline: p.tagline,
      image: p.image, slug: p.slug, path_slugs: [p.categorySlug],
    }));
  const cats: SearchResult[] = getStaticFlatCategories()
    .filter(c => c.name.toLowerCase().includes(q) || c.intro.toLowerCase().includes(q))
    .map(c => ({
      type: "category" as const, id: c.id, name: c.name, tagline: c.intro,
      image: c.heroImage, slug: c.slug, path_slugs: c.pathSlugs,
    }));
  return [...prods, ...cats].slice(0, 20);
}

export async function searchCatalog(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (!isSupabaseConfigured()) return staticSearch(trimmed);
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("search_catalog", { query: trimmed });
    if (error || !data) throw error ?? new Error("empty result");
    return data as SearchResult[];
  } catch (err) {
    console.error("[queries] searchCatalog failed:", err);
    return staticSearch(trimmed);
  }
}
