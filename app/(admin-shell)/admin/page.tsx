import Link from "next/link";
import { FolderOpen, Package, Settings2, Users } from "lucide-react";
import { createServerSupabaseClient } from "@/lib/supabase/server";

async function getStats() {
  try {
    const supabase = createServerSupabaseClient();
    const [cats, prods, svcs] = await Promise.all([
      supabase.from("categories").select("id", { count: "exact", head: true }),
      supabase.from("products").select("id", { count: "exact", head: true }),
      supabase.from("services").select("id", { count: "exact", head: true }),
    ]);
    return { categories: cats.count ?? 0, products: prods.count ?? 0, services: svcs.count ?? 0 };
  } catch { return { categories: 0, products: 0, services: 0 }; }
}

export default async function AdminDashboard() {
  const stats = await getStats();
  const cards = [
    { label: "Categories", value: stats.categories, href: "/admin/categories", icon: FolderOpen, color: "text-cyan-deep", hint: "Tree-structured — unlimited depth" },
    { label: "Products", value: stats.products, href: "/admin/products", icon: Package, color: "text-spark", hint: "Specs, images, variants" },
    { label: "Services", value: stats.services, href: "/admin/services", icon: Settings2, color: "text-graphite/60", hint: "Shown on Services page" },
    { label: "Team", value: "—", href: "/admin/team", icon: Users, color: "text-graphite/60", hint: "Manage admin users" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-semibold text-graphite mb-1">Dashboard</h1>
      <p className="text-sm text-graphite/50 mb-8">Manage the Neo Synergy website content.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-10">
        {cards.map(card => (
          <Link key={card.label} href={card.href}
            className="flex flex-col gap-3 rounded-lg border border-steel-200 bg-white p-5 transition-shadow hover:shadow-md">
            <div className={card.color}><card.icon size={22} /></div>
            <div>
              <p className="font-display text-3xl font-bold text-graphite">{card.value}</p>
              <p className="text-sm text-graphite/60">{card.label}</p>
              <p className="text-xs text-graphite/40 mt-0.5">{card.hint}</p>
            </div>
          </Link>
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { href: "/admin/categories/new", label: "Add category", desc: "Top-level or nested subcategory" },
          { href: "/admin/products/new", label: "Add product", desc: "Detailed machine with spec sheet" },
          { href: "/admin/services/new", label: "Add service", desc: "Company service offering" },
        ].map(action => (
          <Link key={action.href} href={action.href}
            className="rounded-lg border border-dashed border-steel-200 bg-white p-5 transition-colors hover:border-cyan hover:bg-cyan-50">
            <p className="font-medium text-graphite">{action.label}</p>
            <p className="mt-1 text-sm text-graphite/50">{action.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
