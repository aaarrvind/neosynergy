import { createClient } from "@supabase/supabase-js";

/**
 * Cookie-free Supabase client for PUBLIC reads (anon key, RLS public-read
 * policies). Safe to call during build/ISR where next/headers is unavailable.
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  );
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return !!url && !url.includes("placeholder");
}
