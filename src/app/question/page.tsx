import { notFound } from "next/navigation";
import { getFeaturedEvent } from "@/lib/events";
import { supabaseAdmin } from "@/lib/supabase";
import { ParticipantForm } from "@/components/participant-form";
import { Brand } from "@/components/brand";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Poser une question — Comité Social ESITH", robots: { index: false, follow: false, noarchive: true } };

export const dynamic = "force-dynamic";

export default async function QuestionPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  const supabase = supabaseAdmin();
  const event = code
    ? (await supabase.from("events").select("id,title,speaker,event_date,code,is_open").eq("code", code).maybeSingle()).data
    : await getFeaturedEvent();
  if (!event) notFound();
  return <main className="question-page"><div className="question-shell">
    <header className="question-header"><Brand compact/><p className="eyebrow">Questions en direct</p>
      <h1>{event.title}</h1>{event.speaker && <p className="event-speaker">{event.speaker}{event.event_date ? ` · ${new Date(`${event.event_date}T12:00:00`).toLocaleDateString("fr-FR")}` : ""}</p>}
    </header>
    <ParticipantForm code={event.code} isOpen={event.is_open}/>
    <footer className="question-footer">Aucune connexion requise · Comité Social ESITH</footer>
  </div></main>;
}
