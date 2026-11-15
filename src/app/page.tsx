import { QRCodeSVG } from "qrcode.react";
import { getFeaturedEvent } from "@/lib/events";
import { Brand, WaveDecoration } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getFeaturedEvent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const questionUrl = event && siteUrl ? `${siteUrl}/question?code=${encodeURIComponent(event.code)}` : "";

  return <main className="projection-page">
    <header className="projection-header"><Brand/><div className="projection-mark" lang="ar" dir="rtl">اللجنة الاجتماعية</div></header>
    <section className="projection-content">
      <div className="projection-intro">
        <p className="eyebrow">Conférence · Comité Social ESITH</p>
        <h1>{event?.title ?? "Conférence du Comité Social"}</h1>
        <p className="projection-speaker">{event?.speaker || "Un espace de dialogue et de partage"}{event?.event_date ? ` · ${new Date(`${event.event_date}T12:00:00`).toLocaleDateString("fr-FR")}` : ""}</p>
      </div>
      {questionUrl ? <div className="projection-scan">
        <div className="qr-frame"><div className="qr-surface"><QRCodeSVG value={questionUrl} size={320} level="H" includeMargin fgColor="#0A3F5F" aria-label="Code QR pour poser une question"/></div><span className="qr-corner qr-corner-a"/><span className="qr-corner qr-corner-b"/><span className="qr-corner qr-corner-c"/><span className="qr-corner qr-corner-d"/></div>
        <div className="scan-copy"><span className="scan-icon" aria-hidden="true">↗</span><div><h2>Scannez pour poser votre question</h2><p>Ouvrez l’appareil photo de votre téléphone et pointez-le vers le QR code.</p><p className="projection-url">{questionUrl}</p></div></div>
      </div> : <p role="status" className="projection-warning">Configuration de projection manquante. Vérifiez l’événement sélectionné et la variable NEXT_PUBLIC_SITE_URL.</p>}
    </section>
    <div className="projection-note">Vos questions feront vivre la discussion.</div>
    <WaveDecoration/>
  </main>;
}
