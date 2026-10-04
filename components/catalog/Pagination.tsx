import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductSort, listingQuery, pageWindow } from "@/lib/catalog";

/**
 * Plain links, so every page is crawlable and works without JavaScript. The
 * anchor brings the visitor back to the top of the results, not the page.
 */
export function Pagination({
  basePath,
  sort,
  page,
  totalPages,
  anchor,
}: {
  basePath: string;
  sort: ProductSort;
  page: number;
  totalPages: number;
  anchor: string;
}) {
  if (totalPages <= 1) return null;
  const href = (p: number) => `${basePath}${listingQuery(sort, p)}#${anchor}`;

  const edge =
    "flex h-9 items-center gap-1 rounded-md px-3 text-sm font-medium transition-colors";

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(page - 1)} rel="prev" className={`${edge} text-graphite/70 hover:bg-steel-50 hover:text-graphite`}>
          <ChevronLeft size={16} /> Previous
        </Link>
      ) : (
        <span className={`${edge} text-graphite/25`} aria-hidden>
          <ChevronLeft size={16} /> Previous
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1.5 text-sm text-graphite/35" aria-hidden>
            …
          </span>
        ) : (
          <Link
            key={p}
            href={href(p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={`Page ${p}`}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md px-2 text-sm tabular-nums transition-colors ${
              p === page
                ? "bg-graphite font-semibold text-white"
                : "text-graphite/70 hover:bg-steel-50 hover:text-graphite"
            }`}
          >
            {p}
          </Link>
        )
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} rel="next" className={`${edge} text-graphite/70 hover:bg-steel-50 hover:text-graphite`}>
          Next <ChevronRight size={16} />
        </Link>
      ) : (
        <span className={`${edge} text-graphite/25`} aria-hidden>
          Next <ChevronRight size={16} />
        </span>
      )}
    </nav>
  );
}
