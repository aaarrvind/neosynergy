"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { CategoryNode } from "@/lib/types";

interface Props {
  tree: CategoryNode[];
  /** True when the current route is under /products */
  active?: boolean;
}

const href = (node: CategoryNode) => `/products/${node.pathSlugs.join("/")}`;

interface MenuColumn {
  key: string;
  name: string;
  href: string;
  items: CategoryNode[];
}

export function MegaMenu({ tree, active = false }: Props) {
  const [open, setOpen] = useState(false);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  // Every category is visible at once rather than hidden behind hover
  // drill-down. Each second-level category that has children becomes a titled
  // column. Second-level categories with no children would otherwise render as
  // a heading above empty space, so they are collected into one catch-all column
  // per root — they are browsable leaves, the same role the listed children play.
  const columns: MenuColumn[] = tree.flatMap((root) => {
    const parents = root.children.filter((c) => c.children.length > 0);
    const leaves = root.children.filter((c) => c.children.length === 0);

    const cols: MenuColumn[] = parents.map((c) => ({
      key: c.id,
      name: c.name,
      href: href(c),
      items: c.children,
    }));

    if (leaves.length > 0) {
      cols.push({
        key: `${root.id}__leaves`,
        // If nothing under this root has children, the bundle *is* the root
        name: parents.length === 0 ? root.name : `More ${root.name}`,
        href: href(root),
        items: leaves,
      });
    }

    // Root with no children at all still deserves an entry
    if (root.children.length === 0) {
      cols.push({ key: root.id, name: root.name, href: href(root), items: [] });
    }

    return cols;
  });

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 border-b-2 pb-px font-display text-sm font-medium tracking-wide transition-colors ${
          active
            ? "border-cyan text-white"
            : "border-transparent text-white/70 hover:text-white"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((v) => !v)}
      >
        Products
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 [transition-timing-function:var(--ease-out-strong)] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel — top must equal the header's full height so it sits flush.
          The menu only renders at lg+, where the header is always:
          utility bar 36px + 1px border + main bar 64px + 1px border = 102px.
          Keep in sync if those bar heights change in Header.tsx. */}
      {open && (
        <div
          className="menu-panel fixed left-0 right-0 top-[102px] z-40 max-h-[calc(100vh-102px)] overflow-y-auto border-t border-white/10 bg-graphite shadow-2xl"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-container px-6 py-10 lg:px-8">
            <div className="grid grid-cols-2 gap-x-10 gap-y-9 md:grid-cols-3 lg:grid-cols-4">
              {columns.map((col) => (
                <div key={col.key}>
                  <Link
                    href={col.href}
                    onClick={close}
                    className="block border-b border-white/25 pb-2.5 font-display text-sm font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:text-cyan"
                  >
                    {col.name}
                  </Link>
                  {col.items.length > 0 && (
                    <ul className="mt-4 flex flex-col gap-2.5">
                      {col.items.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={href(child)}
                            onClick={close}
                            className="block text-sm leading-snug text-white/65 transition-colors hover:text-white"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>

            {/* Footer: top-level entry points */}
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-3 border-t border-white/10 pt-6">
              {tree.map((root) => (
                <Link
                  key={root.id}
                  href={href(root)}
                  onClick={close}
                  className="text-sm font-medium text-white/70 transition-colors hover:text-white"
                >
                  All {root.name}
                </Link>
              ))}
              <Link
                href="/products"
                onClick={close}
                className="text-sm font-semibold text-cyan transition-colors hover:text-white"
              >
                View all products
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
