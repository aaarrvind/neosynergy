import Link from "next/link";
import { CategoryNode } from "@/lib/types";

const href = (node: CategoryNode) => `/products/${node.pathSlugs.join("/")}`;

/**
 * The category tree as navigation. Each entry links to that category's own
 * page rather than toggling a query-string filter: every category already has
 * one canonical URL, and filter parameters would recreate the duplicate-content
 * URLs that canonical redirects were added to remove.
 *
 * Only the branch leading to the current category is expanded, so a deep tree
 * stays short. On the catalogue index nothing is selected, so the first level
 * under each top-level category is shown instead.
 */
export function CategorySidebar({
  tree,
  activePathIds,
  counts,
  total,
}: {
  tree: CategoryNode[];
  /** pathIds of the current category, or [] on the catalogue index */
  activePathIds: string[];
  counts: Map<string, number>;
  total: number;
}) {
  const activeId = activePathIds[activePathIds.length - 1];
  const isIndex = activePathIds.length === 0;

  function Branch({ node }: { node: CategoryNode }) {
    const count = counts.get(node.id) ?? 0;
    const isActive = node.id === activeId;
    const expanded =
      node.children.length > 0 &&
      (activePathIds.includes(node.id) || (isIndex && node.depth === 0));

    return (
      <li>
        <Item href={href(node)} active={isActive} count={count} muted={count === 0}>
          {node.name}
        </Item>
        {expanded && (
          <ul className="ml-3 mt-0.5 border-l border-steel-100 pl-2">
            {node.children.map(child => (
              <Branch key={child.id} node={child} />
            ))}
          </ul>
        )}
      </li>
    );
  }

  return (
    <nav aria-label="Product categories">
      <p className="mb-3 px-2.5 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite/45">
        Categories
      </p>
      <ul className="flex flex-col gap-0.5">
        <li>
          <Item href="/products" active={isIndex} count={total}>
            All products
          </Item>
        </li>
        {tree.map(node => (
          <Branch key={node.id} node={node} />
        ))}
      </ul>
    </nav>
  );
}

function Item({
  href,
  active,
  count,
  muted = false,
  children,
}: {
  href: string;
  active: boolean;
  count: number;
  muted?: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`flex items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-sm transition-colors ${
        active
          ? "bg-steel-50 font-semibold text-graphite"
          : muted
            ? "text-graphite/45 hover:bg-steel-50 hover:text-graphite"
            : "text-graphite/75 hover:bg-steel-50 hover:text-graphite"
      }`}
    >
      <span className="min-w-0 leading-snug">{children}</span>
      {count > 0 && (
        <span className={`flex-shrink-0 text-xs tabular-nums ${active ? "text-cyan-deep" : "text-graphite/40"}`}>
          {count}
        </span>
      )}
    </Link>
  );
}
