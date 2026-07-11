"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { AdminFormField, AdminTextareaField } from "./AdminFormField";
import { DbService } from "@/lib/supabase/db-types";

const ICONS = ["Cog","BrainCircuit","Settings2","Wrench","Bot","RefreshCw","Cpu","Shield","Zap","Tool"];

export function ServiceForm({ existing }: { existing?: DbService }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [slug, setSlug] = useState(existing?.slug ?? "");
  const [name, setName] = useState(existing?.name ?? "");
  const [shortDesc, setShortDesc] = useState(existing?.short_description ?? "");
  const [desc1, setDesc1] = useState(Array.isArray(existing?.description) ? (existing.description[0] ?? "") : "");
  const [desc2, setDesc2] = useState(Array.isArray(existing?.description) ? (existing.description[1] ?? "") : "");
  const [icon, setIcon] = useState(existing?.icon ?? "Cog");
  const [sortOrder, setSortOrder] = useState(String(existing?.sort_order ?? 0));

  function handleNameChange(v: string) {
    setName(v);
    if (!existing) setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError("");
    const supabase = createClient();
    const payload = { slug, name, short_description: shortDesc, description: [desc1, desc2].filter(Boolean), icon, sort_order: parseInt(sortOrder) || 0 };
    const { error: err } = existing
      ? await supabase.from("services").update(payload).eq("id", existing.id)
      : await supabase.from("services").insert(payload);
    if (err) { setError(err.message); setSaving(false); return; }
    router.push("/admin/services"); router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5 max-w-2xl">
      <AdminFormField label="Name" name="name" required value={name} onChange={handleNameChange} placeholder="Machine Tools" />
      <AdminFormField label="Slug" name="slug" required value={slug} onChange={setSlug} hint="URL identifier e.g. machine-tools" />
      <AdminTextareaField label="Short description" name="short_desc" required value={shortDesc} onChange={setShortDesc} rows={2} hint="One-line description shown on cards" />
      <AdminTextareaField label="Description paragraph 1" name="desc1" required value={desc1} onChange={setDesc1} rows={3} />
      <AdminTextareaField label="Description paragraph 2" name="desc2" value={desc2} onChange={setDesc2} rows={3} hint="Optional" />
      <label className="flex flex-col gap-2">
        <span className="text-sm font-medium text-graphite">Icon</span>
        <div className="flex flex-wrap gap-2">
          {ICONS.map(ic => (
            <button key={ic} type="button" onClick={() => setIcon(ic)}
              className={`rounded-md border px-3 py-1.5 text-xs font-mono transition-colors ${icon === ic ? "border-cyan bg-cyan-50 text-cyan-deep font-bold" : "border-steel-200 text-graphite/60 hover:border-cyan"}`}>
              {ic}
            </button>
          ))}
        </div>
      </label>
      <AdminFormField label="Sort order" name="sort_order" type="number" value={sortOrder} onChange={setSortOrder} />
      {error && <p className="text-sm text-spark">{error}</p>}
      <div className="flex gap-3">
        <button type="submit" disabled={saving}
          className="rounded-md bg-graphite px-5 py-2.5 text-sm font-medium text-white hover:bg-cyan-deep disabled:opacity-50">
          {saving ? "Saving…" : existing ? "Save changes" : "Create service"}
        </button>
        <button type="button" onClick={() => router.push("/admin/services")}
          className="rounded-md border border-steel-200 px-5 py-2.5 text-sm text-graphite hover:bg-steel-50">
          Cancel
        </button>
      </div>
    </form>
  );
}
