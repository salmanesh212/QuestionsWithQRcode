import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { cleanQuestion, hashValue, inappropriateWords } from "@/lib/utils";

function startedAt(value?: string) {
  if (!value) return 0;
  const [stamp, sig] = value.split(".");
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant.");
  const expected = createHmac("sha256", secret).update(stamp).digest("hex");
  const a = Buffer.from(sig ?? ""); const b = Buffer.from(expected);
  return a.length === b.length && a.length > 0 && timingSafeEqual(a, b) ? Number(stamp) : 0;
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.eventCode !== "string" || typeof body.question !== "string") return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  if (typeof body.website !== "string" || body.website.length > 0) return NextResponse.json({ error: "Envoi refusé." }, { status: 400 });
  const jar = await cookies();
  const device = jar.get("cs_device")?.value;
  const start = startedAt(jar.get("cs_started")?.value);
  if (!device || !start || Date.now() - start < 3000) return NextResponse.json({ error: "Veuillez patienter quelques secondes avant l’envoi." }, { status: 429 });
  const question = cleanQuestion(body.question);
  if (question.length < 5 || question.length > 300 || /<\/?[a-z][^>]*>/i.test(body.question)) return NextResponse.json({ error: "La question doit contenir entre 5 et 300 caractères, sans HTML." }, { status: 400 });
  const normalized = question.toLocaleLowerCase("fr");
  if (inappropriateWords.some((word) => normalized.includes(word))) return NextResponse.json({ error: "Merci de reformuler votre question." }, { status: 400 });
  const { data: event, error: eventError } = await supabaseAdmin().from("events").select("id,is_open,premoderation,max_per_device").eq("code", body.eventCode).single();
  if (eventError || !event) return NextResponse.json({ error: "Événement introuvable." }, { status: 404 });
  if (!event.is_open) return NextResponse.json({ error: "Les questions sont closes." }, { status: 403 });
  const requestHeaders = await headers();
  const ip = (requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "inconnu").split(",")[0].trim();
  const { data: allowed, error: limitError } = await supabaseAdmin().rpc("check_question_limits", {
    p_event_id: event.id, p_device_hash: hashValue(device), p_ip_hash: hashValue(ip), p_max_device: event.max_per_device,
  });
  if (limitError) return NextResponse.json({ error: "Service temporairement indisponible." }, { status: 503 });
  if (!allowed) return NextResponse.json({ error: "La limite d’envoi est atteinte. Merci de patienter avant de réessayer." }, { status: 429 });
  const firstName = typeof body.firstName === "string" ? cleanQuestion(body.firstName).slice(0, 60) : "";
  const { data, error } = await supabaseAdmin().from("questions").insert({
    event_id: event.id, question, first_name: body.anonymous === true || !firstName ? null : firstName,
    is_anonymous: body.anonymous === true || !firstName, status: event.premoderation ? "pending" : "approved",
  }).select("id").single();
  if (error) return NextResponse.json({ error: "La question n’a pas pu être enregistrée." }, { status: 500 });
  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
