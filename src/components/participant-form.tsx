"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

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
      if (typeof navigator !== "undefined" && !navigator.onLine) throw new Error("Aucune connexion Internet. Vérifiez votre réseau puis réessayez.");
      const response = await fetch("/api/questions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ eventCode: code, question, firstName, anonymous, website }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error ?? "L’envoi a échoué.");
      setSent(true); setQuestion(""); setFirstName("");
    } catch (e) { setError(e instanceof Error ? e.message : "L’envoi a échoué."); }
    finally { setBusy(false); }
  }

  if (!isOpen) return <section className="panel question-state"><div className="state-symbol state-symbol-quiet" aria-hidden="true">…</div><h2>Les questions sont closes</h2><p>La réception des questions est terminée pour cet événement. Merci de votre participation.</p></section>;
  if (sent) return <section className="panel question-state" role="status"><div className="state-symbol"><CheckCircle2 size={34}/></div><h2>Merci, votre question a été envoyée</h2><p>Elle sera transmise à l’équipe de modération.</p><button className="btn btn-secondary mt-6" onClick={() => setSent(false)}>Poser une autre question</button></section>;
  return <form className="panel question-form" onSubmit={submit}>
    <div className="form-heading"><span className="form-step">01</span><div><h2>Votre question</h2><p>Partagez votre question avec les intervenants.</p></div></div>
    <div><label className="label" htmlFor="question">Votre question</label><textarea id="question" className="field question-textarea" maxLength={300} required minLength={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="Écrivez votre question ici…" aria-describedby="question-counter"/><div className="character-count" id="question-counter" aria-live="polite">{question.length} / 300 caractères</div></div>
    <div><label className="label" htmlFor="firstName">Prénom <span className="optional-label">(optionnel)</span></label><input id="firstName" className="field" maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Votre prénom" disabled={anonymous}/></div>
    <label className="anonymous-option"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}/> <span className="custom-check" aria-hidden="true"/><span>Rester anonyme</span></label>
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="website">Site web</label><input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)}/></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="btn submit-question" type="submit" disabled={busy || question.trim().length < 5}>{busy ? <><LoaderCircle size={18} className="spinner" aria-hidden="true"/>Envoi en cours…</> : <><Send size={17}/>Envoyer</>}</button>
  </form>;
}
