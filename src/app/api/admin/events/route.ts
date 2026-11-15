import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { slugCode } from "@/lib/utils";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const { data, error } = await supabaseAdmin().from("events").select("*").order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ events: data });
}

export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body || typeof body.title !== "string" || !body.title.trim() || typeof body.speaker !== "string") return NextResponse.json({ error: "Titre requis." }, { status: 400 });
  const code = slugCode(typeof body.code === "string" && body.code.trim() ? body.code : body.title);
  if (!code) return NextResponse.json({ error: "Code d’événement invalide." }, { status: 400 });
  const { data, error } = await supabaseAdmin().from("events").insert({ title: body.title.trim().slice(0, 160), speaker: body.speaker.trim().slice(0, 120), event_date: body.event_date || null, code, is_open: true }).select().single();
  if (error) return NextResponse.json({ error: error.code === "23505" ? "Ce code existe déjà." : error.message }, { status: 400 });
  return NextResponse.json({ event: data }, { status: 201 });
}

export async function PATCH(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const body = await request.json().catch(() => null);
  if (!body?.id || typeof body.id !== "string") return NextResponse.json({ error: "Événement invalide." }, { status: 400 });
  const allowed = ["title", "speaker", "event_date", "is_open", "premoderation", "max_per_device"];
  const values: Record<string, unknown> = {};
  for (const key of allowed) if (body[key] !== undefined) values[key] = body[key];
  if (typeof values.max_per_device === "number") values.max_per_device = Math.max(1, Math.min(100, values.max_per_device));
  const { data, error } = await supabaseAdmin().from("events").update(values).eq("id", body.id).select().single();
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ event: data });
}

export async function DELETE(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const { id } = await request.json().catch(() => ({}));
  const { error } = await supabaseAdmin().from("events").delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ ok: true });
}
