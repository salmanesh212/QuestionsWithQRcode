import { QRCodeSVG } from "qrcode.react";
import { getFeaturedEvent } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getFeaturedEvent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const questionUrl = event && siteUrl ? `${siteUrl}/question?code=${encodeURIComponent(event.code)}` : "";

  return <main className="flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#101924] px-5 py-10 text-center text-white sm:px-10">
    <div aria-hidden="true" className="pointer-events-none absolute -right-48 -top-48 h-[34rem] w-[34rem] rounded-full bg-[#2256a4]/20 blur-3xl"/>
    <div aria-hidden="true" className="pointer-events-none absolute -bottom-64 -left-32 h-[36rem] w-[36rem] rounded-full bg-[#e7a936]/10 blur-3xl"/>
    <header className="relative mb-7 sm:mb-9">
      <p className="text-xs font-bold uppercase tracking-[.3em] text-[#edb64e]">Comité Social · ESITH Casablanca</p>
      <h1 className="mt-4 max-w-5xl text-3xl font-bold leading-tight sm:text-5xl">{event?.title ?? "Conférence du Comité Social"}</h1>
      {event?.speaker && <p className="mt-3 text-lg text-white/65 sm:text-xl">{event.speaker}</p>}
    </header>
    {questionUrl ? <>
      <p className="relative mb-5 text-xl font-semibold sm:text-2xl">Scannez pour poser votre question</p>
      <div className="relative rounded-3xl bg-white p-4 shadow-2xl shadow-black/35 sm:p-6">
        <QRCodeSVG value={questionUrl} size={340} level="H" includeMargin aria-label="Code QR pour poser une question"/>
      </div>
      <p className="relative mt-5 max-w-full break-all rounded-lg bg-white/10 px-4 py-2 font-mono text-sm text-white/80 sm:text-base">{questionUrl}</p>
    </> : <p className="relative max-w-xl rounded-2xl border border-amber-300/30 bg-amber-100/10 px-6 py-5 text-amber-100">Configuration de projection manquante.</p>}
  </main>;
}
