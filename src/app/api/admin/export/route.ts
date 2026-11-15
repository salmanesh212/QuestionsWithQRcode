import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";

export async function GET(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "Accès refusé." }, { status: 401 });
  const eventId = new URL(request.url).searchParams.get("eventId");
  if (!eventId) return NextResponse.json({ error: "Événement manquant." }, { status: 400 });
  const { data, error } = await supabaseAdmin().from("questions").select("question,first_name,is_anonymous,status,is_answered,votes,created_at").eq("event_id", eventId).order("created_at");
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  const quote = (value: unknown) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = [["Question", "Prénom", "Anonyme", "Statut", "Répondue", "Votes", "Date"], ...(data ?? []).map((q) => [q.question, q.is_anonymous ? "" : q.first_name, q.is_anonymous ? "Oui" : "Non", q.status, q.is_answered ? "Oui" : "Non", q.votes, q.created_at])];
  const csv = `\uFEFF${rows.map((row) => row.map(quote).join(";")).join("\r\n")}`;
  return new Response(csv, { headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": "attachment; filename=questions-esith.csv" } });
}
