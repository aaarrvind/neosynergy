"use client";

import { Search } from "lucide-react";

/**
 * A large search field that opens the header's search palette. It doesn't
 * mount a second SearchModal: both would register the ⌘K shortcut and open
 * together. It sends an event the existing one listens for instead.
 */
export function OpenSearchButton() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new Event("open-search"))}
      className="pressable flex w-full max-w-xl items-center gap-3 rounded-md border border-white/15 bg-white/[0.06] px-4 py-3.5 text-left text-white/55 hover:border-white/30 hover:bg-white/10 hover:text-white/80"
    >
      <Search size={18} className="flex-shrink-0 text-cyan" />
      <span className="flex-1 truncate text-sm">Search machines, accessories, model numbers…</span>
      <kbd className="hidden rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] text-white/45 sm:inline">
        ⌘K
      </kbd>
    </button>
  );
}
