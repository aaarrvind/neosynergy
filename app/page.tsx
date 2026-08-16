import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Package, Wrench, Headphones } from "lucide-react";
import { Container } from "@/components/Container";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ProductCard } from "@/components/ProductCard";
import { HeroCarousel, HeroSlide } from "@/components/HeroCarousel";
import { Eyebrow } from "@/components/Eyebrow";
import { getCategoryTree, getServices, getProductBySlug } from "@/lib/supabase/queries";

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

// What you can expect — factual value props from the company profile
const valueProps = [
  {
    icon: Package,
    title: "Complete portfolio",
    body: "Machine tools, automation, cutting tools, and accessories from a single supplier across the UAE and GCC.",
  },
  {
    icon: Wrench,
    title: "Turnkey delivery",
    body: "Supply, installation, commissioning, and maintenance handled by one accountable team — from spec to production.",
  },
  {
    icon: Headphones,
    title: "Service & retrofit",
    body: "On-site support and GSK control retrofits that extend the working life and accuracy of your machines.",
  },
];

export default async function HomePage() {
  const [tree, services] = await Promise.all([getCategoryTree(), getServices()]);
  const featuredProducts = await Promise.all(featuredSlugs.map((s) => getProductBySlug(s)));

  return (
    <>
      {/* Hero */}
      <HeroCarousel slides={heroSlides} />

      {/* What you can expect */}
      <section className="border-b border-steel-100 py-16 lg:py-20">
        <Container>
          <div className="grid gap-10 sm:grid-cols-3 sm:gap-8">
            {valueProps.map(({ icon: Icon, title, body }) => (
              <div key={title}>
                <Icon size={26} strokeWidth={1.75} className="text-cyan-deep" />
                <h3 className="mt-4 font-display text-lg font-semibold text-graphite">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-graphite/60">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Product categories */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow label="Product portfolio" className="text-cyan-deep" />
              <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Browse by category
              </h2>
            </div>
            <Link
              href="/products"
              className="arrow-link pressable inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep hover:text-graphite"
            >
              View all products <ArrowRight size={16} className="arrow-icon" />
            </Link>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2">
            {tree.map((node) => (
              <Link
                key={node.id}
                href={`/products/${node.pathSlugs.join("/")}`}
                className="zoom arrow-link relative flex aspect-[16/10] flex-col justify-end overflow-hidden rounded-lg"
              >
                {node.heroImage && (
                  <Image
                    src={node.heroImage}
                    alt={node.name}
                    fill
                    className="zoom-img object-cover"
                    sizes="(min-width: 640px) 50vw, 100vw"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-graphite via-graphite/45 to-transparent" />
                <div className="relative z-10 p-6">
                  <h3 className="font-display text-xl font-semibold text-white">
                    {node.name}
                  </h3>
                  <p className="mt-1 max-w-md text-sm text-white/70">{node.intro}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-white">
                    Explore {node.shortName || node.name}
                    <ArrowRight size={15} className="arrow-icon text-cyan" />
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
              <Eyebrow label="Stock & popular models" className="text-cyan-deep" />
              <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                Featured machines
              </h2>
            </div>
            <Link
              href="/products"
              className="arrow-link pressable inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep hover:text-graphite"
            >
              All machines <ArrowRight size={16} className="arrow-icon" />
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

      {/* Services */}
      <section className="py-20 lg:py-24">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <Eyebrow label="Services" className="text-cyan-deep" />
              <h2 className="mt-3 font-display text-3xl font-bold text-graphite sm:text-4xl">
                What we do
              </h2>
            </div>
            <Link
              href="/services"
              className="arrow-link pressable inline-flex items-center gap-2 text-sm font-semibold text-cyan-deep hover:text-graphite"
            >
              All services <ArrowRight size={16} className="arrow-icon" />
            </Link>
          </div>

          <div className="mt-10 grid gap-px overflow-hidden rounded-lg border border-steel-100 bg-steel-100 sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => (
              <div
                key={service.slug}
                className="flex gap-4 bg-white p-6 transition-colors hover:bg-steel-50"
              >
                <div className="mt-0.5 flex-shrink-0 text-cyan-deep">
                  <ServiceIcon name={service.icon} size={24} />
                </div>
                <div>
                  <h3 className="font-display text-base font-semibold text-graphite">
                    {service.name}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-graphite/60">
                    {service.shortDescription}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Who we are */}
      <section className="bg-steel-50 py-20 lg:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/hero-handson.jpg"
                alt="Technician working on a sheet-metal bending machine"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div>
              <Eyebrow label="Our company" className="text-cyan-deep" />
              <h2 className="mt-3 font-display text-3xl font-bold leading-tight text-graphite sm:text-4xl">
                One partner, from specification to production.
              </h2>
              <p className="mt-5 text-base leading-relaxed text-graphite/70">
                Neo Synergy Machinery Trading is a Dubai-based machinery trading and
                production company. We supply and customise machine tools, automation,
                and accessories for the industrial sector — installed, commissioned, and
                maintained by our own team, with a focus on sustainability and long
                service life.
              </p>
              <p className="mt-4 text-base leading-relaxed text-graphite/70">
                Through our engineering partner Synergy International, we also design and
                build special-purpose machinery for the steel, aluminium, aviation, and
                mining sectors.
              </p>
              <Link
                href="/about"
                className="pressable mt-7 inline-flex items-center gap-2 rounded border border-graphite/20 px-5 py-2.5 text-sm font-semibold text-graphite hover:border-graphite hover:bg-graphite hover:text-white"
              >
                More about Neo Synergy <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-transparent py-20 text-graphite lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Eyebrow label="Get started" className="text-cyan" />
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Ready to get a quotation?
              </h2>
              <p className="mt-4 max-w-xl text-graphite/70">
                Add the machines and accessories you need to your quote request, and our
                team will respond with pricing, availability, and lead times.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/quote"
                className="pressable inline-flex items-center rounded bg-cyan px-6 py-3 text-sm font-semibold text-graphite hover:bg-cyan-deep hover:text-white"
              >
                Request a quote
              </Link>
              <Link
                href="/contact"
                className="pressable inline-flex items-center rounded border border-graphite/40 px-6 py-3 text-sm font-semibold text-graphite hover:bg-graphite hover:text-white"
              >
                Talk to our team
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
