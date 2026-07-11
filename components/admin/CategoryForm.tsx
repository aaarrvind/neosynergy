"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminFormField, AdminTextareaField } from "./AdminFormField";
import { ImageUploader } from "./ImageUploader";
import { ParentPicker } from "./ParentPicker";
import { DbCategory } from "@/lib/supabase/db-types";
import { CategoryNode } from "@/lib/types";

interface Props {
  existing?: DbCategory;
  tree: CategoryNode[];
  defaultParentId?: string;
}

export function CategoryForm({ existing, tree, defaultParentId = "" }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [parentId, setParentId] = useState(existing?.parent_id ?? defaultParentId);
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [shortName, setShortName] = useState(existing?.short_name ?? "");
  const [intro, setIntro] = useState(existing?.intro ?? "");
  const [desc1, setDesc1] = useState(
    Array.isArray(existing?.description) ? (existing.description[0] ?? "") : ""
  );
  const [desc2, setDesc2] = useState(
    Array.isArray(existing?.description) ? (existing.description[1] ?? "") : ""
  );
  const [heroImage, setHeroImage] = useState(existing?.hero_image ?? "");
  const [metaDesc, setMetaDesc] = useState(existing?.meta_description ?? "");
  const [sortOrder, setSortOrder] = useState(String(existing?.sort_order ?? 0));

  function handleNameChange(v: string) {
    setName(v);
    if (!existing)
      setSlug(
        v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
      );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    const supabase = createClient();
    const payload = {
      parent_id: parentId || null,
      slug,
      name,
      short_name: shortName || name,
      intro,
      description: [desc1, desc2].filter(Boolean),
      hero_image: heroImage,
      meta_description: metaDesc,
      sort_order: parseInt(sortOrder) || 0,
    };

    const { error: err } = existing
      ? await supabase.from("categories").update(payload).eq("id", existing.id)
      : await supabase.from("categories").insert(payload);

    if (err) {
      setError(err.message);
      setSaving(false);
      return;
    }
    router.push("/admin/categories");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      {/* Parent picker */}
      <ParentPicker
        tree={tree}
        value={parentId}
        onChange={setParentId}
        excludeId={existing?.id}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminFormField
          label="Name"
          name="name"
          required
          value={name}
          onChange={handleNameChange}
          placeholder="Vertical Machining Centers"
        />
        <AdminFormField
          label="Short name"
          name="short_name"
          value={shortName}
          onChange={setShortName}
          placeholder="VMC"
          hint="Used in nav & footer (defaults to name)"
        />
      </div>

      <AdminFormField
        label="Slug"
        name="slug"
        required
        value={slug}
        onChange={setSlug}
        hint="URL segment — auto-generated from name, must be unique within siblings"
      />

      <AdminFormField
        label="Intro"
        name="intro"
        required
        value={intro}
        onChange={setIntro}
        placeholder="One-line tagline shown on category cards"
      />

      <AdminTextareaField
        label="Description paragraph 1"
        name="desc1"
        required
        value={desc1}
        onChange={setDesc1}
        rows={3}
      />
      <AdminTextareaField
        label="Description paragraph 2"
        name="desc2"
        value={desc2}
        onChange={setDesc2}
        rows={3}
        hint="Optional second paragraph"
      />

      <ImageUploader value={heroImage} onChange={setHeroImage} folder="categories" />

      <AdminTextareaField
        label="Meta description"
        name="meta_desc"
        required
        value={metaDesc}
        onChange={setMetaDesc}
        rows={2}
        hint="SEO description — 150–160 characters"
      />

      <AdminFormField
        label="Sort order"
        name="sort_order"
        type="number"
        value={sortOrder}
        onChange={setSortOrder}
        hint="Lower numbers appear first within siblings"
      />

      {error && <p className="text-sm text-spark">{error}</p>}

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded-md bg-graphite px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-deep disabled:opacity-50 transition-colors"
        >
          {saving ? "Saving…" : existing ? "Save changes" : "Create category"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/categories")}
          className="rounded-md border border-steel-200 px-5 py-2.5 text-sm text-graphite hover:bg-steel-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
