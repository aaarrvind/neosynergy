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
// Degraded-mode behaviour
// ---------------------------------------------------------------
// The catalog lives entirely in Supabase. There is deliberately NO hard-coded
// catalog to fall back on: a stale copy drifts out of sync with the database
// and, on a transient Supabase error, would serve a plausible-looking catalog
// full of URLs that 404 — worse than serving nothing, because nothing is
// visibly broken and so nobody fixes it.
//
// Instead, a failed read returns empty and logs loudly. Pages are rendered with
// ISR, so a revalidation failure keeps the last good page in the CDN cache;
// empty results only surface on a genuinely cold render while Supabase is down.
//
// Services are the exception: a short, slow-changing list that ships with the
// app, so the static copy stays a truthful fallback.
import { services as staticServices } from "../data/services";

/** Last tree that loaded successfully — keeps site navigation alive through a blip. */
let _lastGoodTree: CategoryNode[] | null = null;

function degraded<T>(fn: string, err: unknown, empty: T): T {
  console.error(`[queries] ${fn} failed — serving empty result:`, err);
  return empty;
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

  if (!isSupabaseConfigured()) {
    console.warn("[queries] Supabase is not configured — the catalog will be empty.");
    return [];
  }

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("get_category_tree");
    if (error || !data) throw error ?? new Error("empty result");
    const tree = buildTree(data as CategoryRow[]);
    _treeCache = { data: tree, ts: Date.now() };
    _lastGoodTree = tree;
    return tree;
  } catch (err) {
    // The tree drives the header and footer on every page, so prefer a stale
    // copy from this process over an empty nav. Both are honest; neither
    // invents categories that do not exist.
    return degraded("getCategoryTree", err, _lastGoodTree ?? []);
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

export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

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
    return degraded("getProductsByCategory", err, []);
  }
}

export async function getProductBySlug(slug: string): Promise<Product | undefined> {
  if (!isSupabaseConfigured()) return undefined;

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
    // undefined renders the 404 page. A blip therefore shows "not found"
    // rather than a stale product whose specs may no longer be accurate.
    return degraded("getProductBySlug", err, undefined);
  }
}

/**
 * Curated "Featured machines" selection for the homepage, controlled by the
 * is_featured / featured_sort columns from the admin product form.
 *
 * Cards do not render specs or galleries, so those are not fetched — the card
 * only needs name, tagline, hero image, variants, and the category path that
 * builds its href.
 */
export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  if (!isSupabaseConfigured()) return [];

  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("is_featured", true)
      .order("featured_sort")
      .order("name")
      .limit(limit);
    if (error) throw error;

    const prods = (data as DbProduct[]) ?? [];
    if (prods.length === 0) {
      // Not an error — but the homepage section will be empty, and silence is
      // how the previous hard-coded list hid two dead slugs for so long.
      console.warn("[queries] getFeaturedProducts: no products are marked as featured.");
      return [];
    }

    const flat = flattenTree(await getCategoryTree());
    return prods.map(p => {
      const node = flat.find(n => n.id === p.category_id);
      return mapProduct(p, node?.pathSlugs ?? [], [], [], []);
    });
  } catch (err) {
    return degraded("getFeaturedProducts", err, []);
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

export async function getAllProductSlugs(): Promise<{ slug: string; category: string[] }[]> {
  if (!isSupabaseConfigured()) return [];

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
    // Feeds the sitemap. Emitting nothing is better than emitting URLs that 404.
    return degraded("getAllProductSlugs", err, []);
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
export async function searchCatalog(query: string): Promise<SearchResult[]> {
  const trimmed = query.trim();
  if (!trimmed) return [];
  if (!isSupabaseConfigured()) return [];
  try {
    const supabase = createPublicSupabaseClient();
    const { data, error } = await supabase.rpc("search_catalog", { query: trimmed });
    if (error || !data) throw error ?? new Error("empty result");
    return data as SearchResult[];
  } catch (err) {
    // "No results" is the honest answer when the index is unreachable —
    // a keyword match against a stale copy would link to URLs that 404.
    return degraded("searchCatalog", err, [] as SearchResult[]);
  }
}
