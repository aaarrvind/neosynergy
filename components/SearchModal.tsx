"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, X, ArrowRight } from "lucide-react";
import { SearchResult } from "@/lib/types";

export function SearchModal() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        className="pressable flex items-center gap-2 rounded-md border border-steel-200 px-3 py-1.5 text-sm text-graphite/60 hover:border-cyan hover:text-graphite"
        aria-label="Search"
      >
        <Search size={15} />
        <span className="hidden sm:inline text-xs">Search</span>
        <kbd className="hidden sm:inline text-[10px] border border-steel-200 text-graphite/45 rounded px-1 py-0.5 font-mono">⌘K</kbd>
      </button>

      {/* Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4">
          <div
            className="absolute inset-0 bg-graphite/80 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="relative w-full max-w-xl bg-white rounded-xl shadow-2xl overflow-hidden">
            {/* Input */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-steel-100">
              <Search size={18} className="text-graphite/40 flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={handleChange}
                placeholder="Search products and categories…"
                className="flex-1 text-sm text-graphite outline-none placeholder-graphite/40"
              />
              {loading && (
                <div className="h-4 w-4 rounded-full border-2 border-cyan/40 border-t-cyan animate-spin flex-shrink-0" />
              )}
              <button onClick={() => setOpen(false)} className="text-graphite/40 hover:text-graphite flex-shrink-0">
                <X size={18} />
              </button>
            </div>

            {/* Results */}
            <div className="max-h-[420px] overflow-y-auto">
              {results.length > 0 ? (
                <ul>
                  {results.map(r => (
                    <li key={`${r.type}-${r.id}`}>
                      <Link
                        href={getHref(r)}
                        onClick={() => setOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 hover:bg-steel-50 transition-colors"
                      >
                        <div className="relative h-10 w-10 flex-shrink-0 rounded overflow-hidden bg-steel-100">
                          {r.image && (
                            <Image src={r.image} alt={r.name} fill className="object-cover" unoptimized />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-graphite truncate">{r.name}</p>
                          <p className="text-xs text-graphite/50 truncate">{r.tagline}</p>
                          <p className="text-xs text-cyan-deep/70 truncate">
                            {r.path_slugs.join(" / ")}
                          </p>
                        </div>
                        <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${r.type === "product" ? "bg-cyan-50 text-cyan-deep" : "bg-steel-100 text-graphite/50"}`}>
                          {r.type}
                        </span>
                        <ArrowRight size={14} className="text-graphite/30 flex-shrink-0" />
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : query.trim() && !loading ? (
                <div className="py-12 text-center text-sm text-graphite/40">
                  No results for &ldquo;{query}&rdquo;
                </div>
              ) : !query.trim() ? (
                <div className="py-12 text-center text-sm text-graphite/40">
                  Start typing to search products and categories
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
