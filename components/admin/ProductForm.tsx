"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminFormField, AdminTextareaField } from "./AdminFormField";
import { SpecBuilder, SpecGroupDraft } from "./SpecBuilder";
import { ParentPicker } from "./ParentPicker";
import { DbProduct, DbSpecGroup, DbSpecRow, DbProductImage } from "@/lib/supabase/db-types";
import { CategoryNode } from "@/lib/types";
import { Plus, X, Trash2, Upload, GripVertical } from "lucide-react";
import Image from "next/image";

function uid() { return Math.random().toString(36).slice(2); }

interface Props {
  existing?: DbProduct;
  existingGroups?: DbSpecGroup[];
  existingRows?: DbSpecRow[];
  existingImages?: DbProductImage[];
  tree: CategoryNode[];
  /** All other products (id + name) available as related-product choices */
  allProducts?: { id: string; name: string }[];
  /** Currently curated related product ids, in display order */
  existingRelated?: string[];
}

export function ProductForm({ existing, existingGroups = [], existingRows = [], existingImages = [], tree, allProducts = [], existingRelated = [] }: Props) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [categoryId, setCategoryId] = useState(existing?.category_id ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [tagline, setTagline] = useState(existing?.tagline ?? "");
  const [desc1, setDesc1] = useState(Array.isArray(existing?.description) ? (existing.description[0] ?? "") : "");
  const [desc2, setDesc2] = useState(Array.isArray(existing?.description) ? (existing.description[1] ?? "") : "");
  const [heroImage, setHeroImage] = useState(existing?.image ?? "");
  const [sortOrder, setSortOrder] = useState(String(existing?.sort_order ?? 0));
  const [keywords, setKeywords] = useState((existing?.keywords as string[] ?? []).join(", "));
  const [variants, setVariants] = useState<string[]>((existing?.variants as string[] ?? []));
  const [newVariant, setNewVariant] = useState("");
  const [stdEquipment, setStdEquipment] = useState((existing?.standard_equipment as string[] ?? []).join("\n"));
  const [specGroups, setSpecGroups] = useState<SpecGroupDraft[]>(() =>
    existingGroups.map(g => ({
      id: g.id,
      title: g.title,
      rows: existingRows
        .filter(r => r.spec_group_id === g.id)
        .sort((a, b) => a.sort_order - b.sort_order)
        .map(r => ({
          id: r.id,
          label: r.label,
          value: r.value ?? "",
          values: r.values ?? undefined,
        })),
    }))
  );

  const [related, setRelated] = useState<string[]>(existingRelated);

  // Gallery images state
  const [images, setImages] = useState<{ id: string; url: string; alt: string; isNew?: boolean }[]>(
    existingImages.map(i => ({ id: i.id, url: i.url, alt: i.alt }))
  );
  const [uploadingImage, setUploadingImage] = useState(false);

  // Keep hero image in sync with gallery: first gallery image wins
  useEffect(() => {
    if (images.length > 0) {
      setHeroImage(images[0].url);
    }
  }, [images]);

  function handleNameChange(v: string) {
    setName(v);
    if (!existing)
      setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  function addVariant() {
    const v = newVariant.trim();
    if (!v || variants.includes(v)) return;
    setVariants([...variants, v]);
    setNewVariant("");
  }

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    setUploadingImage(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `products/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error: upErr } = await supabase.storage.from("images").upload(path, file);
    if (!upErr) {
      const { data } = supabase.storage.from("images").getPublicUrl(path);
      const publicUrl = data.publicUrl;
      setImages(prev => [...prev, { id: uid(), url: publicUrl, alt: name, isNew: true }]);
      // Auto-set hero image from first gallery upload if not already set
      if (!heroImage) setHeroImage(publicUrl);
    }
    setUploadingImage(false);
  }

  function removeImage(id: string) {
    setImages(prev => {
      const removed = prev.find(i => i.id === id);
      const remaining = prev.filter(i => i.id !== id);
      // If the removed image was the current hero, update hero to next available
      if (removed && removed.url === heroImage) {
        setHeroImage(remaining.length > 0 ? remaining[0].url : "");
      }
      return remaining;
    });
  }

  /** Prune per-variant values: only keys for current variants, no empties,
   *  null when the product has no variants or nothing remains. */
  function cleanRowValues(rowValues: Record<string, string> | undefined): Record<string, string> | null {
    if (!rowValues || variants.length === 0) return null;
    const cleaned = Object.fromEntries(
      Object.entries(rowValues).filter(
        ([variant, v]) => variants.includes(variant) && v && v.trim()
      )
    );
    return Object.keys(cleaned).length > 0 ? cleaned : null;
  }

  /** Insert the new spec groups/rows first, then delete the old ones — a
   *  failure mid-save must never destroy the previously saved specs.
   *  Returns an error message, or null on success. */
  async function saveSpecGroups(productId: string): Promise<string | null> {
    const supabase = createClient();
    const groupsToSave = specGroups.filter(g => g.title.trim() || g.rows.some(r => r.label));

    let newGroups: DbSpecGroup[] = [];
    if (groupsToSave.length > 0) {
      const { data, error } = await supabase
        .from("spec_groups")
        .insert(groupsToSave.map((g, gi) => ({
          product_id: productId, title: g.title, sort_order: gi + 1,
        })))
        .select();
      if (error || !data || data.length !== groupsToSave.length) {
        return error?.message ?? "Failed to save spec groups.";
      }
      newGroups = data as DbSpecGroup[];

      // Rows are returned in insert order, so index i maps to groupsToSave[i]
      const rowPayload = groupsToSave.flatMap((g, gi) =>
        g.rows
          .filter(r => r.label)
          .map((r, ri) => ({
            spec_group_id: newGroups[gi].id,
            label: r.label,
            value: r.value || null,
            values: cleanRowValues(r.values),
            sort_order: ri + 1,
          }))
      );
      if (rowPayload.length > 0) {
        const { error: rowErr } = await supabase.from("spec_rows").insert(rowPayload);
        if (rowErr) {
          // Roll back the new groups (cascades to their rows), keep the old ones
          await supabase.from("spec_groups").delete().in("id", newGroups.map(g => g.id));
          return rowErr.message;
        }
      }
    }

    const oldIds = existingGroups.map(g => g.id);
    if (oldIds.length > 0) {
      const { error: delErr } = await supabase.from("spec_groups").delete().in("id", oldIds);
      if (delErr) return delErr.message;
    }
    return null;
  }

  /** Same insert-then-delete-old pattern as saveSpecGroups. */
  async function saveImages(productId: string): Promise<string | null> {
    const supabase = createClient();
    // Insert hero as the only image if the gallery is empty
    const allImages = (images.length > 0 ? images : [{ id: uid(), url: heroImage, alt: name }])
      .filter(i => i.url);

    if (allImages.length > 0) {
      const { error } = await supabase.from("product_images").insert(
        allImages.map((img, i) => ({
          product_id: productId,
          url: img.url,
          alt: img.alt || name,
          sort_order: i + 1,
        }))
      );
      if (error) return error.message;
    }

    const oldIds = existingImages.map(i => i.id);
    if (oldIds.length > 0) {
      const { error: delErr } = await supabase.from("product_images").delete().in("id", oldIds);
      if (delErr) return delErr.message;
    }
    return null;
  }

  /** Upsert the selected relations, then remove deselected ones.
   *  Returns an error message, or null on success. */
  async function saveRelated(productId: string): Promise<string | null> {
    const supabase = createClient();
    const selected = related.filter(id => id !== productId);
    if (selected.length > 0) {
      const { error } = await supabase.from("related_products").upsert(
        selected.map((rid, i) => ({
          product_id: productId,
          related_product_id: rid,
          sort_order: i + 1,
        })),
        { onConflict: "product_id,related_product_id" }
      );
      if (error) return error.message;
    }
    const del = supabase.from("related_products").delete().eq("product_id", productId);
    const { error: delErr } = selected.length > 0
      ? await del.not("related_product_id", "in", `(${selected.join(",")})`)
      : await del;
    if (delErr) return delErr.message;
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryId) { setError("Please select a category."); return; }
    setSaving(true);
    setError("");
    const supabase = createClient();
    // Gallery images take priority; fall back to manual heroImage only when no gallery images
    const resolvedImage = images.length > 0 ? images[0].url : heroImage;
    const payload = {
      slug, category_id: categoryId, name, tagline,
      description: [desc1, desc2].filter(Boolean),
      image: resolvedImage,
      sort_order: parseInt(sortOrder) || 0,
      keywords: keywords.split(",").map(k => k.trim()).filter(Boolean),
      variants: variants.length > 0 ? variants : null,
      standard_equipment: stdEquipment.trim()
        ? stdEquipment.split("\n").map(l => l.trim()).filter(Boolean)
        : null,
    };

    let productId = existing?.id;
    if (existing) {
      const { error: err } = await supabase.from("products").update(payload).eq("id", existing.id);
      if (err) { setError(err.message); setSaving(false); return; }
    } else {
      const { data, error: err } = await supabase.from("products").insert(payload).select().single();
      if (err || !data) { setError(err?.message ?? "Insert failed"); setSaving(false); return; }
      productId = (data as DbProduct).id;
    }

    const [specErr, imgErr, relErr] = await Promise.all([
      saveSpecGroups(productId!),
      saveImages(productId!),
      saveRelated(productId!),
    ]);
    if (specErr || imgErr || relErr) {
      setError([specErr, imgErr, relErr].filter(Boolean).join(" — "));
      setSaving(false);
      return;
    }
    router.push("/admin/products");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6 max-w-3xl">
      {/* Category picker using tree */}
      <ParentPicker
        tree={tree}
        value={categoryId}
        onChange={setCategoryId}
      />
      {/* Override label */}
      <style>{`.parent-pick-override select { } `}</style>

      <div className="grid gap-4 sm:grid-cols-2">
        <AdminFormField label="Product name" name="name" required value={name} onChange={handleNameChange} placeholder="VMC 850 Vertical Machining Centre" />
        <AdminFormField label="Slug" name="slug" required value={slug} onChange={setSlug} hint="Unique URL identifier" />
      </div>

      <AdminFormField label="Tagline" name="tagline" required value={tagline} onChange={setTagline} placeholder="Large-table BT40 machining centre with 24-tool ATC" />

      <AdminTextareaField label="Description paragraph 1" name="desc1" required value={desc1} onChange={setDesc1} rows={3} />
      <AdminTextareaField label="Description paragraph 2" name="desc2" value={desc2} onChange={setDesc2} rows={3} hint="Optional" />

      {/* Hero image */}
      <div>
        <label className="text-sm font-medium text-graphite block mb-1">Hero image (primary)</label>
        <input
          type="text"
          value={heroImage}
          onChange={e => setHeroImage(e.target.value)}
          placeholder="/images/my-product.jpg or https://..."
          className="w-full rounded-md border border-steel-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
        />
      </div>

      {/* Gallery */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-graphite">Gallery images</span>
        <p className="text-xs text-graphite/50">Additional photos shown in the product page gallery. Drag to reorder (coming soon).</p>
        <div className="flex flex-wrap gap-3">
          {images.map((img, i) => (
            <div key={img.id} className="relative group">
              <div className="relative h-20 w-24 rounded-md overflow-hidden border border-steel-200 bg-steel-50">
                <Image src={img.url.startsWith("/") ? img.url : img.url} alt={img.alt} fill className="object-cover" unoptimized={!img.url.startsWith("/")} />
                <span className="absolute bottom-0 left-0 bg-graphite/70 text-white text-[9px] px-1">#{i + 1}</span>
              </div>
              <button type="button" onClick={() => removeImage(img.id)}
                className="absolute -top-1.5 -right-1.5 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-spark text-white shadow">
                <X size={10} />
              </button>
            </div>
          ))}
          {/* Upload new */}
          <label className={`flex h-20 w-24 flex-col items-center justify-center gap-1 rounded-md border-2 border-dashed border-steel-200 cursor-pointer hover:border-cyan transition-colors ${uploadingImage ? "opacity-50" : ""}`}>
            <Upload size={16} className="text-graphite/40" />
            <span className="text-[10px] text-graphite/40">{uploadingImage ? "Uploading…" : "Add photo"}</span>
            <input type="file" accept="image/*" className="hidden" disabled={uploadingImage}
              onChange={e => { const f = e.target.files?.[0]; if (f) handleImageUpload(f); }} />
          </label>
        </div>
        {/* URL input for gallery */}
        <input
          type="text"
          placeholder="Or paste an image URL and press Enter"
          className="rounded-md border border-steel-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none"
          onKeyDown={e => {
            if (e.key === "Enter") {
              e.preventDefault();
              const v = (e.target as HTMLInputElement).value.trim();
              if (v) { setImages(prev => [...prev, { id: uid(), url: v, alt: name }]); (e.target as HTMLInputElement).value = ""; }
            }
          }}
        />
      </div>

      {/* Variants */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-graphite">Model variants</span>
        <p className="text-xs text-graphite/50">Leave empty for a single model. Add variants if this product comes in multiple configurations (e.g. RTM-U-324-1500 RPM / 1900 RPM).</p>
        <div className="flex flex-wrap gap-2">
          {variants.map(v => (
            <span key={v} className="inline-flex items-center gap-1 rounded-full bg-steel-100 px-3 py-1 text-xs text-graphite">
              {v}
              <button type="button" onClick={() => setVariants(variants.filter(x => x !== v))}>
                <X size={10} className="text-graphite/50 hover:text-spark" />
              </button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input value={newVariant} onChange={e => setNewVariant(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addVariant(); } }}
            className="rounded-md border border-steel-200 px-3 py-1.5 text-sm focus:border-cyan focus:outline-none"
            placeholder="e.g. RTM-U-324-1500 RPM" />
          <button type="button" onClick={addVariant}
            className="inline-flex items-center gap-1 rounded-md border border-steel-200 px-3 py-1.5 text-sm text-graphite hover:border-cyan hover:text-cyan-deep">
            <Plus size={14} /> Add
          </button>
        </div>
      </div>

      {/* Spec builder */}
      <SpecBuilder groups={specGroups} onChange={setSpecGroups} variants={variants} />

      {/* Related products */}
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium text-graphite">Related products</span>
        <p className="text-xs text-graphite/50">
          Shown in the &ldquo;Related products&rdquo; section on this product&rsquo;s page, in this order.
          Leave empty to automatically show other products from the same category.
        </p>
        <ol className="flex flex-col gap-1">
          {related.map((rid, i) => {
            const prod = allProducts.find(p => p.id === rid);
            return (
              <li key={rid} className="inline-flex items-center gap-2 rounded-md bg-steel-100 px-3 py-1.5 text-xs text-graphite">
                <span className="font-mono text-graphite/40">#{i + 1}</span>
                <span className="flex-1">{prod?.name ?? rid}</span>
                <button type="button" aria-label="Move up" disabled={i === 0}
                  onClick={() => {
                    const next = [...related];
                    [next[i - 1], next[i]] = [next[i], next[i - 1]];
                    setRelated(next);
                  }}
                  className="text-graphite/50 hover:text-cyan-deep disabled:opacity-30">↑</button>
                <button type="button" aria-label="Move down" disabled={i === related.length - 1}
                  onClick={() => {
                    const next = [...related];
                    [next[i], next[i + 1]] = [next[i + 1], next[i]];
                    setRelated(next);
                  }}
                  className="text-graphite/50 hover:text-cyan-deep disabled:opacity-30">↓</button>
                <button type="button" aria-label={`Remove ${prod?.name ?? "related product"}`}
                  onClick={() => setRelated(related.filter(id => id !== rid))}>
                  <X size={10} className="text-graphite/50 hover:text-spark" />
                </button>
              </li>
            );
          })}
        </ol>
        <select
          value=""
          onChange={e => { if (e.target.value) setRelated([...related, e.target.value]); }}
          className="w-full max-w-md rounded-md border border-steel-200 px-3 py-2 text-sm text-graphite focus:border-cyan focus:outline-none"
        >
          <option value="">Add a related product…</option>
          {allProducts
            .filter(p => p.id !== existing?.id && !related.includes(p.id))
            .map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
        </select>
      </div>

      {/* Standard equipment */}
      <AdminTextareaField
        label="Standard equipment" name="std_eq" value={stdEquipment} onChange={setStdEquipment} rows={5}
        hint="One item per line. Leave blank if not applicable."
        placeholder={"GSK 988T CNC controller\nCoolant system\nAutomatic lubrication"} />

      <AdminFormField
        label="Keywords (comma-separated)" name="keywords" value={keywords} onChange={setKeywords}
        hint="Used for SEO and search"
        placeholder="VMC 850, vertical machining centre Dubai, BT40 mill UAE" />

      <AdminFormField label="Sort order" name="sort_order" type="number" value={sortOrder} onChange={setSortOrder} />

      {error && <p className="text-sm text-spark">{error}</p>}

      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-md bg-graphite px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-deep disabled:opacity-50 transition-colors">
          {saving ? "Saving…" : existing ? "Save changes" : "Create product"}
        </button>
        <button type="button" onClick={() => router.push("/admin/products")}
          className="rounded-md border border-steel-200 px-5 py-2.5 text-sm text-graphite hover:bg-steel-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
