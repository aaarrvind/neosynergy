import { MetadataRoute } from "next";
import { company } from "@/lib/data/company";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/admin", "/admin-login"],
    },
    sitemap: `${company.website}/sitemap.xml`,
  };
}
