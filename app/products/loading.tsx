import { Container } from "@/components/Container";

// Product and category pages render on demand (dynamicParams), so a cold URL
// waits on a Supabase round-trip. This skeleton holds the layout steady in
// roughly the shape of a category page instead of showing a blank viewport.
//
// Animation is driven by `animate-pulse`, which Tailwind's own
// prefers-reduced-motion handling and the global rule in globals.css disable.
export default function Loading() {
  return (
    <Container className="py-16">
      <div aria-hidden className="animate-pulse">
        {/* Breadcrumb */}
        <div className="h-3 w-48 rounded bg-steel-100" />

        {/* Title block */}
        <div className="mt-6 h-9 w-2/3 max-w-md rounded bg-steel-100" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-steel-100" />
        <div className="mt-2 h-4 w-4/5 max-w-xl rounded bg-steel-100" />

        {/* Card grid */}
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-lg border border-steel-100">
              <div className="aspect-[4/3] bg-steel-100" />
              <div className="p-5">
                <div className="h-4 w-3/4 rounded bg-steel-100" />
                <div className="mt-3 h-3 w-full rounded bg-steel-100" />
                <div className="mt-2 h-3 w-5/6 rounded bg-steel-100" />
              </div>
            </div>
          ))}
        </div>
      </div>

      <span className="sr-only" role="status">
        Loading products…
      </span>
    </Container>
  );
}
