import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { QuoteForm } from "@/components/QuoteForm";

export const metadata: Metadata = {
  title: "Request a Quote",
  description:
    "Review the items in your quote request and send your details to Neo Synergy Machinery Trading for pricing, availability, and lead times.",
  alternates: { canonical: "/quote" },
  robots: { index: false, follow: true },
};

export default function QuotePage() {
  return (
    <section className="py-16">
      <Container>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan-deep">
          Quote request
        </p>
        <h1 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
          Review your request
        </h1>
        <p className="mt-3 max-w-2xl text-graphite/60">
          Adjust quantities, add notes for each item, then send us your
          details. We&apos;ll reply by email with pricing and lead times.
        </p>
        <div className="mt-10">
          <QuoteForm />
        </div>
      </Container>
    </section>
  );
}
