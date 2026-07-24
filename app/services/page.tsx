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

const num = (i: number) => String(i + 1).padStart(2, "0");

export default async function ServicesPage() {
  const services = await getServices();

  return (
    <>
      {/* Page header */}
      <section className="bg-graphite py-16 text-white lg:py-24">
        <Container>
          <Eyebrow label="Services" className="text-cyan" />
          <h1 className="mt-4 max-w-3xl font-display text-3xl font-bold leading-[1.15] sm:text-4xl lg:text-[2.75rem]">
            A one-stop service for machine tools and automation
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70 sm:text-lg">
            Supply, installation, commissioning, maintenance, and retrofitting —
            for both standard and special-purpose machinery.
          </p>
        </Container>
      </section>

      {/* Index — the whole offering at a glance, and a way into each entry */}
      <section className="border-b border-steel-100 bg-steel-50 py-10 lg:py-12">
        <Container>
          <ul className="grid gap-x-10 gap-y-px sm:grid-cols-2 lg:grid-cols-3">
            {services.map((service, i) => (
              <li key={service.slug}>
                <a
                  href={`#${service.slug}`}
                  className="group flex items-baseline gap-3 border-t border-steel-200 py-3.5"
                >
                  <span className="text-xs font-semibold tabular-nums text-cyan-deep">
                    {num(i)}
                  </span>
                  <span className="font-display text-sm font-medium text-graphite transition-colors group-hover:text-cyan-deep">
                    {service.name}
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* Service entries — one consistent rail, never mirrored */}
      <section className="py-8 lg:py-12">
        <Container>
          <div className="flex flex-col divide-y divide-steel-100">
            {services.map((service, i) => (
              <article
                key={service.slug}
                id={service.slug}
                className="grid scroll-mt-24 gap-6 py-12 lg:grid-cols-12 lg:gap-10 lg:py-16 lg:scroll-mt-32"
              >
                {/* Left rail: meta, title, summary */}
                <div className="lg:col-span-4">
                  <div className="flex items-center gap-3 text-cyan-deep">
                    <ServiceIcon name={service.icon} size={22} />
                    <span className="text-xs font-semibold tabular-nums">
                      {num(i)}
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-2xl font-semibold leading-tight text-graphite">
                    {service.name}
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-graphite/55">
                    {service.shortDescription}
                  </p>
                </div>

                {/* Right column: detail, held to a readable measure */}
                <div className="lg:col-span-7 lg:col-start-6">
                  {service.description.map((paragraph, p) => (
                    <p
                      key={p}
                      className="mb-4 max-w-[68ch] text-[15px] leading-[1.75] text-graphite/70 last:mb-0"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
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
