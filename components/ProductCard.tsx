import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package } from "lucide-react";
import { AddToQuoteButton } from "./AddToQuoteButton";

interface ProductCardProps {
  name: string;
  description: string;
  image?: string;
  href?: string;
  categorySlug: string;
  categoryName: string;
  variants?: string[];
}

export function ProductCard({
  name,
  description,
  image,
  href,
  categorySlug,
  categoryName,
  variants,
}: ProductCardProps) {
  const modelCount = variants?.length ?? 0;

  // A tagline that only repeats the product name is a line of noise.
  const tagline =
    description && description.trim().toLowerCase() !== name.trim().toLowerCase()
      ? description
      : null;

  // Picking a model inside the card made each card a different height, so the
  // footers never lined up, and a long model name pushed the details link off
  // the edge. When there is a real choice to make, the card sends people to the
  // product page, where the model picker sits beside the specs it changes.
  const needsModelChoice = modelCount > 1 && !!href;

  return (
    <article className="card-hover zoom arrow-link group relative flex flex-col overflow-hidden rounded-lg border border-steel-100 bg-white has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-cyan has-[a:focus-visible]:ring-offset-2">
      {/* Image well. Contain rather than cover, so a machine is never cropped;
          multiply blends a product shot's white background into the well. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-steel-50">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            className="zoom-img object-contain p-6 mix-blend-multiply"
            sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2.5 text-graphite/25">
            <Package size={30} strokeWidth={1.25} />
            <span className="text-[11px] font-medium uppercase tracking-[0.14em]">
              Image coming soon
            </span>
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <p className="truncate text-[11px] font-semibold uppercase tracking-[0.14em] text-cyan-deep">
          {categoryName}
        </p>

        <h3 className="mt-2 line-clamp-2 font-display text-[17px] font-semibold leading-snug text-graphite">
          {href ? (
            // Stretched link: its ::after covers the whole card, so the image
            // and blank space are clickable too, while the quote button below
            // stays a separate control rather than a button nested in a link.
            <Link
              href={href}
              className="transition-colors after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-hover:text-cyan-deep"
            >
              {name}
            </Link>
          ) : (
            name
          )}
        </h3>

        {tagline && (
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-graphite/60">
            {tagline}
          </p>
        )}

        {/* Footer, in three layers so each spacing job is separate:
              outer — mt-auto pins it to the bottom; pt-5 keeps a gap from the
                      text above even on the tallest card, where mt-auto is 0
              rule  — the divider and the space beneath it
              row   — a fixed h-9, so every card's footer lines up. (A min-height
                      on the padded rule element counted the padding — border-box
                      sizing — and so constrained nothing.) */}
        <div className="mt-auto pt-5">
          <div className="border-t border-steel-100 pt-4">
            <div className="flex h-9 items-center justify-between gap-3">
              {needsModelChoice ? (
                <span className="text-[13px] font-medium text-graphite/60">
                  {modelCount} models available
                </span>
              ) : (
                <div className="relative z-10">
                  <AddToQuoteButton
                    name={name}
                    categorySlug={categorySlug}
                    categoryName={categoryName}
                    image={image}
                    variants={variants}
                    size="sm"
                  />
                </div>
              )}
              {href && (
                // Visual cue only: the stretched title link already makes the
                // whole card the link, so this is hidden from assistive tech.
                <span
                  aria-hidden
                  className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-steel-200 text-graphite/60 transition-colors group-hover:border-graphite group-hover:bg-graphite group-hover:text-white"
                >
                  <ArrowRight size={16} className="arrow-icon" />
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
