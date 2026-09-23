"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, CornerDownLeft } from "lucide-react";
import { SearchResult } from "@/lib/types";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Keyboard shortcut: Ctrl/Cmd + K
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen(v => !v);
      }
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 50);
    else { setQuery(""); setResults([]); }
  }, [open]);

  const doSearch = useCallback(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      setResults(data.results ?? []);
    } catch { setResults([]); }
    setLoading(false);
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(v), 300);
  }

  function getHref(r: SearchResult) {
    if (r.type === "product") return `/products/${r.path_slugs.join("/")}/${r.slug}`;
    return `/products/${r.path_slugs.join("/")}`;
  }

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="pressable flex items-center gap-2 rounded-md border border-steel-200 px-4 py-2.5 text-sm text-graphite/60 hover:border-cyan hover:text-graphite sm:w-64 lg:w-72"
        aria-label="Search"
      >
        <Search size={16} className="flex-shrink-0" />
        <span className="hidden sm:inline text-sm">Search products…</span>
        <kbd className="ml-auto hidden sm:inline text-[10px] border border-steel-200 text-graphite/45 rounded px-1.5 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center px-4 pt-[14vh]">
          <div
            className="search-overlay absolute inset-0 bg-graphite/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search products and categories"
            className="search-panel relative flex max-h-[70vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-graphite/5"
          >
            {/* Input */}
            <div className="flex items-center gap-3 border-b border-steel-100 px-5 py-4">
              <Search size={20} className="flex-shrink-0 text-cyan-deep" />
              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                onKeyDown={(e) => {
                  // Enter opens the top result, matching the "↵ to select" hint
                  if (e.key === "Enter" && results.length > 0) {
                    e.preventDefault();
                    setOpen(false);
                    router.push(getHref(results[0]));
                  }
                }}
                placeholder="Search products and categories…"
                className="flex-1 bg-transparent text-base text-graphite outline-none placeholder-graphite/40"
              />
              {loading && (
                <div className="h-4 w-4 flex-shrink-0 animate-spin rounded-full border-2 border-cyan/40 border-t-cyan" />
              )}
              <button
                onClick={() => setOpen(false)}
                className="pressable flex-shrink-0 rounded-md border border-steel-200 px-2 py-1 font-mono text-[11px] text-graphite/50 hover:border-steel-300 hover:text-graphite"
                aria-label="Close search"
              >
                Esc
              </button>
            </div>

            {/* Results */}
            <div className="flex-1 overflow-y-auto overscroll-contain">
              {results.length > 0 ? (
                <>
                  <p className="px-5 pb-1.5 pt-4 font-display text-[11px] font-semibold uppercase tracking-[0.14em] text-graphite/40">
                    {results.length} result{results.length === 1 ? "" : "s"}
                  </p>
                  <ul className="px-2 pb-2">
                    {results.map(r => (
                      <li key={`${r.type}-${r.id}`}>
                        <Link
                          href={getHref(r)}
                          onClick={() => setOpen(false)}
                          className="arrow-link group flex items-center gap-3.5 rounded-lg px-3 py-2.5 transition-colors hover:bg-steel-50"
                        >
                          <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-md bg-steel-100 ring-1 ring-graphite/5">
                            {r.image && (
                              <Image src={r.image} alt={r.name} fill className="object-cover" unoptimized />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-graphite">{r.name}</p>
                            {r.tagline && (
                              <p className="truncate text-xs text-graphite/50">{r.tagline}</p>
                            )}
                            <p className="mt-0.5 truncate text-[11px] font-medium text-cyan-deep/70">
                              {r.path_slugs.join(" / ")}
                            </p>
                          </div>
                          <span
                            className={`flex-shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${
                              r.type === "product"
                                ? "bg-cyan-50 text-cyan-deep"
                                : "bg-steel-100 text-graphite/50"
                            }`}
                          >
                            {r.type}
                          </span>
                          <ArrowRight size={15} className="arrow-icon flex-shrink-0 text-graphite/30" />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              ) : query.trim() && !loading ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-steel-100">
                    <Search size={20} className="text-graphite/40" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-graphite">
                    No results for &ldquo;{query}&rdquo;
                  </p>
                  <p className="mt-1 text-sm text-graphite/50">
                    Try a machine name, model number, or category.
                  </p>
                </div>
              ) : !query.trim() ? (
                <div className="flex flex-col items-center px-6 py-14 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50">
                    <Search size={20} className="text-cyan-deep" />
                  </div>
                  <p className="mt-4 text-sm font-semibold text-graphite">
                    Search the catalogue
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-graphite/50">
                    Find machines, controllers, and accessories by name, model, or category.
                  </p>
                </div>
              ) : null}
            </div>

            {/* Footer — keyboard hints */}
            <div className="hidden items-center gap-4 border-t border-steel-100 bg-steel-50/60 px-5 py-2.5 text-[11px] text-graphite/45 sm:flex">
              <span className="flex items-center gap-1.5">
                <CornerDownLeft size={12} /> to select
              </span>
              <span className="flex items-center gap-1.5">
                <kbd className="rounded border border-steel-200 bg-white px-1.5 py-0.5 font-mono">Esc</kbd>
                to close
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
