"use client";

import Image from "next/image";
import Link from "next/link";
import { X, Minus, Plus, Trash2, FileText } from "lucide-react";
import { useCart } from "@/lib/cart-context";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    totalCount,
  } = useCart();

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-graphite/50 transition-opacity ${
          isDrawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Panel */}
      <aside
        className={`fixed right-0 top-0 z-50 flex h-full w-full max-w-sm flex-col bg-white shadow-2xl transition-transform duration-300 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-modal="true"
        aria-label="Quote request cart"
      >
        <div className="flex items-center justify-between border-b border-steel-100 px-5 py-4">
          <h2 className="font-display text-lg font-medium text-graphite">
            Quote request ({totalCount})
          </h2>
          <button
            onClick={closeDrawer}
            aria-label="Close cart"
            className="rounded-md p-2 text-graphite/60 hover:bg-steel-50 hover:text-graphite"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center text-sm text-graphite/60">
              <p>Your quote request is empty.</p>
              <p className="mt-1">
                Browse the catalog and add items you&apos;d like priced.
              </p>
            </div>
          ) : (
            <ul className="flex flex-col gap-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md border border-steel-100 bg-steel-50">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-sm font-medium text-graphite leading-snug">
                          {item.name}
                        </p>
                        {item.variant && (
                          <p className="text-xs text-graphite/60">
                            {item.variant}
                          </p>
                        )}
                        <p className="text-xs text-graphite/40">
                          {item.categoryName}
                        </p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        aria-label={`Remove ${item.name}`}
                        className="text-graphite/40 hover:text-spark"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <div className="mt-2 inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        aria-label="Decrease quantity"
                        className="flex h-7 w-7 items-center justify-center rounded border border-steel-200 text-graphite/70 hover:border-cyan hover:text-cyan-deep"
                      >
                        <Minus size={14} />
                      </button>
                      <span className="w-6 text-center font-mono text-sm">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        aria-label="Increase quantity"
                        className="flex h-7 w-7 items-center justify-center rounded border border-steel-200 text-graphite/70 hover:border-cyan hover:text-cyan-deep"
                      >
                        <Plus size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="border-t border-steel-100 p-5">
          <Link
            href="/quote"
            onClick={closeDrawer}
            className={`flex w-full items-center justify-center gap-2 rounded-md px-4 py-3 text-sm font-medium transition-colors ${
              items.length === 0
                ? "cursor-not-allowed bg-steel-100 text-graphite/40"
                : "bg-spark text-graphite hover:bg-spark-deep hover:text-white"
            }`}
            aria-disabled={items.length === 0}
            tabIndex={items.length === 0 ? -1 : 0}
          >
            <FileText size={16} />
            Review &amp; request quote
          </Link>
        </div>
      </aside>
    </>
  );
}
