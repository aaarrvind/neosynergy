import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryTree, getServices, getProductBySlug } from "@/lib/supabase/queries";

const featuredSlugs = ["vmc-850", "cnc-lathe-1020", "vmc-650", "rtm-u324"];

// Capability signals — all drawn from the company profile, no invented figures
const heroCapabilities = [
  { value: "Turnkey", label: "Supply · install · commission" },
  { value: "GCC-wide", label: "UAE & the wider Gulf" },
  { value: "Retrofit", label: "GSK control & automation" },
  { value: "Bespoke", label: "Special-purpose machinery" },
];

export default async function HomePage() {
  const [tree, services] = await Promise.all([getCategoryTree(), getServices()]);
  const featuredProducts = await Promise.all(featuredSlugs.map((s) => getProductBySlug(s)));

  return (
    <>
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-graphite text-white">
        {/* Full-bleed background */}
        <div className="absolute inset-0 -z-10">
          <Image
            src="/images/hero-robot-sparks.jpg"
            alt=""
            fill
            priority
            sizes="100vw"
            className="hero-drift object-cover object-[70%_center]"
          />
          {/* Legibility scrims: dark on the left where the copy sits, plus a base darkening */}
          <div className="absolute inset-0 bg-gradient-to-r from-graphite via-graphite/90 to-graphite/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-graphite via-transparent to-graphite/50" />
          {/* Blueprint grid */}
          <div className="hero-grid absolute inset-0" />
        </div>

        {/* Corner registration marks (blueprint motif) */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute left-5 top-5 h-6 w-6 border-l border-t border-cyan/40 sm:left-8 sm:top-8" />
          <span className="absolute bottom-5 right-5 h-6 w-6 border-b border-r border-cyan/40 sm:bottom-8 sm:right-8" />
        </div>

        <Container className="relative flex min-h-[36rem] flex-col justify-center py-20 lg:min-h-[42rem] lg:py-28">
          <div className="max-w-2xl">
            <p
              className="hero-rise flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.28em] text-cyan"
              style={{ animationDelay: "0.05s" }}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-cyan shadow-[0_0_8px_rgba(20,184,224,0.85)]" />
              Machinery Trading &amp; Production — Dubai, UAE
            </p>

            <h1
              className="hero-rise mt-5 font-display text-4xl font-bold leading-[1.04] sm:text-5xl lg:text-6xl"
              style={{ animationDelay: "0.12s" }}
            >
              Building machines
              <br />
              <span className="text-cyan">for a better tomorrow.</span>
            </h1>

            <div
              className="hero-line mt-6 h-px w-24 bg-gradient-to-r from-cyan to-transparent"
              style={{ animationDelay: "0.34s" }}
            />

            <p
              className="hero-rise mt-6 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg"
              style={{ animationDelay: "0.2s" }}
            >
              We supply, install, commission, and maintain machine tools, automation,
              and cutting tools across the UAE and wider GCC — one accountable partner,
              from specification to production.
            </p>

            <div
              className="hero-rise mt-9 flex flex-wrap gap-3"
              style={{ animationDelay: "0.28s" }}
            >
              <Link
                href="/products"
                className="group inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-graphite transition-colors hover:bg-white"
              >
                Browse the catalog
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/quote"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-cyan hover:text-cyan"
              >
                <FileText size={16} /> Request a quote
              </Link>
            </div>
          </div>

          {/* Capability strip */}
          <div
            className="hero-rise mt-14 grid max-w-3xl grid-cols-2 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 backdrop-blur-sm sm:grid-cols-4"
            style={{ animationDelay: "0.36s" }}
          >
            {heroCapabilities.map((c) => (
              <div key={c.value} className="bg-graphite/50 px-5 py-4">
                <p className="font-display text-lg font-semibold text-white">{c.value}</p>
                <p className="mt-0.5 text-xs leading-snug text-white/55">{c.label}</p>
              </div>
            ))}
          </div>
        </Container>

        {/* Coordinate readout (precision motif) */}
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-6 right-8 hidden font-mono text-[0.65rem] tracking-wider text-white/25 lg:block"
        >
          N 25.20° · E 55.27°
        </span>
      </section>

      {/* Who we are */}
      <section className="py-16">
        <Container>
          <SectionDivider label="Who we are" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image src="/images/hero-handson.jpg" alt="Technician working on a sheet metal bending machine" fill className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
                A one-stop solution for the supply, installation, commissioning, and maintenance of manufacturing machines.
              </h2>
              <p className="mt-4 text-base leading-relaxed text-graphite/70">
                Our vision is to provide turnkey solutions across machine tools, cutting tools, automation, and robotics — with products and services geared towards sustainability and longevity.
              </p>
              <Link href="/about" className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-cyan-deep hover:underline">
                More about Neo Synergy <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="bg-steel-50 py-16">
        <Container>
          <SectionDivider label="What we do" />
          <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">Our services</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div key={service.slug} className="flex flex-col gap-3 rounded-lg border border-steel-100 bg-white p-6">
                <div className="flex h-11 w-11 items-center justify-center rounded-md bg-cyan-50 text-cyan-deep">
                  <ServiceIcon name={service.icon} size={22} />
                </div>
                <h3 className="font-display text-lg font-medium text-graphite">{service.name}</h3>
                <p className="text-sm leading-relaxed text-graphite/60">{service.shortDescription}</p>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/services" className="inline-flex items-center gap-2 text-sm font-medium text-cyan-deep hover:underline">
              All services <ArrowRight size={16} />
            </Link>
          </div>
        </Container>
      </section>

      {/* Category cards */}
      <section className="py-16">
        <Container>
          <SectionDivider label="Catalog" />
          <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">Browse by category</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((node) => (
              <Link key={node.id} href={`/products/${node.pathSlugs.join("/")}`}
                className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg">
                {node.heroImage && (
                  <Image src={node.heroImage} alt={node.name} fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent" />
                <div className="relative z-10 p-5">
                  <h3 className="font-display text-lg font-semibold text-white">{node.name}</h3>
                  <p className="mt-1 text-sm text-white/70">{node.intro}</p>
                  {node.children.length > 0 && (
                    <p className="mt-1 text-xs text-cyan/80">{node.children.length} subcategories</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="bg-steel-50 py-16">
        <Container>
          <SectionDivider label="Popular models" />
          <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">Featured machines</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              if (!product) return null;
              const cat = tree.flatMap(n => [n, ...n.children, ...n.children.flatMap(c => c.children)])
                .find(n => n.id === product.categoryId);
              return (
                <ProductCard key={product.slug}
                  name={product.name}
                  description={product.tagline}
                  image={product.image}
                  href={`/products/${product.categoryPath.join("/")}/${product.slug}`}
                  categorySlug={product.categorySlug}
                  categoryName={cat?.name ?? product.categorySlug}
                  variants={product.variants}
                />
              );
            })}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="py-16">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-lg bg-graphite p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Ready to get a quotation?</h2>
              <p className="mt-2 max-w-xl text-white/70">
                Add the machines and accessories you need to your quote request, and our team will respond with pricing, availability, and lead times.
              </p>
            </div>
            <Link href="/quote" className="inline-flex items-center gap-2 rounded-md bg-cyan px-5 py-3 text-sm font-medium text-graphite transition-colors hover:bg-white">
              <FileText size={16} /> Go to quote request
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
