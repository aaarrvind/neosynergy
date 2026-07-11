import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
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
      <section className="bg-graphite py-16 text-white">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">Services</p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">A one-stop service for machine tools and automation</h1>
          <p className="mt-4 max-w-2xl text-white/70">Supply, installation, commissioning, maintenance, and retrofitting — for both standard and special-purpose machinery.</p>
        </Container>
      </section>
      <section className="py-16">
        <Container>
          <SectionDivider label="What we do" />
          <div className="mt-8 flex flex-col gap-12">
            {services.map((service, index) => (
              <div key={service.slug} id={service.slug} className={`grid gap-8 lg:grid-cols-12 lg:items-start ${index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""}`}>
                <div className="lg:col-span-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-md bg-cyan-50 text-cyan-deep">
                    <ServiceIcon name={service.icon} size={24} />
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold text-graphite">{service.name}</h2>
                  <p className="mt-2 text-sm font-medium text-graphite/50">{service.shortDescription}</p>
                </div>
                <div className="lg:col-span-8">
                  {service.description.map((paragraph, i) => (
                    <p key={i} className="mb-4 leading-relaxed text-graphite/70 last:mb-0">{paragraph}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>
      <section className="bg-steel-50 py-16">
        <Container>
          <div className="flex flex-col items-start gap-6 rounded-lg bg-graphite p-8 text-white sm:flex-row sm:items-center sm:justify-between sm:p-12">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Discuss your requirements</h2>
              <p className="mt-2 max-w-xl text-white/70">Whether it&apos;s a single machine or a full automation cell, our team can help you scope the right solution.</p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/contact" className="inline-flex items-center gap-2 rounded-md border border-white/20 px-5 py-3 text-sm font-medium text-white transition-colors hover:border-cyan hover:text-cyan">
                Contact us <ArrowRight size={16} />
              </Link>
              <Link href="/quote" className="inline-flex items-center gap-2 rounded-md bg-cyan px-5 py-3 text-sm font-medium text-graphite transition-colors hover:bg-white">
                <FileText size={16} /> Request a quote
              </Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
