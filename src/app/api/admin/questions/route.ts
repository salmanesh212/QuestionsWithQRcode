import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const { searchParams } = new URL(request.url);
  const eventId = searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ questions: [] });
  const { data, error } = await supabaseAdmin().from("questions").select("*").eq("event_id", eventId).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ questions: data });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id || typeof body.id !== "string") return NextResponse.json({ error: "Question invalide." }, { status: 400 });
  const allowed = ["status", "is_pinned", "is_answered"];
  const values: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) values[key] = body[key];
  if (values.is_pinned === true) {
    const { data: target } = await supabaseAdmin().from("questions").select("event_id").eq("id", body.id).single();
    if (target) {
      await supabaseAdmin().from("questions").update({ is_pinned: false }).eq("event_id", target.event_id).neq("id", body.id);
      if (values.status === undefined) values.status = "approved";
    }
  }
  const { data, error } = await supabaseAdmin().from("questions").update(values).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ question: data });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  const { error } = await supabaseAdmin().from("questions").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
