import Image from "next/image";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { ServiceIcon } from "@/components/ServiceIcon";
import { ProductCard } from "@/components/ProductCard";
import { getCategoryTree, getServices, getProductBySlug } from "@/lib/supabase/queries";

const featuredSlugs = ["vmc-850", "cnc-lathe-1020", "vmc-650", "rtm-u324"];

export default async function HomePage() {
  const [tree, services] = await Promise.all([getCategoryTree(), getServices()]);
  const featuredProducts = await Promise.all(featuredSlugs.map((s) => getProductBySlug(s)));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-graphite text-white">
        <Container className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">
              Machinery trading &amp; production — Dubai, UAE
            </p>
            <h1 className="mt-4 font-display text-4xl font-bold leading-tight sm:text-5xl">
              Building machines{" "}
              <span className="text-cyan">for a better tomorrow</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70">
              Neo Synergy Machinery Trading LLC is a machinery trading and production company based in Dubai,
              specializing in the trade and customization of machine tools, equipment, and accessories for the industrial sector.
            </p>
            <div className="mt-8 flex flex-wrap gap-4">
              <Link href="/products" className="inline-flex items-center gap-2 rounded-md bg-cyan px-5 py-3 text-sm font-medium text-graphite transition-colors hover:bg-white">
                Browse the catalog <ArrowRight size={16} />
              </Link>
              <Link href="/quote" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-cyan hover:text-cyan">
                <FileText size={16} /> Request a quote
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-lg" style={{ clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0% 100%)" }}>
              <Image src="/images/hero-robot-sparks.jpg" alt="Robotic arc welding cell with sparks" fill priority className="object-cover" sizes="(min-width: 1024px) 50vw, 100vw" />
            </div>
            <div className="absolute -bottom-6 -left-6 hidden h-28 w-28 rounded-lg border border-cyan/30 sm:block" />
          </div>
        </Container>
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
