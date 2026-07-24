"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText, Phone, Mail, MapPin } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { company } from "@/lib/data/company";
import { Logo } from "./Logo";
import { MegaMenu } from "./MegaMenu";
import { SearchModal } from "./SearchModal";
import { CategoryNode } from "@/lib/types";

const staticLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "Company" },
  { href: "/services", label: "Services" },
  { href: "/contact", label: "Contact" },
];

const telHref = `tel:${company.phones[0].replace(/\s/g, "")}`;
const mailHref = `mailto:${company.emails[0]}`;

export function Header({ tree }: { tree: CategoryNode[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-30 bg-graphite text-white">
      {/* Utility bar — real contact details, desktop only.
          Heights are explicit (36px + 64px) because the mega menu panel
          is positioned against the header's full height. */}
      <div className="hidden border-b border-white/[0.07] lg:block">
        <div className="mx-auto flex h-9 max-w-container items-center justify-between px-6 lg:px-8">
          <p className="flex items-center gap-1.5 text-xs text-white/45">
            <MapPin size={12} strokeWidth={1.75} />
            {company.city}
          </p>
          <div className="flex items-center gap-6 text-xs">
            <a
              href={telHref}
              className="flex items-center gap-1.5 text-white/45 transition-colors hover:text-white"
            >
              <Phone size={12} strokeWidth={1.75} />
              {company.phones[0]}
            </a>
            <a
              href={mailHref}
              className="flex items-center gap-1.5 text-white/45 transition-colors hover:text-white"
            >
              <Mail size={12} strokeWidth={1.75} />
              {company.emails[0]}
            </a>
          </div>
        </div>
      </div>

      {/* Main bar */}
      <div className="border-b border-white/10">
        <div className="mx-auto flex h-16 max-w-container items-center gap-6 px-6 lg:px-8">
          <Link
            href="/"
            className="flex flex-shrink-0 items-center"
            onClick={() => setMobileOpen(false)}
            aria-label="Neo Synergy Machinery Trading — home"
          >
            <Logo variant="header" />
          </Link>

          {/* Desktop nav */}
          <nav className="ml-auto hidden items-center gap-7 lg:flex">
            {staticLinks.map((link) => {
              const active =
                link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`border-b-2 pb-0.5 font-display text-sm font-medium tracking-wide transition-colors ${
                    active
                      ? "border-cyan text-white"
                      : "border-transparent text-white/70 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
            <MegaMenu tree={tree} active={pathname.startsWith("/products")} />
          </nav>

          {/* Hairline between navigation and actions */}
          <span aria-hidden className="hidden h-5 w-px bg-white/10 lg:block" />

          <div className="ml-auto flex items-center gap-2 lg:ml-0">
            <SearchModal />
            <button
              onClick={openDrawer}
              className="pressable relative inline-flex items-center gap-2 rounded bg-cyan px-4 py-2 text-sm font-semibold text-graphite hover:bg-white"
              aria-label="Open quote request cart"
            >
              <FileText size={15} />
              <span className="hidden sm:inline">Quote</span>
              {totalCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-graphite px-1 text-xs font-semibold text-white ring-2 ring-graphite">
                  {totalCount}
                </span>
              )}
            </button>
            <button
              className="pressable inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="menu-panel border-b border-white/10 bg-graphite px-6 py-5 lg:hidden">
          <ul className="flex flex-col gap-3">
            {staticLinks.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className="block font-display text-base text-white/90 hover:text-cyan"
                >
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link
                href="/products"
                onClick={() => setMobileOpen(false)}
                className="block font-display text-base text-white/90 hover:text-cyan"
              >
                Products
              </Link>
            </li>
            {/* Mobile category tree */}
            {tree.map((node) => (
              <li key={node.id} className="ml-3">
                <Link
                  href={`/products/${node.pathSlugs.join("/")}`}
                  onClick={() => setMobileOpen(false)}
                  className="block py-1 text-sm text-white/70 hover:text-cyan"
                >
                  {node.name}
                </Link>
                {node.children.map((child) => (
                  <Link
                    key={child.id}
                    href={`/products/${child.pathSlugs.join("/")}`}
                    onClick={() => setMobileOpen(false)}
                    className="ml-3 block py-1 text-sm text-white/50 hover:text-cyan"
                  >
                    — {child.name}
                  </Link>
                ))}
              </li>
            ))}
          </ul>

          {/* Contact details — the utility bar is desktop-only, so surface
              them here for mobile visitors */}
          <div className="mt-5 flex flex-col gap-2.5 border-t border-white/10 pt-5 text-sm">
            <a href={telHref} className="flex items-center gap-2 text-white/60 hover:text-white">
              <Phone size={14} strokeWidth={1.75} />
              {company.phones[0]}
            </a>
            <a href={mailHref} className="flex items-center gap-2 text-white/60 hover:text-white">
              <Mail size={14} strokeWidth={1.75} />
              {company.emails[0]}
            </a>
          </div>
        </nav>
      )}
    </header>
  );
}
