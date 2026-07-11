import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductForm } from "@/components/admin/ProductForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DbProduct, DbSpecGroup, DbSpecRow, DbProductImage } from "@/lib/supabase/db-types";
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

export default async function EditProductPage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const [{ data: prod }, { data: treeRows }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).single(),
    supabase.rpc("get_category_tree"),
  ]);
  if (!prod) notFound();

  const p = prod as DbProduct;
  const tree = buildTree((treeRows as CategoryRow[]) ?? []);

  const { data: groups } = await supabase.from("spec_groups").select("*").eq("product_id", p.id).order("sort_order");
  const groupIds = ((groups as DbSpecGroup[]) ?? []).map(g => g.id);
  const { data: rows } = groupIds.length > 0
    ? await supabase.from("spec_rows").select("*").in("spec_group_id", groupIds).order("sort_order")
    : { data: [] };
  const { data: imgs } = await supabase.from("product_images").select("*").eq("product_id", p.id).order("sort_order");

  return (
    <div>
      <AdminPageHeader title={`Edit: ${p.name}`} />
      <ProductForm
        existing={p}
        existingGroups={(groups as DbSpecGroup[]) ?? []}
        existingRows={(rows as DbSpecRow[]) ?? []}
        existingImages={(imgs as DbProductImage[]) ?? []}
        tree={tree}
      />
    </div>
  );
}
