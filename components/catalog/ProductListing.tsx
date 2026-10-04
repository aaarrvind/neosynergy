import { ProductCard } from "@/components/ProductCard";
import { LISTING_PAGE_SIZE, ProductSort } from "@/lib/catalog";
import { Product } from "@/lib/types";
import { Pagination } from "./Pagination";
import { SortSelect } from "./SortSelect";

/**
 * Results bar, product grid, and pager for one page of a listing. Shared by
 * the catalogue index and every category page so they behave identically.
 */
export function ProductListing({
  products,
  total,
  page,
  sort,
  basePath,
  anchor,
  categoryNames,
  empty,
}: {
  products: Product[];
  total: number;
  page: number;
  sort: ProductSort;
  basePath: string;
  /** id of the element the pager scrolls back to */
  anchor: string;
  /** category id → name, for the label on each card */
  categoryNames: Map<string, string>;
  /** rendered instead of the grid when there is nothing to list */
  empty: React.ReactNode;
}) {
  if (total === 0) return <>{empty}</>;

  const totalPages = Math.ceil(total / LISTING_PAGE_SIZE);
  const from = (page - 1) * LISTING_PAGE_SIZE + 1;
  const to = from + products.length - 1;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-steel-100 pb-4">
        <p className="text-sm text-graphite/60" aria-live="polite">
          {totalPages > 1 ? (
            <>
              Showing <span className="font-semibold text-graphite">{from}–{to}</span> of{" "}
              <span className="font-semibold text-graphite">{total}</span> products
            </>
          ) : (
            <>
              <span className="font-semibold text-graphite">{total}</span>{" "}
              {total === 1 ? "product" : "products"}
            </>
          )}
        </p>
        {total > 1 && <SortSelect sort={sort} />}
      </div>

      <div className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
        {products.map(product => (
          <ProductCard
            key={product.slug}
            name={product.name}
            description={product.tagline}
            image={product.image}
            href={`/products/${product.categoryPath.join("/")}/${product.slug}`}
            categorySlug={product.categorySlug}
            categoryName={categoryNames.get(product.categoryId) ?? ""}
            variants={product.variants}
          />
        ))}
      </div>

      <div className="mt-12">
        <Pagination basePath={basePath} sort={sort} page={page} totalPages={totalPages} anchor={anchor} />
      </div>
    </div>
  );
}
