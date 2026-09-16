import Link from "next/link";
import { ArrowRight, Search } from "lucide-react";
import { Container } from "@/components/Container";

// Rendered inside the root layout, so the header, mega menu, and footer are
// already present — this only needs to explain the miss and offer a way back.
export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-24">
      <div className="max-w-xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-cyan-deep">
          Error 404
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
          We couldn&rsquo;t find that page.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-graphite/65">
          The link may be out of date, or the machine you&rsquo;re looking for may
          have moved to a different part of the catalogue. Browse the full range
          below, or tell us what you need and our team will point you to it.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/products"
            className="pressable inline-flex items-center gap-2 rounded bg-cyan px-6 py-3 text-sm font-semibold text-graphite hover:bg-cyan-deep hover:text-white"
          >
            Browse all machines <ArrowRight size={16} />
          </Link>
          <Link
            href="/contact"
            className="pressable inline-flex items-center rounded border border-graphite/25 px-6 py-3 text-sm font-semibold text-graphite hover:border-graphite hover:bg-graphite hover:text-white"
          >
            Talk to our team
          </Link>
        </div>

        <p className="mt-8 flex items-center gap-2 text-sm text-graphite/50">
          <Search size={15} />
          Press <kbd className="rounded border border-steel-200 px-1.5 py-0.5 font-mono text-xs">⌘K</kbd> to
          search products and categories.
        </p>
      </div>
    </Container>
  );
}
