import { notFound } from "next/navigation";
import { supabaseAdmin } from "@/lib/supabase";
import { ParticipantForm } from "@/components/participant-form";

export const dynamic = "force-dynamic";
export default async function EventPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const { data: event } = await supabaseAdmin().from("events").select("id,title,speaker,event_date,code,is_open").eq("code", code).maybeSingle();
  if (!event) notFound();
  return <main className="min-h-screen px-4 py-10 sm:py-16"><div className="mx-auto max-w-md">
    <header className="mb-7 text-center"><div className="mx-auto mb-4 grid h-12 w-12 place-items-center rounded-2xl bg-[#e8eef9] font-black text-[#2256a4]">CS</div>
      <p className="text-xs font-bold uppercase tracking-[.2em] text-[#708198]">Comité Social · ESITH</p>
      <h1 className="mt-3 text-2xl font-bold leading-tight">{event.title}</h1>{event.speaker && <p className="mt-2 text-[#61738a]">Avec {event.speaker}</p>}
    </header>
    <ParticipantForm code={code} isOpen={event.is_open} />
    <p className="mt-7 text-center text-xs text-[#8390a1]">Aucune connexion requise · Vos questions sont modérées par l’organisation.</p>
  </div></main>;
}
