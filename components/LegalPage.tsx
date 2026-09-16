import { Container } from "./Container";

/**
 * Shared shell for policy pages. Long-form legal copy needs a narrower measure
 * and tighter heading rhythm than the marketing pages, so the prose styles live
 * here rather than being repeated per page.
 */
export function LegalPage({
  eyebrow,
  title,
  summary,
  lastUpdated,
  children,
}: {
  eyebrow: string;
  title: string;
  summary: string;
  /** ISO date — rendered for readers and machine-readable in <time>. */
  lastUpdated: string;
  children: React.ReactNode;
}) {
  const formatted = new Date(lastUpdated).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <>
      <section className="border-b border-steel-100 py-14 lg:py-16">
        <Container>
          <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-cyan-deep">
            {eyebrow}
          </p>
          <h1 className="mt-4 max-w-2xl font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
            {title}
          </h1>
          <p className="mt-5 max-w-[68ch] text-[15px] leading-[1.75] text-graphite/65">
            {summary}
          </p>
          <p className="mt-6 text-xs uppercase tracking-[0.1em] text-graphite/40">
            Last updated{" "}
            <time dateTime={lastUpdated} className="text-graphite/60">
              {formatted}
            </time>
          </p>
        </Container>
      </section>

      <section className="py-14 lg:py-16">
        <Container>
          <div
            className="
              max-w-[68ch] text-[15px] leading-[1.75] text-graphite/70
              [&_a]:font-medium [&_a]:text-cyan-deep hover:[&_a]:text-graphite
              [&_h2]:mt-12 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-graphite
              first:[&_h2]:mt-0
              [&_h3]:mt-8 [&_h3]:font-display [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-graphite
              [&_p]:mt-4
              [&_ul]:mt-4 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5
              [&_li]:list-disc [&_li]:marker:text-steel-300
            "
          >
            {children}
          </div>
        </Container>
      </section>
    </>
  );
}
