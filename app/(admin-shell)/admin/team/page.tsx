"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UserPlus, Trash2, Mail } from "lucide-react";

interface AdminUser { id: string; email: string; created_at: string; last_sign_in_at?: string; }

export default function AdminTeamPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviting, setInviting] = useState(false);
  const [inviteMsg, setInviteMsg] = useState("");
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    const res = await fetch("/api/admin/team");
    if (res.ok) { const d = await res.json(); setUsers(d.users ?? []); }
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setInviting(true); setError(""); setInviteMsg("");
    const res = await fetch("/api/admin/team", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: inviteEmail }),
    });
    const d = await res.json();
    if (!res.ok) setError(d.error ?? "Something went wrong");
    else { setInviteMsg(`Invite sent to ${inviteEmail}`); setInviteEmail(""); await load(); }
    setInviting(false);
  }

  async function handleRemove(id: string, email: string) {
    if (!confirm(`Remove ${email} from admin access?`)) return;
    await fetch(`/api/admin/team?id=${id}`, { method: "DELETE" });
    await load();
  }

  return (
    <div className="max-w-2xl">
      <AdminPageHeader title="Team" />
      <p className="text-sm text-graphite/50 mb-6">
        Manage admin users. All admins have the same access. Invited users receive an email to set their password.
      </p>

      {/* Current users */}
      <div className="rounded-lg border border-steel-200 bg-white overflow-hidden mb-8">
        {loading ? (
          <p className="text-sm text-graphite/50 p-4">Loading…</p>
        ) : users.length === 0 ? (
          <p className="text-sm text-graphite/50 p-4">No users yet.</p>
        ) : (
          <ul className="divide-y divide-steel-100">
            {users.map(u => (
              <li key={u.id} className="flex items-center justify-between px-4 py-3 gap-3">
                <div className="flex items-center gap-2 min-w-0">
                  <div className="h-8 w-8 flex-shrink-0 rounded-full bg-cyan-50 flex items-center justify-center">
                    <Mail size={14} className="text-cyan-deep" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-graphite truncate">{u.email}</p>
                    <p className="text-xs text-graphite/40">
                      Added {new Date(u.created_at).toLocaleDateString()}
                      {u.last_sign_in_at && ` · Last login ${new Date(u.last_sign_in_at).toLocaleDateString()}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => handleRemove(u.id, u.email)}
                  className="flex-shrink-0 rounded p-1.5 text-graphite/40 hover:bg-steel-100 hover:text-spark">
                  <Trash2 size={15} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Invite form */}
      <div className="rounded-lg border border-steel-200 bg-white p-5">
        <h2 className="font-display text-base font-semibold text-graphite mb-1">Invite a team member</h2>
        <p className="text-xs text-graphite/50 mb-4">They will receive an email to set their password and access the admin panel.</p>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input type="email" required value={inviteEmail} onChange={e => setInviteEmail(e.target.value)}
            placeholder="colleague@neosynergy.ae"
            className="flex-1 rounded-md border border-steel-200 px-3 py-2 text-sm focus:border-cyan focus:outline-none" />
          <button type="submit" disabled={inviting}
            className="inline-flex items-center gap-2 rounded-md bg-graphite px-4 py-2 text-sm font-medium text-white hover:bg-cyan-deep disabled:opacity-50 transition-colors">
            <UserPlus size={15} />
            {inviting ? "Sending…" : "Send invite"}
          </button>
        </form>
        {inviteMsg && <p className="mt-2 text-xs text-cyan-deep">{inviteMsg}</p>}
        {error && <p className="mt-2 text-xs text-spark">{error}</p>}
      </div>
    </div>
  );
}
