import { NextRequest, NextResponse } from "next/server";
import { searchCatalog } from "@/lib/supabase/queries";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? "";
  if (!q.trim()) return NextResponse.json({ results: [] });
  const results = await searchCatalog(q);
  return NextResponse.json({ results });
}
