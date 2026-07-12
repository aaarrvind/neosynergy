import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CategoryNode, CategoryRow } from "@/lib/types";

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

export default async function NewProductPage() {
  const supabase = createServerSupabaseClient();
  const [{ data }, { data: allProds }] = await Promise.all([
    supabase.rpc("get_category_tree"),
    supabase.from("products").select("id, name").order("name"),
  ]);
  const tree = buildTree((data as CategoryRow[]) ?? []);
  return (
    <div>
      <AdminPageHeader title="New product" />
      <ProductForm
        tree={tree}
        allProducts={(allProds as { id: string; name: string }[]) ?? []}
      />
    </div>
  );
}
