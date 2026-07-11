"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, FolderOpen, Package, Settings2, Users, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

const links = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/categories", label: "Categories", icon: FolderOpen },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/services", label: "Services", icon: Settings2 },
  { href: "/admin/team", label: "Team", icon: Users },
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin-login");
    router.refresh();
  }

  return (
    <aside className="hidden lg:flex w-56 flex-col border-r border-white/10 bg-graphite text-white flex-shrink-0">
      <div className="flex h-16 items-center border-b border-white/10 px-5">
        <Logo variant="header" />
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        <p className="px-3 pb-1 pt-2 font-mono text-[0.6rem] uppercase tracking-[0.2em] text-white/30">Content</p>
        {links.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname.startsWith(href) && href !== "/admin";
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors ${active ? "bg-cyan text-graphite font-medium" : "text-white/70 hover:bg-white/10 hover:text-white"}`}>
              <Icon size={16} />
              {label}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-white/10 p-3">
        <Link href="/" target="_blank"
          className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/50 hover:text-white mb-1 transition-colors">
          ↗ View website
        </Link>
        <button onClick={handleSignOut}
          className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors">
          <LogOut size={16} /> Sign out
        </button>
      </div>
    </aside>
  );
}
