"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminTable } from "@/components/admin/AdminTable";
import { DbService } from "@/lib/supabase/db-types";

export default function AdminServicesPage() {
  const [rows, setRows] = useState<DbService[]>([]);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    const supabase = createClient();
    const { data } = await supabase.from("services").select("*").order("sort_order");
    setRows((data as DbService[]) ?? []);
    setLoading(false);
  }
  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    if (!confirm("Delete this service?")) return;
    setDeleting(id);
    await createClient().from("services").delete().eq("id", id);
    await load(); setDeleting(null);
  }

  return (
    <div>
      <AdminPageHeader title="Services" newHref="/admin/services/new" newLabel="Add service" />
      {loading ? <p className="text-sm text-graphite/50">Loading…</p> : (
        <AdminTable rows={rows}
          columns={[
            { key: "sort_order", label: "#" },
            { key: "name", label: "Name" },
            { key: "slug", label: "Slug" },
            { key: "icon", label: "Icon" },
          ]}
          editHref={row => `/admin/services/${row.id}`}
          onDelete={handleDelete} deleting={deleting} />
      )}
    </div>
  );
}
