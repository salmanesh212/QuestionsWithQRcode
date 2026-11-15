"use client";

import { useEffect, useState } from "react";
import { supabasePublic } from "@/lib/supabase-browser";
import type { QuestionRecord } from "@/lib/types";
import { Brand, WaveDecoration } from "@/components/brand";

type ScreenEvent = { id: string; title: string; speaker: string; code: string };
export function ScreenView({ event, initialQuestion }: { event: ScreenEvent; initialQuestion: QuestionRecord | null }) {
  const [question, setQuestion] = useState<QuestionRecord | null>(initialQuestion);
  useEffect(() => {
    const client = supabasePublic();
    const refresh = async () => {
      const { data } = await client.from("questions").select("*").eq("event_id", event.id).eq("status", "approved").eq("is_pinned", true).maybeSingle();
      setQuestion(data as QuestionRecord | null);
    };
    const channel = client.channel(`screen-${event.id}`).on("postgres_changes", { event: "*", schema: "public", table: "questions", filter: `event_id=eq.${event.id}` }, () => void refresh()).subscribe();
    return () => { void client.removeChannel(channel); };
  }, [event.id]);
  return <main className="screen-page">
    <header className="screen-header"><Brand compact light/><div className="screen-event"><p className="eyebrow">Écran de projection</p><h1>{event.title}</h1>{event.speaker && <p>{event.speaker}</p>}</div></header>
    <section aria-live="polite" className="screen-question">
      {question ? <div key={question.id} className="screen-question-inner"><div className="screen-badge"><span/>Question à l’écran</div><p>{question.question}</p>{!question.is_anonymous && question.first_name && <div className="screen-author">— {question.first_name}</div>}</div> : <div className="screen-empty"><div className="screen-empty-heart" aria-hidden="true">♡</div><p>Aucune question épinglée pour le moment</p><span>Les questions sélectionnées apparaîtront ici en direct.</span></div>}
    </section>
    <footer className="screen-footer">Scannez le QR de l’événement pour poser votre question</footer>
    <WaveDecoration/>
  </main>;
}
