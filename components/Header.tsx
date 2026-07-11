"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, FileText } from "lucide-react";
import { useCart } from "@/lib/cart-context";
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

export function Header({ tree }: { tree: CategoryNode[] }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { totalCount, openDrawer } = useCart();

  return (
    <header className="sticky top-0 z-30 border-b border-graphite-light bg-graphite text-white">
      <div className="mx-auto flex max-w-container items-center justify-between gap-4 px-6 py-3 lg:px-8">
        <Link href="/" className="flex items-center gap-2" onClick={() => setMobileOpen(false)}
          aria-label="Neo Synergy Machinery Trading — home">
          <Logo variant="header" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 lg:flex">
          {staticLinks.map(link => {
            const active = link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
            return (
              <Link key={link.href} href={link.href}
                className={`font-display text-sm tracking-wide transition-colors ${active ? "text-cyan" : "text-white/80 hover:text-white"}`}>
                {link.label}
              </Link>
            );
          })}
          <MegaMenu tree={tree} />
        </nav>

        <div className="flex items-center gap-2">
          <SearchModal />
          <button onClick={openDrawer}
            className="relative inline-flex items-center gap-2 rounded-md border border-white/15 px-3 py-1.5 text-sm font-medium transition-colors hover:border-cyan hover:text-cyan"
            aria-label="Open quote request cart">
            <FileText size={15} />
            <span className="hidden sm:inline text-xs">Quote</span>
            {totalCount > 0 && (
              <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-spark px-1 text-xs font-semibold text-graphite">
                {totalCount}
              </span>
            )}
          </button>
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-white lg:hidden"
            onClick={() => setMobileOpen(v => !v)}
            aria-label="Toggle menu" aria-expanded={mobileOpen}>
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <nav className="border-t border-graphite-light px-6 py-4 lg:hidden">
          <ul className="flex flex-col gap-3">
            {staticLinks.map(link => (
              <li key={link.href}>
                <Link href={link.href} onClick={() => setMobileOpen(false)}
                  className="block font-display text-base text-white/90 hover:text-cyan">
                  {link.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/products" onClick={() => setMobileOpen(false)}
                className="block font-display text-base text-white/90 hover:text-cyan">
                Products
              </Link>
            </li>
            {/* Mobile category tree */}
            {tree.map(node => (
              <li key={node.id} className="ml-3">
                <Link href={`/products/${node.pathSlugs.join("/")}`}
                  onClick={() => setMobileOpen(false)}
                  className="block text-sm text-white/70 hover:text-cyan py-1">
                  {node.name}
                </Link>
                {node.children.map(child => (
                  <Link key={child.id} href={`/products/${child.pathSlugs.join("/")}`}
                    onClick={() => setMobileOpen(false)}
                    className="block text-sm text-white/50 hover:text-cyan py-1 ml-3">
                    — {child.name}
                  </Link>
                ))}
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
