"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Send } from "lucide-react";

export function ParticipantForm({ code, isOpen }: { code: string; isOpen: boolean }) {
  const [question, setQuestion] = useState("");
  const [firstName, setFirstName] = useState("");
  const [anonymous, setAnonymous] = useState(false);
  const [website, setWebsite] = useState("");
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => { void fetch("/api/device").catch(() => undefined); }, []);

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventCode: code, question, firstName, anonymous, website }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "L’envoi a échoué.");
      setSent(true); setQuestion(""); setFirstName("");
    } catch (e) { setError(e instanceof Error ? e.message : "L’envoi a échoué."); }
    finally { setBusy(false); }
  }

  if (!isOpen) return <div className="panel p-7 text-center"><p className="text-lg font-bold">Les questions sont closes</p><p className="mt-2 text-sm text-[#6b7b8e]">La réception des questions est terminée pour cet événement.</p></div>;
  if (sent) return <div className="panel p-7 text-center"><CheckCircle2 className="mx-auto text-emerald-600" size={42}/><h2 className="mt-4 text-xl font-bold">Merci, votre question a été envoyée</h2><p className="mt-2 text-sm text-[#6b7b8e]">Elle sera transmise à l’équipe de modération.</p><button className="btn mt-6" onClick={() => setSent(false)}>Poser une autre question</button></div>;
  return <form className="panel space-y-5 p-5 sm:p-7" onSubmit={submit}>
    <div><label className="label" htmlFor="question">Votre question</label><textarea id="question" className="field min-h-32 resize-y" maxLength={300} required minLength={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Écrivez votre question ici…"/><div className="mt-1 text-right text-xs text-[#8290a0]">{question.length} / 300</div></div>
    <div><label className="label" htmlFor="firstName">Prénom <span className="font-normal text-[#8390a1]">(optionnel)</span></label><input id="firstName" className="field" maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" disabled={anonymous}/></div>
    <label className="flex cursor-pointer items-center gap-2 text-sm text-[#44546a]"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)} className="h-4 w-4 accent-[#2256a4]"/>Rester anonyme</label>
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="website">Site web</label><input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)}/></div>
    {error && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    <button className="btn w-full py-3" type="submit" disabled={busy || question.trim().length < 5}><Send size={16}/>{busy ? "Envoi…" : "Envoyer"}</button>
  </form>;
}
