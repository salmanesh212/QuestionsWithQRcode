"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Download, ExternalLink, LogOut, Plus, QrCode, Search, Trash2, Check, EyeOff, Pin, CheckCircle2 } from "lucide-react";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import { supabasePublic } from "@/lib/supabase-browser";
import type { EventRecord, QuestionRecord } from "@/lib/types";
import { Brand } from "@/components/brand";

type SortMode = "date" | "votes";
async function api(url: string, method = "GET", body?: unknown) {
  const res = await fetch(url, { method, headers: body ? { "Content-Type": "application/json" } : undefined, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "Une erreur est survenue.");
  return data;
}

export function AdminPanel() {
  const [events, setEvents] = useState<EventRecord[]>([]); const [selected, setSelected] = useState("");
  const [featuredEventId, setFeaturedEventId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<QuestionRecord[]>([]); const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); const [sort, setSort] = useState<SortMode>("date"); const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false); const [error, setError] = useState("");
  const [editingDetails, setEditingDetails] = useState(false);
  const [detailsDraft, setDetailsDraft] = useState({ title: "", speaker: "" });
  const [draft, setDraft] = useState({ title: "", speaker: "", date: "", code: "" });
  const qrCanvas = useRef<HTMLDivElement>(null);
  const current = events.find((event) => event.id === selected);
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "") ?? "";
  const userLink = current && siteUrl ? `${siteUrl}/user?code=${encodeURIComponent(current.code)}` : "";

  const loadEvents = useCallback(async () => {
    const result = await api("/api/admin/events"); setEvents(result.events ?? []); setFeaturedEventId(result.featuredEventId ?? null);
    setSelected((old: string) => old || result.events?.[0]?.id || "");
  }, []);
  const loadQuestions = useCallback(async () => {
    if (!selected) { setQuestions([]); setLoading(false); return; }
    try { const result = await api(`/api/admin/questions?eventId=${selected}`); setQuestions(result.questions ?? []); }
    catch (e) { setError(e instanceof Error ? e.message : "Chargement impossible."); }
    finally { setLoading(false); }
  }, [selected]);
  useEffect(() => { void loadEvents().catch((e) => setError(e.message)); }, [loadEvents]);
  useEffect(() => { setLoading(true); void loadQuestions(); const timer = window.setInterval(() => void loadQuestions(), 4000); return () => window.clearInterval(timer); }, [loadQuestions]);
  useEffect(() => {
    if (!selected) return;
    const client = supabasePublic();
    const channel = client.channel(`questions-admin-${selected}`).on("postgres_changes", { event: "*", schema: "public", table: "questions", filter: `event_id=eq.${selected}` }, () => void loadQuestions()).subscribe();
    return () => { void client.removeChannel(channel); };
  }, [selected, loadQuestions]);

  async function createEvent(e: React.FormEvent) {
    e.preventDefault(); setError("");
    try { const result = await api("/api/admin/events", "POST", { title: draft.title, speaker: draft.speaker, event_date: draft.date || null, code: draft.code }); await loadEvents(); setSelected(result.event.id); setDraft({ title: "", speaker: "", date: "", code: "" }); setShowCreate(false); }
    catch (e) { setError(e instanceof Error ? e.message : "Création impossible."); }
  }
  async function changeEvent(values: Record<string, unknown>) {
    if (!current) return false;
    try {
      const result = await api("/api/admin/events", "PATCH", { id: current.id, ...values });
      setEvents((list) => list.map((event) => event.id === current.id ? result.event : event));
      if (result.featuredEventId !== undefined) setFeaturedEventId(result.featuredEventId);
      return true;
    } catch (e) { setError(e instanceof Error ? e.message : "Modification impossible."); return false; }
  }
  async function act(question: QuestionRecord, values?: Record<string, unknown>, remove = false) {
    try { await api("/api/admin/questions", remove ? "DELETE" : "PATCH", remove ? { id: question.id } : { id: question.id, ...values }); await loadQuestions(); }
    catch (e) { setError(e instanceof Error ? e.message : "Action impossible."); }
  }
  async function removeEvent() {
    if (!current || !window.confirm(`Supprimer l’événement « ${current.title} » et toutes ses questions ?`)) return;
    try { await api("/api/admin/events", "DELETE", { id: current.id }); setSelected(""); await loadEvents(); }
    catch (e) { setError(e instanceof Error ? e.message : "Suppression impossible."); }
  }
  async function exportCsv() {
    if (!current) return;
    try {
      const response = await fetch(`/api/admin/export?eventId=${current.id}`);
      if (!response.ok) throw new Error("L’export CSV a échoué.");
      const blob = await response.blob(); const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `questions-${current.code}.csv`; anchor.click(); URL.revokeObjectURL(url);
    } catch (e) { setError(e instanceof Error ? e.message : "Export impossible."); }
  }
  function downloadQr(format: "png" | "svg") {
    if (!userLink) { setError("Configurez NEXT_PUBLIC_SITE_URL pour créer le QR code public."); return; }
    const anchor = document.createElement("a");
    if (format === "png") {
      const canvas = qrCanvas.current?.querySelector("canvas"); if (!canvas) return;
      anchor.href = canvas.toDataURL("image/png"); anchor.download = `qr-${current?.code}.png`;
    } else {
      const svg = qrCanvas.current?.querySelector("svg"); if (!svg) return;
      const xml = new XMLSerializer().serializeToString(svg); anchor.href = URL.createObjectURL(new Blob([xml], { type: "image/svg+xml;charset=utf-8" })); anchor.download = `qr-${current?.code}.svg`;
    }
    anchor.click(); if (format === "svg") URL.revokeObjectURL(anchor.href);
  }
  const visible = useMemo(() => questions.filter((q) => (filter === "all" || (filter === "pending" ? q.status === "pending" : filter === "approved" ? q.status === "approved" : filter === "hidden" ? q.status === "hidden" : q.is_answered)) && `${q.question} ${q.first_name ?? ""}`.toLowerCase().includes(search.toLowerCase())).sort((a, b) => sort === "votes" ? b.votes - a.votes : new Date(b.created_at).getTime() - new Date(a.created_at).getTime()), [questions, filter, search, sort]);
  const stats = { all: questions.length, approved: questions.filter((q) => q.status === "approved").length, answered: questions.filter((q) => q.is_answered).length };

  return <main className="min-h-screen">
    <header className="admin-topbar"><div className="admin-topbar-inner"><Brand compact/><div className="admin-topbar-actions"><span>Administration</span><button className="btn btn-secondary" onClick={async () => { await fetch("/api/admin/logout", { method: "POST" }); window.location.reload(); }}><LogOut size={15}/> Déconnexion</button></div></div></header>
    <div className="admin-layout">
      <aside className="admin-sidebar"><details className="admin-nav-wrap" open><summary className="admin-nav-toggle">Menu d’administration <span aria-hidden="true">⌄</span></summary><nav className="admin-nav" aria-label="Navigation d’administration"><a href="#questions">Questions</a><a href="#events">Événement</a><a href="#qr-code">QR code</a><a href="#projector">Écran</a><a href="#settings">Réglages</a><a href="#export">Export</a></nav></details><section id="events" className="panel p-4"><div className="mb-3 flex items-center justify-between"><h2 className="font-bold">Événements</h2><button aria-label="Créer un événement" className="rounded-lg bg-[#2256a4] p-2 text-white" onClick={() => setShowCreate(!showCreate)}><Plus size={17}/></button></div>
        {showCreate && <form onSubmit={createEvent} className="mb-4 space-y-2 rounded-xl bg-[#f4f6fa] p-3"><input className="field" required placeholder="Titre de la conférence" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })}/><input className="field" placeholder="Intervenant" value={draft.speaker} onChange={(e) => setDraft({ ...draft, speaker: e.target.value })}/><input className="field" type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })}/><input className="field" placeholder="Code URL (facultatif)" value={draft.code} onChange={(e) => setDraft({ ...draft, code: e.target.value })}/><button className="btn w-full">Créer</button></form>}
        <div className="space-y-1">{events.map((event) => <button key={event.id} onClick={() => setSelected(event.id)} className={`w-full rounded-xl px-3 py-3 text-left ${selected === event.id ? "bg-[#eaf0fa] text-[#1f4f95]" : "hover:bg-slate-50"}`}><div className="truncate text-sm font-bold">{event.title}</div><div className="mt-1 text-xs text-[#748399]">{event.speaker || "Sans intervenant"}</div></button>)}{!events.length && <p className="py-4 text-sm text-[#76859a]">Aucun événement. Créez le premier.</p>}</div>
      </section>
      {current && <section id="qr-code" className="panel p-4"><h2 className="mb-3 flex items-center gap-2 font-bold"><QrCode size={17}/> QR de l’événement</h2>{userLink ? <><div ref={qrCanvas} className="mx-auto w-fit rounded-lg border bg-white p-2"><QRCodeCanvas value={userLink} size={172} level="H" includeMargin fgColor="#0A3F5F"/><QRCodeSVG value={userLink} size={172} level="H" includeMargin fgColor="#0A3F5F" className="hidden"/></div><p className="mt-2 break-all text-center text-xs text-[#64748b]">{userLink}</p><div className="mt-3 grid grid-cols-2 gap-2"><button className="btn btn-secondary px-2 text-xs" onClick={() => downloadQr("png")}><Download size={14}/> PNG</button><button className="btn btn-secondary px-2 text-xs" onClick={() => downloadQr("svg")}><Download size={14}/> SVG</button></div></> : <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800">Configurez NEXT_PUBLIC_SITE_URL pour créer un QR absolu.</p>}<a id="projector" className="mt-2 flex items-center justify-center gap-1 py-2 text-xs font-bold text-[#2256a4]" href={`/ecran?code=${current.code}`} target="_blank"><ExternalLink size={13}/> Ouvrir le projecteur</a></section>}
      </aside>

      <section className="admin-content">
        {error && <div role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}<button className="float-right" onClick={() => setError("")}>×</button></div>}
        {current ? <>
          <div id="questions" className="panel p-4"><div className="flex flex-wrap gap-3"><div className="relative min-w-48 flex-1"><Search size={16} className="absolute left-3 top-3 text-[#8090a3]"/><input className="field pl-9" placeholder="Rechercher une question…" value={search} onChange={(e) => setSearch(e.target.value)}/></div><select className="field w-auto min-w-36" value={filter} onChange={(e) => setFilter(e.target.value)}><option value="all">Tous les statuts</option><option value="pending">En attente</option><option value="approved">Approuvées</option><option value="hidden">Masquées</option><option value="answered">Répondues</option></select><select className="field w-auto" value={sort} onChange={(e) => setSort(e.target.value as SortMode)}><option value="date">Plus récentes</option><option value="votes">Votes</option></select></div>
            <div className="mt-4 space-y-3">{loading && !questions.length ? <p className="py-8 text-center text-sm text-[#738198]">Chargement des questions…</p> : visible.map((q) => <article key={q.id} className={`rounded-xl border p-4 ${q.is_pinned ? "border-[#e7a936] bg-[#fffaf0]" : "border-[#e5eaf0]"}`}><div className="flex flex-wrap items-start justify-between gap-3"><div className="min-w-0 flex-1"><div className="mb-2 flex flex-wrap items-center gap-2"><span className={`badge badge-${q.status}`}>{q.status === "pending" ? "En attente" : q.status === "approved" ? "Approuvée" : "Masquée"}</span>{q.is_answered && <span className="badge bg-blue-50 text-blue-700">Répondue</span>}{q.is_pinned && <span className="badge bg-amber-100 text-amber-800">Épinglée</span>}<span className="text-xs text-[#8290a0]">{new Date(q.created_at).toLocaleString("fr-FR")}</span></div><p className="whitespace-pre-wrap break-words font-medium">{q.question}</p><p className="mt-2 text-xs text-[#718198]">{q.is_anonymous ? "Anonyme" : q.first_name || "Participant"} · {q.votes} vote{q.votes === 1 ? "" : "s"}</p></div><div className="flex flex-wrap gap-1"><button className="rounded-lg p-2 text-emerald-700 hover:bg-emerald-50" title={q.status === "approved" ? "Masquer" : "Approuver"} onClick={() => void act(q, { status: q.status === "approved" ? "hidden" : "approved" })}>{q.status === "approved" ? <EyeOff size={17}/> : <Check size={17}/>}</button><button className="rounded-lg p-2 text-amber-700 hover:bg-amber-50" title="Épingler / désépingler" onClick={() => void act(q, { is_pinned: !q.is_pinned })}><Pin size={17}/></button><button className="rounded-lg p-2 text-blue-700 hover:bg-blue-50" title="Marquer comme répondue" onClick={() => void act(q, { is_answered: !q.is_answered })}><CheckCircle2 size={17}/></button><button className="rounded-lg p-2 text-[#607086] hover:bg-slate-100" title="Supprimer" onClick={() => { if (window.confirm("Supprimer cette question ?")) void act(q, undefined, true); }}><Trash2 size={17}/></button></div></div></article>)}{!loading && !visible.length && <p className="py-8 text-center text-sm text-[#738198]">Aucune question ne correspond à ces filtres.</p>}</div>
          </div>
          <div id="settings" className="panel flex flex-wrap items-center justify-between gap-4 p-5"><div><p className="text-xs font-bold uppercase tracking-wider text-[#718198]">Événement sélectionné</p><h1 className="mt-1 text-xl font-bold">{current.title}</h1><p className="mt-1 text-sm text-[#68798e]">{current.speaker || "Intervenant non renseigné"}{current.event_date ? ` · ${new Date(`${current.event_date}T12:00:00`).toLocaleDateString("fr-FR")}` : ""}</p></div><div className="flex flex-wrap gap-2"><button className="btn btn-secondary" onClick={() => { setDetailsDraft({ title: current.title, speaker: current.speaker }); setEditingDetails((value) => !value); }}>Modifier titre et intervenant</button><button className="btn btn-secondary" disabled={featuredEventId === current.id} onClick={() => void changeEvent({ featured: true })}>{featuredEventId === current.id ? "Affiché sur la page principale" : "Afficher sur la page principale"}</button><button className={`btn ${current.is_open ? "" : "btn-secondary"}`} onClick={() => void changeEvent({ is_open: !current.is_open })}>{current.is_open ? "Réception ouverte" : "Réception fermée"}</button><button id="export" className="btn btn-secondary" onClick={() => void exportCsv()}><Download size={15}/> CSV</button><button className="btn btn-danger px-3" title="Supprimer l’événement" onClick={() => void removeEvent()}><Trash2 size={16}/></button></div></div>
          {editingDetails && <form className="panel grid gap-3 p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end" onSubmit={async (e) => { e.preventDefault(); if (await changeEvent(detailsDraft)) setEditingDetails(false); }}><label><span className="label">Titre de la conférence</span><input className="field" required maxLength={160} value={detailsDraft.title} onChange={(e) => setDetailsDraft({ ...detailsDraft, title: e.target.value })}/></label><label><span className="label">Intervenant</span><input className="field" maxLength={120} value={detailsDraft.speaker} onChange={(e) => setDetailsDraft({ ...detailsDraft, speaker: e.target.value })}/></label><button className="btn">Enregistrer</button></form>}
          <div className="grid gap-3 sm:grid-cols-3">{[["Questions reçues", stats.all], ["Approuvées", stats.approved], ["Répondues", stats.answered]].map(([label, value]) => <div className="panel p-4" key={String(label)}><div className="text-sm text-[#718198]">{label}</div><div className="mt-1 text-2xl font-bold">{value}</div></div>)}</div>
          <div className="panel flex flex-wrap items-center justify-between gap-4 p-4"><label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={current.premoderation} onChange={(e) => void changeEvent({ premoderation: e.target.checked })} className="h-4 w-4 accent-[#2256a4]"/> Modération préalable</label><label className="flex items-center gap-2 text-sm">Maximum par appareil <input className="field w-20" type="number" min={1} max={100} value={current.max_per_device} onChange={(e) => void changeEvent({ max_per_device: Number(e.target.value) })}/></label></div>
        </> : <div className="panel grid min-h-72 place-items-center p-8 text-center"><div><QrCode className="mx-auto text-[#8090a3]" size={38}/><h1 className="mt-3 text-xl font-bold">Bienvenue dans l’administration</h1><p className="mt-2 text-sm text-[#718198]">Créez un événement pour obtenir un lien et un QR code uniques.</p><button className="btn mt-5" onClick={() => setShowCreate(true)}><Plus size={16}/> Créer un événement</button></div></div>}
      </section>
    </div>
  </main>;
}
