"use client";

import { useState } from "react";
import { Plus, Check } from "lucide-react";
import { useCart } from "@/lib/cart-context";

interface AddToQuoteButtonProps {
  name: string;
  categorySlug: string;
  categoryName: string;
  image?: string;
  variants?: string[];
  size?: "sm" | "lg";
}

export function AddToQuoteButton({
  name,
  categorySlug,
  categoryName,
  image,
  variants,
  size = "lg",
}: AddToQuoteButtonProps) {
  const { addItem } = useCart();
  const [variant, setVariant] = useState(variants?.[0]);
  const [added, setAdded] = useState(false);

  function handleAdd() {
    const idBase = `${categorySlug}__${name}${variant ? `__${variant}` : ""}`;
    const id = idBase.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    addItem({
      id,
      name,
      categorySlug,
      categoryName,
      variant,
      image,
      quantity: 1,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  }

  const buttonClasses =
    size === "lg"
      ? "pressable inline-flex items-center justify-center gap-2 rounded-md bg-graphite px-5 py-3 text-sm font-medium text-white hover:bg-cyan-deep"
      : "pressable inline-flex items-center justify-center gap-2 rounded-md border border-steel-200 bg-white px-3 py-2 text-xs font-medium text-graphite hover:border-cyan hover:text-cyan-deep";

  return (
    <div className="flex flex-col gap-2">
      {variants && variants.length > 1 && (
        <label className="flex flex-col gap-1 text-sm text-graphite/70">
          <span className="font-medium text-graphite">Model</span>
          <select
            value={variant}
            onChange={(e) => setVariant(e.target.value)}
            className="rounded-md border border-steel-200 bg-white px-3 py-2 text-sm"
          >
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </label>
      )}
      <button type="button" onClick={handleAdd} className={buttonClasses}>
        {added ? (
          <>
            <Check size={16} /> Added to quote
          </>
        ) : (
          <>
            <Plus size={16} /> Add to quote
          </>
        )}
      </button>
    </div>
  );
}
