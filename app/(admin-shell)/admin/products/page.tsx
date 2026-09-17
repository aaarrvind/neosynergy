"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Star } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { DbProduct, DbCategory } from "@/lib/supabase/db-types";
import { CategoryRow, CategoryNode } from "@/lib/types";

function findNode(nodes: CategoryNode[], id: string): CategoryNode | undefined {
  for (const n of nodes) {
    if (n.id === id) return n;
    const r = findNode(n.children, id);
    if (r) return r;
  }
}

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];
  for (const row of rows) {
    map.set(row.id, {
      id: row.id, parentId: row.parent_id, slug: row.slug, name: row.name,
      shortName: row.short_name, intro: row.intro,
      description: Array.isArray(row.description) ? row.description : [],
      heroImage: row.hero_image, metaDescription: row.meta_description,
      sortOrder: row.sort_order, depth: row.depth,
      pathIds: row.path_ids, pathSlugs: row.path_slugs, pathNames: row.path_names,
      children: [],
    });
  }
  for (const node of Array.from(map.values())) {
    if (!node.parentId) roots.push(node);
    else map.get(node.parentId)?.children.push(node);
  }
  return roots;
}

type Row = DbProduct & { category_name: string; category_path: string[] };

export default function AdminProductsPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const [{ data: prods }, { data: treeRows }] = await Promise.all([
      supabase.from("products").select("*").order("name"),
      supabase.rpc("get_category_tree"),
    ]);
    const tree = buildTree((treeRows as CategoryRow[]) ?? []);
    setRows(((prods as DbProduct[]) ?? []).map(p => {
      const node = findNode(tree, p.category_id);
      return { ...p, category_name: node?.name ?? "—", category_path: node?.pathSlugs ?? [] };
    }));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this product?")) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("products").delete().eq("id", id);
    await load();
    setDeleting(null);
  }

  return (
    <div>
      <AdminPageHeader title="Products" newHref="/admin/products/new" newLabel="Add product" />
      {loading ? <p className="text-sm text-graphite/50">Loading…</p> : (
        <AdminTable
          rows={rows}
          columns={[
            { key: "image", label: "Image", render: row => row.image
              ? <div className="relative w-12 h-10 rounded overflow-hidden bg-steel-100">
                  <Image src={row.image} alt={row.name} fill className="object-cover" unoptimized />
                </div>
              : <div className="w-12 h-10 rounded bg-steel-100" /> },
            { key: "name", label: "Name" },
            { key: "category_name", label: "Category" },
            { key: "slug", label: "Slug" },
            // Makes the homepage selection visible without opening each product
            { key: "is_featured", label: "Featured", render: row => row.is_featured
              ? <span className="inline-flex items-center gap-1 rounded bg-cyan-50 px-1.5 py-0.5 text-xs font-medium text-cyan-deep">
                  <Star size={11} className="fill-current" />{row.featured_sort}
                </span>
              : null },
            { key: "id", label: "Live", render: row => row.category_path.length > 0
              ? <Link href={`/products/${[...row.category_path, row.slug].join("/")}`} target="_blank"
                  className="text-cyan-deep hover:underline text-xs">↗</Link>
              : null },
          ]}
          editHref={row => `/admin/products/${row.id}`}
          onDelete={handleDelete}
          deleting={deleting}
        />
      )}
    </div>
  );
}
