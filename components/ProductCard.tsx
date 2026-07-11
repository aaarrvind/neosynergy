import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  return (
    <div className="flex flex-col overflow-hidden rounded-lg border border-steel-100 bg-white transition-shadow hover:shadow-md">
      <div className="relative aspect-[4/3] w-full bg-steel-50">
        {image ? (
          <Image
            src={image}
            alt={name}
            fill
            className="object-cover"
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-graphite/30">
            Image coming soon
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          {href ? (
            <Link href={href} className="font-display text-base font-medium text-graphite hover:text-cyan-deep">
              {name}
            </Link>
          ) : (
            <h3 className="font-display text-base font-medium text-graphite">{name}</h3>
          )}
          <p className="mt-1 text-sm text-graphite/60 line-clamp-3">{description}</p>
        </div>
        <div className="mt-auto flex items-center justify-between gap-2 pt-2">
          <AddToQuoteButton
            name={name}
            categorySlug={categorySlug}
            categoryName={categoryName}
            image={image}
            variants={variants}
            size="sm"
          />
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs font-medium text-cyan-deep hover:underline"
            >
              Details <ArrowRight size={14} />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
