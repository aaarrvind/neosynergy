"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryTreePanel } from "@/components/admin/CategoryTreePanel";
import { CategoryNode, CategoryRow } from "@/lib/types";

function buildTree(rows: CategoryRow[]): CategoryNode[] {
  const map = new Map<string, CategoryNode>();
  const roots: CategoryNode[] = [];
  for (const row of rows) {
    map.set(row.id, {
      id: row.id, parentId: row.parent_id, slug: row.slug,
      name: row.name, shortName: row.short_name, intro: row.intro,
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

export default function AdminCategoriesPage() {
  const [tree, setTree] = useState<CategoryNode[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.rpc("get_category_tree");
    setTree(buildTree((data as CategoryRow[]) ?? []));
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string, name: string) {
    if (!confirm(`Delete "${name}" and ALL its subcategories and products? This cannot be undone.`)) return;
    setDeleting(id);
    const supabase = createClient();
    await supabase.from("categories").delete().eq("id", id);
    await load();
    setDeleting(null);
  }

  return (
    <div>
      <AdminPageHeader title="Categories" newHref="/admin/categories/new" newLabel="Add category" />
      <p className="text-sm text-graphite/50 mb-6">
        Click the chevron to expand a node. Hover any row to see edit, add child, and delete actions.
      </p>
      {loading
        ? <p className="text-sm text-graphite/50">Loading…</p>
        : <CategoryTreePanel tree={tree} onDelete={handleDelete} deleting={deleting} />
      }
    </div>
  );
}
