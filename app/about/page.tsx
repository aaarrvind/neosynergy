import Image from "next/image";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { company } from "@/lib/data/company";

export const metadata: Metadata = {
  title: "About Us — Company, Vision & Team",
  description:
    "Neo Synergy Machinery Trading LLC is a Dubai-based machine tool, automation, and robotics trading and production company. Learn about our vision, mission, and team.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <>
      <section className="bg-graphite py-16 text-white">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            Company
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            {company.tagline}
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">{company.intro}</p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionDivider label="Vision & mission" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2">
            <div>
              <h2 className="font-display text-xl font-semibold text-graphite">
                Our vision
              </h2>
              <p className="mt-3 leading-relaxed text-graphite/70">
                {company.vision}
              </p>
            </div>
            <div>
              <h2 className="font-display text-xl font-semibold text-graphite">
                Our mission
              </h2>
              <p className="mt-3 leading-relaxed text-graphite/70">
                {company.mission}
              </p>
            </div>
          </div>
          <div className="mt-8 rounded-lg border border-steel-100 bg-steel-50 p-6">
            <p className="font-display text-lg font-medium text-graphite">
              {company.oneStop}
            </p>
          </div>
        </Container>
      </section>

      <section className="bg-steel-50 py-16">
        <Container>
          <SectionDivider label="Our team" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
                Our team
              </h2>
              {company.team.map((paragraph, i) => (
                <p
                  key={i}
                  className="mt-4 leading-relaxed text-graphite/70"
                >
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
              <Image
                src="/images/control-pendant-worker.jpg"
                alt="Neo Synergy technician operating a CNC control pendant"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
          </div>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionDivider label="Special-purpose engineering" />
          <div className="mt-8 grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="relative aspect-[4/3] overflow-hidden rounded-lg lg:order-2">
              <Image
                src="/images/hero-lathe-closeup.jpg"
                alt="Close-up of CNC lathe turning operation"
                fill
                className="object-cover"
                sizes="(min-width: 1024px) 50vw, 100vw"
              />
            </div>
            <div className="lg:order-1">
              <h2 className="font-display text-2xl font-semibold text-graphite sm:text-3xl">
                Synergy International
              </h2>
              <p className="mt-4 leading-relaxed text-graphite/70">
                {company.synergyInternational}
              </p>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
