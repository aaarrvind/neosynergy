import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { AdminNav } from "@/components/admin/AdminNav";

export const metadata = {
  title: "Admin — Neo Synergy",
  robots: { index: false, follow: false },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes("placeholder");

  if (supabaseConfigured) {
    const supabase = createServerSupabaseClient();
    // getUser() revalidates the token with Supabase Auth (defense-in-depth
    // behind the middleware check); getSession() would trust the raw cookie.
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) redirect("/admin-login");
  }

  return (
    <div className="flex min-h-screen bg-steel-50">
      <AdminNav />
      <main className="flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
    </div>
  );
}
