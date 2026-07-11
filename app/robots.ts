import { MetadataRoute } from "next";
import { company } from "@/lib/data/company";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/"],
    },
    sitemap: `${company.website}/sitemap.xml`,
  };
}
