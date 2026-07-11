"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Logo } from "@/components/Logo";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) { setError(error.message); setLoading(false); return; }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-graphite px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center"><Logo variant="footer" /></div>
        <div className="rounded-lg border border-white/10 bg-graphite-light p-8">
          <h1 className="font-display text-xl font-semibold text-white mb-6">Admin login</h1>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-white/60">Email</span>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} autoComplete="email"
                className="rounded-md border border-white/10 bg-graphite px-3 py-2 text-white placeholder-white/30 focus:border-cyan focus:outline-none" />
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-white/60">Password</span>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} autoComplete="current-password"
                className="rounded-md border border-white/10 bg-graphite px-3 py-2 text-white placeholder-white/30 focus:border-cyan focus:outline-none" />
            </label>
            {error && <p className="text-sm text-spark">{error}</p>}
            <button type="submit" disabled={loading}
              className="mt-2 rounded-md bg-cyan px-4 py-2.5 text-sm font-medium text-graphite transition-colors hover:bg-white disabled:opacity-50">
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
