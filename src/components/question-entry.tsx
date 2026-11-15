import { getFeaturedEvent } from "@/lib/events";
import { supabaseAdmin } from "@/lib/supabase";
import { ParticipantForm } from "@/components/participant-form";
import { Brand } from "@/components/brand";

export async function QuestionEntry({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  let event;
  try {
    if (code) {
      const { data, error } = await supabaseAdmin().from("events").select("id,title,speaker,event_date,code,is_open").eq("code", code).maybeSingle();
      if (error) throw error;
      event = data;
    } else {
      event = await getFeaturedEvent();
    }
  } catch {
    return <main className="question-page"><div className="question-shell"><header className="question-header"><Brand compact/><p className="eyebrow">Questions en direct</p><h1>Service temporairement indisponible</h1></header><section className="panel question-state"><p>La connexion à la base de données n’est pas configurée. Les questions ne peuvent pas encore être enregistrées.</p></section></div></main>;
  }
  if (!event) return <main className="question-page"><div className="question-shell"><header className="question-header"><Brand compact/><p className="eyebrow">Questions en direct</p><h1>Aucun événement disponible</h1></header><section className="panel question-state"><p>Un événement doit être créé dans l’administration avant de pouvoir envoyer une question.</p></section></div></main>;
  return <main className="question-page"><div className="question-shell">
    <header className="question-header"><Brand compact/><p className="eyebrow">Questions en direct</p>
      <h1>{event.title}</h1>{event.speaker && <p className="event-speaker">{event.speaker}{event.event_date ? ` · ${new Date(`${event.event_date}T12:00:00`).toLocaleDateString("fr-FR")}` : ""}</p>}
    </header>
    <ParticipantForm code={event.code} isOpen={event.is_open}/>
    <footer className="question-footer">Aucune connexion requise · Comité Social ESITH</footer>
  </div></main>;
}
