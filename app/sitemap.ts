import { MetadataRoute } from "next";
import { company } from "@/lib/data/company";
import { getCategoryTree, flattenTree, getAllProductSlugs } from "@/lib/supabase/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = company.website;
  const now = new Date();

  const [tree, productSlugs] = await Promise.all([
    getCategoryTree(),
    getAllProductSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, lastModified: now, changeFrequency: "monthly", priority: 1 },
    { url: `${base}/about`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${base}/services`, lastModified: now, changeFrequency: "yearly", priority: 0.7 },
    { url: `${base}/products`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.5 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = flattenTree(tree).map(node => ({
    url: `${base}/products/${node.pathSlugs.join("/")}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: Math.max(0.5, 0.85 - node.depth * 0.1),
  }));

  const productRoutes: MetadataRoute.Sitemap = productSlugs.map(p => ({
    url: `${base}/products/${[...p.category, p.slug].join("/")}`,
    lastModified: now,
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }));

  return [...staticRoutes, ...categoryRoutes, ...productRoutes];
}
