import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient, createServiceRoleClient } from "@/lib/supabase/server";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// getUser() revalidates the token with Supabase Auth. Never gate
// service-role operations on getSession() — it trusts the cookie unverified.
async function requireAuth() {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user;
}

export async function GET() {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.auth.admin.listUsers();
    if (error) throw error;
    const users = data.users.map((u: { id: string; email?: string; created_at: string; last_sign_in_at?: string }) => ({
      id: u.id, email: u.email ?? "",
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at,
    }));
    return NextResponse.json({ users });
  } catch (e) {
    return NextResponse.json({ error: "Failed to list users" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }
  if (typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    return NextResponse.json({ error: "A valid email is required" }, { status: 400 });
  }

  try {
    const admin = createServiceRoleClient();
    const { data, error } = await admin.auth.admin.inviteUserByEmail(email);
    if (error) throw error;
    return NextResponse.json({ ok: true, user: data.user });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Failed to invite user";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const user = await requireAuth();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

  try {
    const admin = createServiceRoleClient();
    // Lockout guard: don't allow deleting your own account when it's the
    // last one — that would leave the admin panel with no valid login.
    if (id === user.id) {
      const { data, error } = await admin.auth.admin.listUsers();
      if (error) throw error;
      if (data.users.length <= 1) {
        return NextResponse.json(
          { error: "Cannot delete the last admin user." },
          { status: 400 }
        );
      }
    }
    const { error } = await admin.auth.admin.deleteUser(id);
    if (error) throw error;
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
