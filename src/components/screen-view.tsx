"use client";

import { useEffect, useState } from "react";
import { supabasePublic } from "@/lib/supabase-browser";
import type { QuestionRecord } from "@/lib/types";

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
  return <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#101924] px-8 py-16 text-white sm:px-16">
    <div className="pointer-events-none absolute -right-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#2256a4]/20 blur-3xl"/><div className="pointer-events-none absolute -bottom-64 -left-32 h-[36rem] w-[36rem] rounded-full bg-[#e7a936]/10 blur-3xl"/>
    <header className="relative mb-12 text-center"><p className="text-xs font-bold uppercase tracking-[.34em] text-[#edb64e]">Comité Social · ESITH Casablanca</p><h1 className="mt-5 max-w-5xl text-3xl font-bold sm:text-5xl">{event.title}</h1>{event.speaker && <p className="mt-3 text-lg text-white/60">{event.speaker}</p>}</header>
    <section aria-live="polite" className="relative grid min-h-[42vh] w-full max-w-6xl place-items-center rounded-[2rem] border border-white/10 bg-white/[.045] p-10 text-center shadow-2xl shadow-black/20 sm:p-16">
      {question ? <div key={question.id} className="animate-[fadeIn_.45s_ease-out]"><div className="mb-8 inline-flex rounded-full bg-[#e7a936]/15 px-4 py-2 text-sm font-bold text-[#f4c66e]">Question à l’écran</div><p className="text-3xl font-semibold leading-relaxed sm:text-5xl">{question.question}</p>{!question.is_anonymous && question.first_name && <p className="mt-8 text-lg text-white/50">— {question.first_name}</p>}</div> : <div><div className="mx-auto mb-6 h-2 w-16 rounded-full bg-[#e7a936]"/><p className="text-2xl font-semibold text-white/75 sm:text-4xl">Aucune question épinglée pour le moment</p><p className="mt-4 text-white/40">Les questions sélectionnées apparaîtront ici en direct.</p></div>}
    </section>
    <footer className="relative mt-10 text-sm text-white/35">Scannez le QR de l’événement pour poser votre question</footer>
  </main>;
}
