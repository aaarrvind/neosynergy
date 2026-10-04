// Shared by server pages and client controls, so it must not import anything
// server-only (the Supabase query module included).
import { CategoryNode } from "./types";

export type ProductSort = "recommended" | "name" | "newest";
export const PRODUCT_SORTS: readonly ProductSort[] = ["recommended", "name", "newest"];
export const SORT_LABELS: Record<ProductSort, string> = {
  recommended: "Recommended",
  name: "Name (A–Z)",
  newest: "Newest",
};
export const LISTING_PAGE_SIZE = 24;

/** Product count for every category, including everything in its subcategories. */
export function rollUpCounts(
  tree: CategoryNode[],
  direct: Map<string, number>
): Map<string, number> {
  const total = new Map<string, number>();
  const walk = (node: CategoryNode): number => {
    const sum = (direct.get(node.id) ?? 0) + node.children.reduce((s, c) => s + walk(c), 0);
    total.set(node.id, sum);
    return sum;
  };
  tree.forEach(walk);
  return total;
}

/** The node's id and the ids of all its descendants — the scope of its listing. */
export function subtreeIds(node: CategoryNode): string[] {
  return [node.id, ...node.children.flatMap(subtreeIds)];
}

type SearchParams = Record<string, string | string[] | undefined>;

const first = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

/**
 * Sort and page from the query string. Anything malformed falls back to the
 * default rather than erroring, since these URLs are hand-editable and crawled.
 */
export function parseListingParams(searchParams: SearchParams): {
  sort: ProductSort;
  page: number;
} {
  const rawSort = first(searchParams.sort);
  const sort = (PRODUCT_SORTS as readonly string[]).includes(rawSort ?? "")
    ? (rawSort as ProductSort)
    : "recommended";

  const rawPage = Number(first(searchParams.page));
  const page = Number.isInteger(rawPage) && rawPage >= 1 ? rawPage : 1;

  return { sort, page };
}

/** Query string for a listing URL, leaving out values that are already the default. */
export function listingQuery(sort: ProductSort, page: number): string {
  const params = new URLSearchParams();
  if (sort !== "recommended") params.set("sort", sort);
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

/**
 * Page numbers to show in a pager, with null marking a gap:
 * 1 … 4 5 6 … 12. Always includes the first, last, and current ±1.
 */
export function pageWindow(current: number, last: number): (number | null)[] {
  const pages = new Set([1, last, current - 1, current, current + 1]);
  const sorted = Array.from(pages)
    .filter(p => p >= 1 && p <= last)
    .sort((a, b) => a - b);

  const out: (number | null)[] = [];
  sorted.forEach((p, i) => {
    const gap = i > 0 ? p - sorted[i - 1] : 1;
    // A gap of one page is shown as that page: "…" would take the same
    // space and tell the reader less.
    if (gap === 2) out.push(p - 1);
    else if (gap > 2) out.push(null);
    out.push(p);
  });
  return out;
}

/** "Machines › Grinding Machines" — how a category is named in an enquiry. */
export function categoryLabel(node: CategoryNode): string {
  return node.pathNames.join(" › ");
}
