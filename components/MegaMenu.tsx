"use client";
import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { ChevronRight, ChevronDown } from "lucide-react";
import { CategoryNode } from "@/lib/types";

interface Props {
  tree: CategoryNode[];
  /** True when the current route is under /products */
  active?: boolean;
}

export function MegaMenu({ tree, active = false }: Props) {
  const [open, setOpen] = useState(false);
  const [activeL1, setActiveL1] = useState<string | null>(null);
  const [activeL2, setActiveL2] = useState<string | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleClose = useCallback(() => {
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setActiveL1(null);
      setActiveL2(null);
    }, 150);
  }, []);

  const cancelClose = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const l1 = tree;
  const l2 = activeL1 ? (l1.find(n => n.id === activeL1)?.children ?? []) : [];
  const l3 = activeL2 ? (l2.find(n => n.id === activeL2)?.children ?? []) : [];

  return (
    <div
      className="relative"
      onMouseEnter={() => { cancelClose(); setOpen(true); }}
      onMouseLeave={scheduleClose}
    >
      {/* Trigger */}
      <button
        className={`flex items-center gap-1 border-b-2 pb-px font-display text-sm tracking-wide transition-colors ${
          active
            ? "border-cyan text-white"
            : "border-transparent text-white/80 hover:text-white"
        }`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen(v => !v)}
      >
        Products
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 [transition-timing-function:var(--ease-out-strong)] ${open ? "rotate-180" : ""}`}
        />
      </button>

      {/* Panel */}
      {open && (
        <div
          className="menu-panel fixed left-0 right-0 top-[52px] z-40 bg-graphite border-t border-white/10 shadow-2xl"
          onMouseEnter={cancelClose}
          onMouseLeave={scheduleClose}
        >
          <div className="mx-auto max-w-container px-6 py-6 lg:px-8">
            <div className="flex gap-0">
              {/* Level 1 */}
              <div className="w-56 flex-shrink-0 border-r border-white/10 pr-4">
                <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40 mb-3">Categories</p>
                <ul className="flex flex-col gap-0.5">
                  {l1.map(node => (
                    <li key={node.id}>
                      <Link
                        href={`/products/${node.pathSlugs.join("/")}`}
                        className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${activeL1 === node.id ? "bg-white/10 text-cyan" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                        onMouseEnter={() => { setActiveL1(node.id); setActiveL2(null); }}
                        onClick={() => setOpen(false)}
                      >
                        <span>{node.name}</span>
                        {node.children.length > 0 && (
                          <ChevronRight size={13} className="opacity-50 group-hover:opacity-100" />
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-white/10">
                  <Link
                    href="/products"
                    onClick={() => setOpen(false)}
                    className="text-xs text-cyan hover:underline"
                  >
                    View all products →
                  </Link>
                </div>
              </div>

              {/* Level 2 */}
              {l2.length > 0 && (
                <div className="w-56 flex-shrink-0 border-r border-white/10 px-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40 mb-3">
                    {l1.find(n => n.id === activeL1)?.name}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {l2.map(node => (
                      <li key={node.id}>
                        <Link
                          href={`/products/${node.pathSlugs.join("/")}`}
                          className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${activeL2 === node.id ? "bg-white/10 text-cyan" : "text-white/70 hover:bg-white/5 hover:text-white"}`}
                          onMouseEnter={() => setActiveL2(node.id)}
                          onClick={() => setOpen(false)}
                        >
                          <span>{node.name}</span>
                          {node.children.length > 0 && (
                            <ChevronRight size={13} className="opacity-50 group-hover:opacity-100" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Level 3 */}
              {l3.length > 0 && (
                <div className="w-56 flex-shrink-0 border-r border-white/10 px-4">
                  <p className="text-[0.65rem] font-semibold uppercase tracking-[0.18em] text-white/40 mb-3">
                    {l2.find(n => n.id === activeL2)?.name}
                  </p>
                  <ul className="flex flex-col gap-0.5">
                    {l3.map(node => (
                      <li key={node.id}>
                        <Link
                          href={`/products/${node.pathSlugs.join("/")}`}
                          className="flex items-center justify-between rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5 hover:text-white transition-colors"
                          onClick={() => setOpen(false)}
                        >
                          <span>{node.name}</span>
                          {node.children.length > 0 && (
                            <ChevronRight size={13} className="opacity-50" />
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Featured / description panel */}
              <div className="flex-1 pl-6">
                {activeL1 && (() => {
                  const active = activeL2
                    ? l2.find(n => n.id === activeL2)
                    : l1.find(n => n.id === activeL1);
                  if (!active) return null;
                  return (
                    <div className="flex flex-col gap-3">
                      <h3 className="font-display text-lg font-semibold text-white">{active.name}</h3>
                      <p className="text-sm text-white/60 leading-relaxed max-w-xs">{active.intro}</p>
                      {active.heroImage && (
                        <div
                          className="mt-2 h-36 w-full max-w-xs rounded-lg bg-cover bg-center opacity-60"
                          style={{ backgroundImage: `url(${active.heroImage})` }}
                        />
                      )}
                      <Link
                        href={`/products/${active.pathSlugs.join("/")}`}
                        onClick={() => setOpen(false)}
                        className="text-xs text-cyan hover:underline"
                      >
                        Browse {active.shortName} →
                      </Link>
                    </div>
                  );
                })()}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
