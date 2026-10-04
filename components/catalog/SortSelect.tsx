"use client";

import { usePathname, useRouter } from "next/navigation";
import { PRODUCT_SORTS, ProductSort, SORT_LABELS, listingQuery } from "@/lib/catalog";

/** Changing the sort goes back to page 1 — page 3 of a different order is meaningless. */
export function SortSelect({ sort }: { sort: ProductSort }) {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="text-graphite/55">Sort by</span>
      <select
        value={sort}
        onChange={e =>
          router.push(`${pathname}${listingQuery(e.target.value as ProductSort, 1)}`, {
            scroll: false,
          })
        }
        className="rounded-md border border-steel-200 bg-white py-1.5 pl-3 pr-8 text-sm font-medium text-graphite focus:border-cyan focus:outline-none"
      >
        {PRODUCT_SORTS.map(s => (
          <option key={s} value={s}>
            {SORT_LABELS[s]}
          </option>
        ))}
      </select>
    </label>
  );
}
