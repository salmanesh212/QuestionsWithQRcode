"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, LoaderCircle, Send } from "lucide-react";

function toArabicError(message: string) {
  const translations: Record<string, string> = {
    "Aucune connexion Internet. Vérifiez votre réseau puis réessayez.": "لا يوجد اتصال بالإنترنت. تحقق من الشبكة ثم حاول مجددًا.",
    "Formulaire invalide.": "البيانات المُدخلة غير صالحة.",
    "Envoi refusé.": "تم رفض الإرسال.",
    "Veuillez patienter quelques secondes avant l’envoi.": "يرجى الانتظار بضع ثوانٍ قبل الإرسال.",
    "La question doit contenir entre 5 et 300 caractères, sans HTML.": "يجب أن يتراوح طول السؤال بين 5 و300 حرف، دون HTML.",
    "Merci de reformuler votre question.": "يرجى إعادة صياغة سؤالك.",
    "Événement introuvable.": "لم يتم العثور على الفعالية.",
    "Les questions sont closes.": "تم إغلاق باب الأسئلة.",
    "Service temporairement indisponible.": "الخدمة غير متاحة مؤقتًا. حاول مجددًا بعد قليل.",
    "La limite d’envoi est atteinte. Merci de patienter avant de réessayer.": "وصلت إلى الحد المسموح للإرسال. يرجى الانتظار قبل المحاولة مجددًا.",
    "La question n’a pas pu être enregistrée.": "تعذّر حفظ السؤال. حاول مجددًا.",
  };
  return translations[message] ?? "تعذّر إرسال السؤال. حاول مجددًا.";
}

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
      if (!response.ok) throw new Error(result.error ?? "");
      setSent(true); setQuestion(""); setFirstName("");
    } catch (e) { setError(toArabicError(e instanceof Error ? e.message : "")); }
    finally { setBusy(false); }
  }

  if (!isOpen) return <section className="panel question-state"><div className="state-symbol state-symbol-quiet" aria-hidden="true">…</div><h2>تم إغلاق باب الأسئلة</h2><p>انتهى استقبال الأسئلة لهذه الفعالية. شكرًا لمشاركتكم.</p></section>;
  if (sent) return <section className="panel question-state" role="status"><div className="state-symbol"><CheckCircle2 size={34}/></div><h2>شكرًا، تم إرسال سؤالك</h2><p>سيتم إرساله إلى فريق الإشراف.</p><button className="btn btn-secondary mt-6" onClick={() => setSent(false)}>إرسال سؤال آخر</button></section>;
  return <form className="panel question-form" onSubmit={submit}>
    <div className="form-heading"><span className="form-step" dir="ltr">01</span><div><h2>اكتب سؤالك</h2><p>شارك سؤالك مع المتدخلين.</p></div></div>
    <div><label className="label" htmlFor="question">سؤالك</label><textarea id="question" className="field question-textarea" maxLength={300} required minLength={5} value={question} onChange={(e) => setQuestion(e.target.value)} placeholder="اكتب سؤالك هنا…" aria-describedby="question-counter"/><div className="character-count" id="question-counter" aria-live="polite">{question.length.toLocaleString("ar")} / ٣٠٠ حرف</div></div>
    <div><label className="label" htmlFor="firstName">الاسم الأول <span className="optional-label">(اختياري)</span></label><input id="firstName" className="field" autoComplete="given-name" maxLength={60} value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="اكتب اسمك" disabled={anonymous}/></div>
    <label className="anonymous-option"><input type="checkbox" checked={anonymous} onChange={(e) => setAnonymous(e.target.checked)}/> <span className="custom-check" aria-hidden="true"/><span>إرسال السؤال دون ذكر اسمي</span></label>
    <div aria-hidden="true" className="absolute -left-[10000px] top-auto h-px w-px overflow-hidden"><label htmlFor="website">الموقع الإلكتروني</label><input id="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)}/></div>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="btn submit-question" type="submit" disabled={busy || question.trim().length < 5}>{busy ? <><LoaderCircle size={18} className="spinner" aria-hidden="true"/>جارٍ الإرسال…</> : <>إرسال<Send size={17}/></>}</button>
  </form>;
}
