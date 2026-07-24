import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Container } from "@/components/Container";
import { Eyebrow } from "@/components/Eyebrow";
import { ServiceIcon } from "@/components/ServiceIcon";
import { getServices } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Services — Machine Tools, Automation & Retrofitting",
  description: "Neo Synergy provides machine tools, automation, commissioning & installation, special-purpose machinery, robotics, and CNC retrofitting services across the UAE.",
  alternates: { canonical: "/services" },
};

export default async function ServicesPage() {
  const services = await getServices();
  return (
    <>
      {/* Page header */}
      <section className="bg-graphite py-16 text-white lg:py-20">
        <Container>
          <Eyebrow label="Services" className="text-cyan" />
          <h1 className="mt-3 max-w-2xl font-display text-3xl font-bold sm:text-4xl">
            A one-stop service for machine tools and automation
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Supply, installation, commissioning, maintenance, and retrofitting —
            for both standard and special-purpose machinery.
          </p>
        </Container>
      </section>

      {/* Service list */}
      <section className="py-16 lg:py-20">
        <Container>
          <div className="flex flex-col divide-y divide-steel-100">
            {services.map((service, index) => (
              <div
                key={service.slug}
                id={service.slug}
                className={`grid scroll-mt-24 gap-8 py-12 first:pt-0 last:pb-0 lg:grid-cols-12 lg:items-start ${
                  index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
                }`}
              >
                <div className="lg:col-span-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-cyan-50 text-cyan-deep">
                    <ServiceIcon name={service.icon} size={24} />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-graphite">
                    {service.name}
                  </h2>
                  <p className="mt-2 text-sm font-medium text-graphite/50">
                    {service.shortDescription}
                  </p>
                </div>
                <div className="lg:col-span-8">
                  {service.description.map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-graphite/70 last:mb-0">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-graphite py-20 text-white lg:py-24">
        <Container>
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
            <div>
              <Eyebrow label="Get started" className="text-cyan" />
              <h2 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
                Discuss your requirements
              </h2>
              <p className="mt-4 max-w-xl text-white/70">
                Whether it&apos;s a single machine or a full automation cell, our team
                can help you scope the right solution.
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
                className="pressable arrow-link inline-flex items-center gap-2 rounded border border-white/40 px-6 py-3 text-sm font-semibold text-white hover:bg-white hover:text-graphite"
              >
                Contact us <ArrowRight size={16} className="arrow-icon" />
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
