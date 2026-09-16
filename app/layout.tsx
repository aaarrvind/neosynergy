import type { Metadata } from "next";
import { headers } from "next/headers";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { CartProvider } from "@/lib/cart-context";
import { JsonLd } from "@/components/JsonLd";
import { company } from "@/lib/data/company";
import { getCategoryTree, flattenTree } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  metadataBase: new URL(company.website),
  title: { default: `${company.shortName} | Machinery Trading, Dubai UAE`, template: `%s | ${company.shortName}` },
  description: company.intro,
  keywords: ["CNC machine tools Dubai", "machinery trading UAE", "VMC machine supplier UAE", "CNC retrofit Dubai"],
  openGraph: {
    title: `${company.shortName} | Machinery Trading, Dubai UAE`,
    description: company.intro,
    url: company.website,
    siteName: company.shortName,
    locale: "en_AE",
    type: "website",
    // No `images` here on purpose: app/opengraph-image.tsx generates the card,
    // and an explicit value at this level would override that file convention.
  },
  twitter: {
    card: "summary_large_image",
    title: `${company.shortName} | Machinery Trading, Dubai UAE`,
    description: company.intro,
  },
  alternates: { canonical: "/" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const headersList = await headers();
  const pathname = headersList.get("x-next-pathname") ?? "";
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    return (
      <html lang="en" className="font-sans">
        <body className="flex min-h-screen flex-col">{children}</body>
      </html>
    );
  }

  const tree = await getCategoryTree();

  return (
    <html lang="en" className="font-sans">
      <body className="flex min-h-screen flex-col">
        <JsonLd data={{
          "@context": "https://schema.org",
          "@type": "Organization",
          name: company.name,
          url: company.website,
          logo: `${company.website}/images/logo.png`,
          description: company.intro,
          address: { "@type": "PostalAddress", addressLocality: "Dubai", addressCountry: "AE" },
          contactPoint: company.phones.map(phone => ({
            "@type": "ContactPoint", telephone: phone, contactType: "sales", areaServed: "AE",
          })),
          email: company.emails[0],
        }} />
        <CartProvider>
          <Header tree={tree} />
          <main className="flex-1">{children}</main>
          <Footer tree={tree} />
          <CartDrawer />
        </CartProvider>
        {/* Cookieless, so no consent banner is required and the claim in
            /privacy that we set no analytics cookies stays true. Both are
            inert outside Vercel, so local and self-hosted runs are unaffected.
            Deliberately outside the admin branch above — staff page views
            would skew the client's traffic figures. */}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}

