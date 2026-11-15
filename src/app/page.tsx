import { QRCodeSVG } from "qrcode.react";
import { getFeaturedEvent } from "@/lib/events";
import { Brand, WaveDecoration } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getFeaturedEvent();
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const questionUrl = event && siteUrl ? `${siteUrl}/question?code=${encodeURIComponent(event.code)}` : "";
  const setupMessage = !event
    ? { title: "Aucune conférence n’est programmée", detail: "Un événement doit être enregistré avant la projection. Si le QR reste absent ensuite, vérifiez l’adresse publique du site." }
    : { title: "Le QR code n’est pas disponible", detail: "L’adresse publique du site manque. Demandez à l’équipe technique de la configurer avant la projection." };

  return <main className="projection-page">
    <header className="projection-header"><Brand showArabic={false}/><div className="projection-mark" lang="ar" dir="rtl">اللجنة الاجتماعية</div></header>
    <section className="projection-content">
      <div className="projection-intro">
        <p className="eyebrow">Conférence · Comité Social ESITH</p>
        <h1>{event?.title ?? "Comité Social ESITH"}</h1>
        {event && (event.speaker || event.event_date) && <p className="projection-speaker">{event.speaker}{event.speaker && event.event_date ? " · " : ""}{event.event_date ? new Date(`${event.event_date}T12:00:00`).toLocaleDateString("fr-FR") : ""}</p>}
      </div>
      {questionUrl ? <div className="projection-scan">
        <div className="qr-frame"><div className="qr-surface"><QRCodeSVG value={questionUrl} size={320} level="H" includeMargin fgColor="#0A3F5F" aria-label="Code QR pour poser une question"/></div><span className="qr-corner qr-corner-a"/><span className="qr-corner qr-corner-b"/><span className="qr-corner qr-corner-c"/><span className="qr-corner qr-corner-d"/></div>
        <div className="scan-copy"><span className="scan-icon" aria-hidden="true">↗</span><div><h2>Scannez pour poser votre question</h2><p>Ouvrez l’appareil photo de votre téléphone et pointez-le vers le QR code.</p><p className="projection-url">{questionUrl}</p></div></div>
      </div> : <div role="status" className="projection-warning"><span className="projection-warning-icon" aria-hidden="true">QR</span><div><h2>{setupMessage.title}</h2><p>{setupMessage.detail}</p></div></div>}
    </section>
    <div className="projection-note">Vos questions feront vivre la discussion.</div>
    <WaveDecoration/>
  </main>;
}
