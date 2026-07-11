import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServiceForm } from "@/components/admin/ServiceForm";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { DbService } from "@/lib/supabase/db-types";
export default async function EditServicePage({ params }: { params: { id: string } }) {
  const supabase = createServerSupabaseClient();
  const { data } = await supabase.from("services").select("*").eq("id", params.id).single();
  if (!data) notFound();
  return <div><AdminPageHeader title={`Edit: ${(data as DbService).name}`} /><ServiceForm existing={data as DbService} /></div>;
}
