"use client";

import { useEffect } from "react";
import Link from "next/link";
import { RotateCw } from "lucide-react";
import { Container } from "@/components/Container";
import { company } from "@/lib/data/company";

// Catches render errors below the root layout — most likely a Supabase read
// failing on a cold render. The digest is the only safe thing to show: Next
// strips the real message in production to avoid leaking server internals.
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] unhandled render error:", error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col justify-center py-24">
      <div className="max-w-xl">
        <p className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-spark">
          Something went wrong
        </p>
        <h1 className="mt-4 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
          This page didn&rsquo;t load.
        </h1>
        <p className="mt-5 text-base leading-relaxed text-graphite/65">
          A temporary problem stopped us rendering this page. Trying again will
          usually fix it. If it keeps happening, call us on{" "}
          <a href={`tel:${company.phones[0].replace(/\s/g, "")}`} className="font-medium text-cyan-deep hover:text-graphite">
            {company.phones[0]}
          </a>{" "}
          or email{" "}
          <a href={`mailto:${company.emails[0]}`} className="font-medium text-cyan-deep hover:text-graphite">
            {company.emails[0]}
          </a>
          .
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <button
            onClick={reset}
            className="pressable inline-flex items-center gap-2 rounded bg-cyan px-6 py-3 text-sm font-semibold text-graphite hover:bg-cyan-deep hover:text-white"
          >
            <RotateCw size={16} /> Try again
          </button>
          <Link
            href="/"
            className="pressable inline-flex items-center rounded border border-graphite/25 px-6 py-3 text-sm font-semibold text-graphite hover:border-graphite hover:bg-graphite hover:text-white"
          >
            Back to home
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 font-mono text-xs text-graphite/35">
            Reference: {error.digest}
          </p>
        )}
      </div>
    </Container>
  );
}
