import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CategoryForm } from "@/components/admin/CategoryForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DbCategory } from "@/lib/supabase/db-types";
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

export default async function EditCategoryPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createServerSupabaseClient();
  const [{ data: cat }, { data: treeRows }] = await Promise.all([
    supabase.from("categories").select("*").eq("id", params.id).single(),
    supabase.rpc("get_category_tree"),
  ]);
  if (!cat) notFound();

  const tree = buildTree((treeRows as CategoryRow[]) ?? []);

  return (
    <div>
      <AdminPageHeader title={`Edit: ${(cat as DbCategory).name}`} />
      <CategoryForm existing={cat as DbCategory} tree={tree} />
    </div>
  );
}
