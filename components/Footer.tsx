import Link from "next/link";
import { Phone, Mail, MapPin } from "lucide-react";
import { company } from "@/lib/data/company";
import { CategoryNode } from "@/lib/types";
import { Logo } from "./Logo";

export function Footer({ tree }: { tree: CategoryNode[] }) {
  return (
    <footer className="bg-graphite text-white/80">
      <div className="mx-auto max-w-container px-6 py-5 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo variant="footer" />
            {/* <p className="mt-4 text-sm leading-relaxed text-white/60">{company.intro}</p> */}
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Products</h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              {tree.map(node => (
                <li key={node.id}>
                  <Link href={`/products/${node.pathSlugs.join("/")}`} className="hover:text-cyan">
                    {node.shortName || node.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Company</h3>
            <ul className="flex flex-col gap-1.5 text-sm">
              <li><Link href="/about" className="hover:text-cyan">About & team</Link></li>
              <li><Link href="/services" className="hover:text-cyan">Services</Link></li>
              <li><Link href="/quote" className="hover:text-cyan">Request a quote</Link></li>
              <li><Link href="/contact" className="hover:text-cyan">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm uppercase tracking-[0.2em] text-white/40 mb-4">Contact</h3>
            <ul className="flex flex-col gap-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin size={15} className="mt-0.5 flex-shrink-0 text-cyan" />
                <span>{company.city}</span>
              </li>
              {company.phones.map(phone => (
                <li key={phone} className="flex items-center gap-2">
                  <Phone size={15} className="flex-shrink-0 text-cyan" />
                  <a href={`tel:${phone.replace(/\s+/g, "")}`} className="hover:text-cyan">{phone}</a>
                </li>
              ))}
              {company.emails.map(email => (
                <li key={email} className="flex items-center gap-2">
                  <Mail size={15} className="flex-shrink-0 text-cyan" />
                  <a href={`mailto:${email}`} className="hover:text-cyan">{email}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-4 border-t border-white/10 pt-6 text-xs text-white/30">
          © {new Date().getFullYear()} {company.name}. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
