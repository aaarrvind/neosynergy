import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/Container";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel, HeroSlide } from "@/components/HeroCarousel";
import { getCategoryTree, getServices, getProductBySlug } from "@/lib/supabase/queries";

// Left-aligned mono eyebrow with an indicator tick — matches the hero kicker
function Eyebrow({ label, className = "" }: { label: string; className?: string }) {
  return (
    <p className={`flex items-center gap-2.5 font-mono text-[0.7rem] uppercase tracking-[0.28em] ${className}`}>
      <span className="inline-block h-1.5 w-1.5 rounded-[1px] bg-current" />
      {label}
    </p>
  );
}

const turnkeySteps = ["Supply", "Install", "Commission", "Maintain"];

const featuredSlugs = ["vmc-850", "cnc-lathe-1020", "vmc-650", "rtm-u324"];

// Hero carousel — one slide per capability area. All copy is drawn from the
// company profile / services; no invented figures.
const heroSlides: HeroSlide[] = [
  {
    key: "machine-tools",
    image: "/images/hero-robot-sparks.jpg",
    kicker: "Machinery Trading & Production — Dubai, UAE",
    headlineTop: "Building machines",
    headlineAccent: "for a better tomorrow.",
    subcopy:
      "We supply, install, commission, and maintain machine tools, automation, and cutting tools across the UAE and wider GCC — one accountable partner, from specification to production.",
  },
  {
    key: "automation",
    image: "/images/hero-sparks.jpg",
    kicker: "Automation & Robotics",
    headlineTop: "Robotic cells,",
    headlineAccent: "built around your line.",
    subcopy:
      "From single robot arms to complete automated welding, loading, and pack-stacking lines — supplied with GSK controls, drives, and end-of-arm tooling, configured for your cycle time.",
  },
  {
    key: "retrofitting",
    image: "/images/hero-lathe-closeup.jpg",
    kicker: "Retrofitting & Control Upgrades",
    headlineTop: "New control on",
    headlineAccent: "the machines you own.",
    subcopy:
      "We retrofit existing lathes, mills, grinders, and machining centres with current-generation GSK controls, drives, and servo motors — extending asset life and sharpening accuracy.",
  },
  {
    key: "special-purpose",
    image: "/images/hero-milling.jpg",
    kicker: "Special-Purpose Machinery",
    headlineTop: "Engineered for",
    headlineAccent: "your exact process.",
    subcopy:
      "When a standard machine can't meet your process, our engineering partner Synergy International designs and builds purpose-built machinery for steel, aluminium, aviation, and beyond.",
  },
];

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
      <HeroCarousel slides={heroSlides} capabilities={heroCapabilities} />

      {/* Who we are */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            {/* Image with registration marks */}
            <div className="relative order-last lg:order-first">
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
                <Image
                  src="/images/hero-handson.jpg"
                  alt="Technician working on a sheet-metal bending machine"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 50vw, 100vw"
                />
              </div>
              <span aria-hidden className="pointer-events-none absolute -left-2 -top-2 h-9 w-9 border-l-2 border-t-2 border-cyan/60" />
              <span aria-hidden className="pointer-events-none absolute -bottom-2 -right-2 h-9 w-9 border-b-2 border-r-2 border-cyan/60" />
            </div>

            <div>
              <Eyebrow label="Who we are" className="text-cyan-deep" />
              <h2 className="mt-4 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                One partner, from specification to production.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-graphite/70">
                Neo Synergy provides turnkey solutions across machine tools, cutting
                tools, automation, and robotics — supplied, installed, commissioned, and
                maintained by one accountable team, with a focus on sustainability and
                long service life.
              </p>

              {/* Turnkey pipeline */}
              <ol className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {turnkeySteps.map((step, i) => (
                  <li key={step} className="rounded-lg border border-steel-100 bg-steel-50 px-4 py-3">
                    <span className="font-mono text-xs font-medium text-cyan-deep">
                      0{i + 1}
                    </span>
                    <p className="mt-1 font-display text-sm font-semibold text-graphite">
                      {step}
                    </p>
                  </li>
                ))}
              </ol>

              <Link
                href="/about"
                className="mt-8 inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep transition-all hover:gap-3"
              >
                More about Neo Synergy <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* Services */}
      <section className="bg-steel-50 py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow label="What we do" className="text-cyan-deep" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Our services
              </h2>
            </div>
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep transition-all hover:gap-3"
            >
              All services <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <div
                key={service.slug}
                className="group relative flex flex-col gap-5 overflow-hidden rounded-xl border border-steel-100 bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-cyan/50 hover:shadow-lg hover:shadow-graphite/5"
              >
                <span className="absolute inset-x-0 top-0 h-0.5 origin-left scale-x-0 bg-cyan transition-transform duration-300 group-hover:scale-x-100" />
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-deep">
                    <ServiceIcon name={service.icon} size={22} />
                  </div>
                  <span className="font-mono text-xs text-graphite/25">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold text-graphite">
                    {service.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-graphite/60">
                    {service.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Category cards */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow label="Catalog" className="text-cyan-deep" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Browse by category
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep transition-all hover:gap-3"
            >
              View all products <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {tree.map((node) => (
              <Link
                key={node.id}
                href={`/products/${node.pathSlugs.join("/")}`}
                className="group relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-xl"
              >
                {node.heroImage && (
                  <Image
                    src={node.heroImage}
                    alt={node.name}
                    fill
                    className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/40 to-transparent" />
                <span aria-hidden className="pointer-events-none absolute right-4 top-4 h-6 w-6 border-r border-t border-white/30" />
                <div className="relative z-10 p-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {node.name}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-white/70">{node.intro}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-cyan transition-all group-hover:gap-2.5">
                    Explore {node.shortName || node.name}
                    <ArrowRight size={15} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* Featured products */}
      <section className="bg-steel-50 py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow label="Popular models" className="text-cyan-deep" />
              <h2 className="mt-4 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Featured machines
              </h2>
            </div>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep transition-all hover:gap-3"
            >
              All machines <ArrowRight size={16} />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => {
              if (!product) return null;
              const cat = tree
                .flatMap((n) => [n, ...n.children, ...n.children.flatMap((c) => c.children)])
                .find((n) => n.id === product.categoryId);
              return (
                <ProductCard
                  key={product.slug}
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
      <section className="relative isolate overflow-hidden bg-graphite py-20 text-white lg:py-24">
        <div aria-hidden className="panel-grid absolute inset-0" />
        <div aria-hidden className="pointer-events-none absolute inset-0">
          <span className="absolute left-6 top-6 h-8 w-8 border-l border-t border-cyan/40" />
          <span className="absolute bottom-6 right-6 h-8 w-8 border-b border-r border-cyan/40" />
        </div>
        <Container className="relative">
          <div className="mx-auto max-w-2xl text-center">
            <Eyebrow label="Get started" className="justify-center text-cyan" />
            <h2 className="mt-4 font-display text-3xl font-bold sm:text-4xl">
              Ready to get a quotation?
            </h2>
            <p className="mt-4 text-white/70">
              Add the machines and accessories you need to your quote request, and our
              team will respond with pricing, availability, and lead times.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Link
                href="/quote"
                className="group inline-flex items-center gap-2 rounded-md bg-cyan px-6 py-3.5 text-sm font-semibold text-graphite transition-colors hover:bg-white"
              >
                <FileText size={16} /> Go to quote request
              </Link>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 rounded-md border border-white/25 bg-white/5 px-6 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:border-cyan hover:text-cyan"
              >
                Talk to our team <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
