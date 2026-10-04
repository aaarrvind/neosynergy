import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound, permanentRedirect, redirect } from "next/navigation";
import { ChevronRight, CheckCircle2 } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { ProductCard } from "@/components/ProductCard";
import { SpecReadout } from "@/components/SpecReadout";
import { AddToQuoteButton } from "@/components/AddToQuoteButton";
import { JsonLd } from "@/components/JsonLd";
import { ProductGallery } from "@/components/ProductGallery";
import { AvailableOnRequest } from "@/components/catalog/AvailableOnRequest";
import { CategorySidebar } from "@/components/catalog/CategorySidebar";
import { OpenSearchButton } from "@/components/catalog/OpenSearchButton";
import { ProductListing } from "@/components/catalog/ProductListing";
import { SidebarDrawer } from "@/components/catalog/SidebarDrawer";
import {
  getCategoryTree, flattenTree, findNodeByPath, findNodeById,
  getProductBySlug, getRelatedProducts, getAllCategorySlugs,
  getDirectProductCounts, listProducts,
} from "@/lib/supabase/queries";
import {
  LISTING_PAGE_SIZE, listingQuery, parseListingParams, rollUpCounts, subtreeIds,
} from "@/lib/catalog";
import { company } from "@/lib/data/company";
import { CategoryNode } from "@/lib/types";

// Re-render from Supabase every 5 minutes so admin edits reach the public site
export const revalidate = 300;

// Paths not listed below still render — on first request, then cached by ISR
export const dynamicParams = true;

// Prerender the catalog index and the category tree only. Categories are a
// bounded set and are the main entry points, so they stay fast from the first
// hit. Product pages are deliberately left out: prerendering every one of them
// makes `next build` scale with catalog size (tens of thousands of products
// would mean unworkable build times), and with `dynamicParams` they render on
// first request and are cached from then on.
export async function generateStaticParams() {
  const catPaths = await getAllCategorySlugs();
  return [
    // /products (no slug)
    { slug: undefined },
    // category pages: /products/machine-tools/cnc-lathes etc
    ...catPaths.map(c => ({ slug: c.category })),
  ];
}

export async function generateMetadata({
  params,
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}): Promise<Metadata> {
  const slugs = params.slug ?? [];
  const tree = await getCategoryTree();

  // Listing pages: page 2+ is its own page for search engines (own title,
  // self-canonical) so deep products stay reachable. Sort is ignored — a
  // sorted view is the same content and canonicalises to the unsorted URL.
  // Only called on listing branches, so product pages never read searchParams
  // and stay statically cached.
  const listingMeta = (path: string, title: string) => {
    const { page } = parseListingParams(searchParams);
    return {
      title: page > 1 ? `${title} — Page ${page}` : title,
      canonical: page > 1 ? `${path}?page=${page}` : path,
    };
  };

  // No slug → products index
  if (slugs.length === 0) {
    const meta = listingMeta("/products", "Products — Machine Tools, Automation & Accessories");
    return {
      title: meta.title,
      description: "Browse Neo Synergy's full catalogue of machine tools, automation, and accessories, or ask us to source anything not listed.",
      alternates: { canonical: meta.canonical },
    };
  }

  // Try category first
  const node = findNodeByPath(tree, slugs);
  if (node) {
    const meta = listingMeta(`/products/${slugs.join("/")}`, node.name);
    return {
      title: meta.title,
      description: node.metaDescription || node.intro,
      alternates: { canonical: meta.canonical },
    };
  }

  // Try product (last slug = product slug, rest = category path)
  const productSlug = slugs[slugs.length - 1];
  const product = await getProductBySlug(productSlug);
  if (product) {
    // Only emit metadata for the canonical path — non-canonical requests
    // are redirected by the page component anyway
    const canonicalPath = product.categoryPath.join("/");
    if (slugs.slice(0, -1).join("/") !== canonicalPath) return {};
    return {
      title: product.name,
      description: `${product.tagline}. ${product.description[0] ?? ""}`,
      keywords: product.keywords,
      alternates: { canonical: `/products/${canonicalPath}/${product.slug}` },
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
// Catalogue listing — shared by the index and every category page
// ---------------------------------------------------------------
type SearchParams = Record<string, string | string[] | undefined>;

const sidebarClasses =
  "lg:sticky lg:top-[7.5rem] lg:max-h-[calc(100vh-8.5rem)] lg:self-start lg:overflow-y-auto";

/**
 * Everything one page of a listing needs. A page number past the end — an
 * old link after products were removed, or a hand-edited URL — redirects to
 * the last page that exists rather than rendering an empty grid.
 *
 * This route must not have a loading.tsx. A route-level loading boundary
 * starts streaming before the page body runs, after which redirect(),
 * permanentRedirect() and notFound() can no longer set the status code: they
 * become client-side navigations inside a 200 response. That turned every
 * unknown /products URL into a soft 404 and every canonical 308 into a 200.
 */
async function loadListing(
  tree: CategoryNode[],
  scope: CategoryNode | null,
  searchParams: SearchParams,
  basePath: string
) {
  const { sort, page } = parseListingParams(searchParams);
  const [direct, listing] = await Promise.all([
    getDirectProductCounts(),
    listProducts({ categoryIds: scope ? subtreeIds(scope) : undefined, sort, page }),
  ]);

  const totalPages = Math.max(1, Math.ceil(listing.total / LISTING_PAGE_SIZE));
  if (page > totalPages) redirect(`${basePath}${listingQuery(sort, totalPages)}`);

  const counts = rollUpCounts(tree, direct);
  return {
    sort,
    page,
    listing,
    counts,
    catalogueTotal: tree.reduce((sum, n) => sum + (counts.get(n.id) ?? 0), 0),
    categoryNames: new Map(flattenTree(tree).map(n => [n.id, n.name])),
  };
}

const plural = (n: number, one: string, many = `${one}s`) => `${n} ${n === 1 ? one : many}`;

/** A heading or intro that only repeats the category name adds nothing. */
const differsFrom = (text: string | undefined, name: string) =>
  !!text && text.trim().toLowerCase() !== name.trim().toLowerCase();

// ---------------------------------------------------------------
// Products index page (/products)
// ---------------------------------------------------------------
async function ProductsIndexPage({
  tree,
  searchParams,
}: {
  tree: CategoryNode[];
  searchParams: SearchParams;
}) {
  const { sort, page, listing, counts, catalogueTotal, categoryNames } = await loadListing(
    tree,
    null,
    searchParams,
    "/products"
  );

  return (
    <>
      <section className="bg-graphite py-14 text-white lg:py-16">
        <Container>
          <h1 className="font-display text-3xl font-bold sm:text-4xl">Products</h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Machine tools, automation, and accessories — supplied, installed, and supported
            across the UAE and GCC. Add what you need to a quote request, or ask us to source
            anything not listed here.
          </p>
          <div className="mt-8">
            <OpenSearchButton />
          </div>
        </Container>
      </section>

      {/* Every product, with the category tree to narrow it. Categories
          aren't repeated as a directory here — the mega menu already lists them. */}
      <section id="all-products" className="scroll-mt-28 py-10 lg:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
            <aside className={sidebarClasses}>
              <SidebarDrawer label="Browse categories">
                <CategorySidebar tree={tree} activePathIds={[]} counts={counts} total={catalogueTotal} />
              </SidebarDrawer>
            </aside>
            <ProductListing
              products={listing.products}
              total={listing.total}
              page={page}
              sort={sort}
              basePath="/products"
              anchor="all-products"
              categoryNames={categoryNames}
              empty={
                <p className="text-sm text-graphite/60">
                  No products are listed online yet.{" "}
                  <Link href="/contact" className="font-medium text-cyan-deep hover:text-graphite">
                    Tell us what you need
                  </Link>{" "}
                  and we&rsquo;ll source it.
                </p>
              }
            />
          </div>
        </Container>
      </section>
    </>
  );
}

// ---------------------------------------------------------------
// Category page (any depth)
// ---------------------------------------------------------------
async function CategoryPage({
  node,
  tree,
  searchParams,
}: {
  node: CategoryNode;
  tree: CategoryNode[];
  searchParams: SearchParams;
}) {
  const basePath = `/products/${node.pathSlugs.join("/")}`;
  const { sort, page, listing, counts, catalogueTotal, categoryNames } = await loadListing(
    tree,
    node,
    searchParams,
    basePath
  );
  const about = node.description.filter(p => differsFrom(p, node.name));

  return (
    <>
      <section className="bg-graphite py-12 text-white">
        <Container>
          <Breadcrumb pathSlugs={node.pathSlugs} pathNames={node.pathNames} />
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">{node.name}</h1>
          {differsFrom(node.intro, node.name) && (
            <p className="mt-3 max-w-2xl text-white/70">{node.intro}</p>
          )}
          <p className="mt-5 text-sm text-white/50">
            {listing.total > 0 ? plural(listing.total, "product") : "Available on request"}
            {node.children.length > 0 &&
              ` · ${plural(node.children.length, "subcategory", "subcategories")}`}
          </p>
        </Container>
      </section>

      <section id="products" className="scroll-mt-28 py-10 lg:py-14">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[15rem_1fr] lg:gap-10">
            <aside className={sidebarClasses}>
              <SidebarDrawer label={`Category: ${node.name}`}>
                <CategorySidebar
                  tree={tree}
                  activePathIds={node.pathIds}
                  counts={counts}
                  total={catalogueTotal}
                />
              </SidebarDrawer>
            </aside>
            <ProductListing
              products={listing.products}
              total={listing.total}
              page={page}
              sort={sort}
              basePath={basePath}
              anchor="products"
              categoryNames={categoryNames}
              empty={<AvailableOnRequest node={node} />}
            />
          </div>
        </Container>
      </section>

      {/* Category copy kept for search engines, below the products buyers came for */}
      {about.length > 0 && (
        <section className="border-t border-steel-100 py-12">
          <Container>
            <div className="max-w-3xl">
              <h2 className="font-display text-xl font-semibold text-graphite">About {node.name}</h2>
              {about.map((p, i) => (
                <p key={i} className="mt-4 leading-relaxed text-graphite/70">
                  {p}
                </p>
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

  // Related products: admin-curated, falling back to same-category siblings
  const related = await getRelatedProducts(product);
  const allSameCategory = related.every(p => p.categoryId === product.categoryId);

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
        <section className="border-t border-steel-100 py-16">
          <Container>
            <SectionDivider label="Specification" size="lg" />
            <h2 className="mt-8 font-display text-2xl font-semibold text-graphite sm:text-3xl">
              Technical specification
            </h2>
            <div className="mt-8 max-w-4xl">
              <SpecReadout specGroups={product.specGroups} variants={product.variants} />
            </div>
          </Container>
        </section>
      )}

      {/* Standard equipment */}
      {product.standardEquipment && product.standardEquipment.length > 0 && (
        <section className="py-16">
          <Container>
            <SectionDivider label="Standard equipment" size="lg" />
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
            <SectionDivider label="Related products" size="lg" />
            <h2 className="mt-6 font-display text-xl font-semibold text-graphite">
              {allSameCategory
                ? `More in ${categoryNode?.name ?? "this category"}`
                : "You may also be interested in"}
            </h2>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {related.map(p => (
                <ProductCard key={p.slug} name={p.name} description={p.tagline}
                  image={p.image}
                  href={`/products/${p.categoryPath.join("/")}/${p.slug}`}
                  categorySlug={p.categorySlug}
                  categoryName={findNodeById(tree, p.categoryId)?.name ?? p.categorySlug}
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
  searchParams,
}: {
  params: { slug?: string[] };
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const slugs = params.slug ?? [];
  const tree = await getCategoryTree();
  const flat = flattenTree(tree);

  // /products — no slug
  if (slugs.length === 0) return <ProductsIndexPage tree={tree} searchParams={searchParams} />;

  // Try to match a category path
  const node = findNodeByPath(tree, slugs);
  if (node) return <CategoryPage node={node} tree={tree} searchParams={searchParams} />;

  // Try to match product: last segment = product slug
  const productSlug = slugs[slugs.length - 1];
  const product = await getProductBySlug(productSlug);
  if (product) {
    // Enforce the canonical category path — otherwise every URL ending in a
    // valid product slug renders as duplicate content
    const requestedPath = slugs.slice(0, -1).join("/");
    const canonicalPath = product.categoryPath.join("/");
    if (requestedPath !== canonicalPath && canonicalPath) {
      permanentRedirect(`/products/${canonicalPath}/${product.slug}`);
    }
    return <ProductDetailPage slugs={slugs} tree={tree} />;
  }

  // Legacy flat category URLs (pre-tree): /products/<leaf-slug>
  if (slugs.length === 1) {
    const legacy = flat.find(n => n.pathSlugs[n.pathSlugs.length - 1] === slugs[0]);
    if (legacy) permanentRedirect(`/products/${legacy.pathSlugs.join("/")}`);
  }

  notFound();
}
