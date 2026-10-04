"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

/**
 * Always open beside the listing on desktop; collapsed behind a button on
 * phones, so the products come first. Closes itself after navigating, since
 * the category route stays mounted and would otherwise keep the panel open.
 */
export function SidebarDrawer({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setOpen(false), [pathname]);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-expanded={open}
        aria-controls="category-sidebar"
        className="pressable flex w-full items-center justify-between gap-3 rounded-md border border-steel-200 bg-white px-4 py-3 text-sm font-medium text-graphite lg:hidden"
      >
        <span className="flex min-w-0 items-center gap-2">
          <SlidersHorizontal size={16} className="flex-shrink-0 text-cyan-deep" />
          <span className="truncate">{label}</span>
        </span>
        <ChevronDown
          size={16}
          className={`flex-shrink-0 transition-transform duration-200 [transition-timing-function:var(--ease-out-strong)] ${open ? "rotate-180" : ""}`}
        />
      </button>
      <div id="category-sidebar" className={`${open ? "mt-3 block" : "hidden"} lg:mt-0 lg:block`}>
        {children}
      </div>
    </div>
  );
}
