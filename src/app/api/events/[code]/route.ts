import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data, error } = await supabaseAdmin().from("events").select("id,title,speaker,event_date,code,is_open").eq("code", code).single();
  if (error || !data) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  return NextResponse.json({ event: data });
}
