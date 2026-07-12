import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { ProductCard } from "@/components/ProductCard";
import { SpecReadout } from "@/components/SpecReadout";
import { AddToQuoteButton } from "@/components/AddToQuoteButton";
import { JsonLd } from "@/components/JsonLd";
import { ProductGallery } from "@/components/ProductGallery";
import {
  getCategoryTree, flattenTree, findNodeByPath,
  getProductsByCategory, getProductBySlug,
  getAllCategorySlugs, getAllProductSlugs
} from "@/lib/supabase/queries";
import { company } from "@/lib/data/company";
import { CategoryNode } from "@/lib/types";

// Re-render from Supabase every 5 minutes so admin edits reach the public site
export const revalidate = 300;

// Build all static paths at build time
export async function generateStaticParams() {
  const [catPaths, prodPaths] = await Promise.all([
    getAllCategorySlugs(),
    getAllProductSlugs(),
  ]);
  return [
    // /products (no slug)
    { slug: undefined },
    // category pages: /products/machine-tools/cnc-lathes etc
    ...catPaths.map(c => ({ slug: c.category })),
    // product pages: /products/machine-tools/cnc-lathes/cnc-lathe-1020
    ...prodPaths.map(p => ({ slug: [...p.category, p.slug] })),
  ];
}

export async function generateMetadata({
  params,
}: {
  params: { slug?: string[] };
}): Promise<Metadata> {
  const slugs = params.slug ?? [];
  const tree = await getCategoryTree();

  // No slug → products index
  if (slugs.length === 0) {
    return {
      title: "Products — Machine Tools, Automation & Accessories",
      description: "Browse Neo Synergy's full product catalog.",
      alternates: { canonical: "/products" },
    };
  }

  // Try category first
  const node = findNodeByPath(tree, slugs);
  if (node) {
    return {
      title: node.name,
      description: node.metaDescription || node.intro,
      alternates: { canonical: `/products/${slugs.join("/")}` },
    };
  }

  // Try product (last slug = product slug, rest = category path)
  const productSlug = slugs[slugs.length - 1];
  const product = await getProductBySlug(productSlug);
  if (product) {
    return {
      title: product.name,
      description: `${product.tagline}. ${product.description[0] ?? ""}`,
      keywords: product.keywords,
      alternates: { canonical: `/products/${slugs.join("/")}` },
    };
  }

  return {};
}

// ---------------------------------------------------------------
// Breadcrumb component
// ---------------------------------------------------------------
function Breadcrumb({ pathSlugs, pathNames }: { pathSlugs: string[]; pathNames: string[] }) {
  return (
    <nav className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-white/50 flex-wrap">
      <Link href="/products" className="hover:text-cyan">Products</Link>
      {pathSlugs.map((slug, i) => (
        <span key={slug} className="flex items-center gap-1">
          <ChevronRight size={11} />
          {i < pathSlugs.length - 1 ? (
            <Link href={`/products/${pathSlugs.slice(0, i + 1).join("/")}`} className="hover:text-cyan">
              {pathNames[i]}
            </Link>
          ) : (
            <span className="text-cyan">{pathNames[i]}</span>
          )}
        </span>
      ))}
    </nav>
  );
}

// ---------------------------------------------------------------
// Products index page (/products)
// ---------------------------------------------------------------
async function ProductsIndexPage({ tree }: { tree: CategoryNode[] }) {
  return (
    <>
      <section className="bg-graphite py-16 text-white">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Catalog</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">Products</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Browse the full catalog — add machines, controllers, and accessories to your quote request.
          </p>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <SectionDivider label="Categories" />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {tree.map((node, i) => (
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
                    <p className="mt-2 text-xs text-cyan/80">{node.children.length} subcategories</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------
// Category page (any depth)
// ---------------------------------------------------------------
async function CategoryPage({ node }: { node: CategoryNode }) {
  const products = await getProductsByCategory(node.id);

  return (
    <>
      <section className="bg-graphite py-12 text-white">
        <Container>
          <Breadcrumb pathSlugs={node.pathSlugs} pathNames={node.pathNames} />
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{node.name}</h1>
          <p className="mt-3 max-w-2xl text-white/70">{node.intro}</p>
        </Container>
      </section>

      {/* Description */}
      {node.description.length > 0 && (
        <section className="py-12">
          <Container>
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              {node.heroImage && (
                <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
                  <Image src={node.heroImage} alt={node.name} fill className="object-cover"
                    sizes="(min-width: 1024px) 50vw, 100vw" />
                </div>
              )}
              <div>
                {node.description.map((p, i) => (
                  <p key={i} className="mb-4 leading-relaxed text-graphite/70 last:mb-0">{p}</p>
                ))}
              </div>
            </div>
          </Container>
        </section>
      )}

      {/* Subcategories */}
      {node.children.length > 0 && (
        <section className="bg-steel-50 py-12">
          <Container>
            <SectionDivider label="Subcategories" />
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {node.children.map(child => (
                <Link key={child.id} href={`/products/${child.pathSlugs.join("/")}`}
                  className="group relative flex aspect-[4/3] flex-col justify-end overflow-hidden rounded-lg border border-steel-100">
                  {child.heroImage && (
                    <Image src={child.heroImage} alt={child.name} fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-graphite/90 via-graphite/20 to-transparent" />
                  <div className="relative z-10 p-4">
                    <h3 className="font-display text-base font-semibold text-white">{child.name}</h3>
                    <p className="mt-1 text-xs text-white/60 line-clamp-2">{child.intro}</p>
                    {child.children.length > 0 && (
                      <p className="mt-1 text-xs text-cyan/70">{child.children.length} subcategories</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      {/* Products */}
      {products.length > 0 && (
        <section className="py-12">
          <Container>
            <SectionDivider label="Products" />
            <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">
              {node.children.length > 0 ? "Featured products" : "Available products"}
            </h2>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map(product => (
                <ProductCard
                  key={product.slug}
                  name={product.name}
                  description={product.tagline}
                  image={product.image}
                  href={`/products/${product.categoryPath.join("/")}/${product.slug}`}
                  categorySlug={product.categorySlug}
                  categoryName={node.name}
                  variants={product.variants}
                />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

// ---------------------------------------------------------------
// Product page (leaf)
// ---------------------------------------------------------------
async function ProductDetailPage({
  slugs,
  tree,
}: {
  slugs: string[];
  tree: CategoryNode[];
}) {
  const productSlug = slugs[slugs.length - 1];
  const product = await getProductBySlug(productSlug);
  if (!product) notFound();

  const categoryNode = findNodeByPath(tree, product.categoryPath);
  const breadcrumbSlugs = [...product.categoryPath];
  const breadcrumbNames = categoryNode?.pathNames ?? [];

  // Related products in same category
  const related = (await getProductsByCategory(product.categoryId))
    .filter(p => p.slug !== product.slug)
    .slice(0, 4);

  // Resolve hero image: fall back to first gallery image if main image is missing
  const heroImage = product.image || (product.images?.[0]?.url ?? "");

  return (
    <>
      <JsonLd data={{
        "@context": "https://schema.org",
        "@type": "Product",
        name: product.name,
        description: product.tagline,
        image: `${company.website}${heroImage}`,
        brand: { "@type": "Brand", name: company.name },
        offers: {
          "@type": "Offer",
          priceCurrency: "AED",
          availability: "https://schema.org/InStock",
          url: `${company.website}/products/${slugs.join("/")}`,
        },
      }} />

      <section className="bg-graphite py-10 text-white">
        <Container>
          <Breadcrumb
            pathSlugs={breadcrumbSlugs}
            pathNames={[...breadcrumbNames, product.name]}
          />
        </Container>
      </section>

      {/* Hero */}
      <section className="py-12">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">
            {/* Image / gallery */}
            <ProductGallery
              heroImage={heroImage}
              productName={product.name}
              images={product.images}
            />

            <div>
              <h1 className="font-display text-3xl font-bold text-graphite sm:text-4xl">{product.name}</h1>
              <p className="mt-2 text-base font-medium text-cyan-deep">{product.tagline}</p>
              {product.description.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-graphite/70">{p}</p>
              ))}
              <div className="mt-6">
                <AddToQuoteButton
                  name={product.name}
                  categorySlug={product.categorySlug}
                  categoryName={categoryNode?.name ?? product.categorySlug}
                  image={product.image}
                  variants={product.variants}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>

      {/* Specs */}
      {product.specGroups && product.specGroups.length > 0 && (
        <section className="bg-steel-50 py-16">
          <Container>
            <SectionDivider label="Specification" />
            <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">
              Technical specification
            </h2>
            <div className="mt-8 max-w-3xl">
              <SpecReadout specGroups={product.specGroups} variants={product.variants} />
            </div>
          </Container>
        </section>
      )}

      {/* Standard equipment */}
      {product.standardEquipment && product.standardEquipment.length > 0 && (
        <section className="py-16">
          <Container>
            <SectionDivider label="Standard equipment" />
            <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">
              Included as standard
            </h2>
            <ul className="mt-8 grid max-w-3xl gap-3 sm:grid-cols-2">
              {product.standardEquipment.map(item => (
                <li key={item} className="flex items-start gap-2 text-sm text-graphite/70">
                  <CheckCircle2 size={18} className="mt-0.5 flex-shrink-0 text-cyan-deep" />
                  {item}
                </li>
              ))}
            </ul>
          </Container>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="bg-steel-50 py-12">
          <Container>
            <SectionDivider label="Related products" />
            <h2 className="mt-6 font-display text-xl font-semibold text-graphite">
              More in {categoryNode?.name ?? "this category"}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(p => (
                <ProductCard key={p.slug} name={p.name} description={p.tagline}
                  image={p.image}
                  href={`/products/${p.categoryPath.join("/")}/${p.slug}`}
                  categorySlug={p.categorySlug}
                  categoryName={categoryNode?.name ?? p.categorySlug}
                  variants={p.variants} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

// ---------------------------------------------------------------
// Main page router
// ---------------------------------------------------------------
export default async function ProductsPage({
  params,
}: {
  params: { slug?: string[] };
}) {
  const slugs = params.slug ?? [];
  const tree = await getCategoryTree();
  const flat = flattenTree(tree);

  // /products — no slug
  if (slugs.length === 0) return <ProductsIndexPage tree={tree} />;

  // Try to match a category path
  const node = findNodeByPath(tree, slugs);
  if (node) return <CategoryPage node={node} />;

  // Try to match product: last segment = product slug
  const productSlug = slugs[slugs.length - 1];
  const product = await getProductBySlug(productSlug);
  if (product) return <ProductDetailPage slugs={slugs} tree={tree} />;

  notFound();
}
