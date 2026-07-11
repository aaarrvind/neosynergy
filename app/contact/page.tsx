import type { Metadata } from "next";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { Container } from "@/components/Container";
import { SectionDivider } from "@/components/SectionDivider";
import { ContactForm } from "@/components/ContactForm";
import { company } from "@/lib/data/company";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Get in touch with Neo Synergy Machinery Trading LLC in Dubai, UAE — call, email, or send a message about machine tools, automation, and retrofitting.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <>
      <section className="bg-graphite py-16 text-white">
        <Container>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-cyan">
            Contact
          </p>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-4 max-w-2xl text-white/70">
            Have a project, machine, or retrofit in mind? Reach out directly,
            or send us a message and our team will respond by email.
          </p>
        </Container>
      </section>

      <section className="py-16">
        <Container>
          <SectionDivider label="Reach us" />
          <div className="mt-8 grid gap-10 lg:grid-cols-5">
            <div className="lg:col-span-2">
              <ul className="flex flex-col gap-6">
                <li className="flex items-start gap-3">
                  <MapPin size={20} className="mt-0.5 flex-shrink-0 text-cyan-deep" />
                  <div>
                    <p className="font-medium text-graphite">Location</p>
                    <p className="text-graphite/60">{company.city}</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Phone size={20} className="mt-0.5 flex-shrink-0 text-cyan-deep" />
                  <div>
                    <p className="font-medium text-graphite">Phone</p>
                    {company.phones.map((phone) => (
                      <p key={phone}>
                        <a
                          href={`tel:${phone.replace(/\s+/g, "")}`}
                          className="text-graphite/60 hover:text-cyan-deep"
                        >
                          {phone}
                        </a>
                      </p>
                    ))}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Mail size={20} className="mt-0.5 flex-shrink-0 text-cyan-deep" />
                  <div>
                    <p className="font-medium text-graphite">Email</p>
                    {company.emails.map((email) => (
                      <p key={email}>
                        <a
                          href={`mailto:${email}`}
                          className="text-graphite/60 hover:text-cyan-deep"
                        >
                          {email}
                        </a>
                      </p>
                    ))}
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <Clock size={20} className="mt-0.5 flex-shrink-0 text-cyan-deep" />
                  <div>
                    <p className="font-medium text-graphite">Hours</p>
                    <p className="text-graphite/60">
                      Sunday – Friday, 9:00 AM – 6:00 PM (GST)
                    </p>
                  </div>
                </li>
              </ul>
            </div>
            <div className="lg:col-span-3">
              <h2 className="font-display text-lg font-semibold text-graphite">
                Send a message
              </h2>
              <div className="mt-4">
                <ContactForm />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
