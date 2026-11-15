import { supabaseAdmin } from "@/lib/supabase";
import { ScreenView } from "@/components/screen-view";

export const dynamic = "force-dynamic";
export default async function ScreenPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  if (!code) return <main className="grid min-h-screen place-items-center bg-[#101924] p-8 text-center text-white"><div><p className="text-xs font-bold uppercase tracking-[.3em] text-amber-400">Comité Social · ESITH</p><h1 className="mt-5 text-4xl font-bold">Écran de questions</h1><p className="mt-3 text-white/60">Choisissez un événement depuis le tableau de bord pour ouvrir son écran.</p><a className="mt-7 inline-block rounded-xl bg-white px-5 py-3 font-bold text-[#12243a]" href="/admin">Ouvrir l’administration</a></div></main>;
  const { data: event } = await supabaseAdmin().from("events").select("id,title,speaker,code").eq("code", code).maybeSingle();
  if (!event) return <main className="grid min-h-screen place-items-center bg-[#101924] text-white">Événement introuvable.</main>;
  const { data: pinned } = await supabaseAdmin().from("questions").select("id,event_id,question,first_name,is_anonymous,status,is_pinned,is_answered,votes,created_at").eq("event_id", event.id).eq("status", "approved").eq("is_pinned", true).maybeSingle();
  return <ScreenView event={event} initialQuestion={pinned}/>;
}
