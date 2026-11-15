import { QRCodeSVG } from "qrcode.react";
import { getFeaturedEvent } from "@/lib/events";
import { Brand, WaveDecoration } from "@/components/brand";

export const dynamic = "force-dynamic";

export default async function Home() {
  const event = await getFeaturedEvent().catch((error) => {
    console.error("Chargement de l’événement impossible:", error instanceof Error ? error.message : "erreur inconnue");
    return null;
  });
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim().replace(/\/+$/, "");
  const questionUrl = siteUrl
    ? `${siteUrl}/user${event ? `?code=${encodeURIComponent(event.code)}` : ""}`
    : "";

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
        <div className="scan-copy"><span className="scan-icon" aria-hidden="true">↗</span><div><h2>Scannez pour poser votre question</h2><p>Ouvrez l’appareil photo de votre téléphone et pointez-le vers le QR code.</p>{!event && <p>Le QR ouvre le formulaire public. Créez ou sélectionnez un événement dans l’administration pour recevoir les questions.</p>}<p className="projection-url">{questionUrl}</p></div></div>
      </div> : <div role="status" className="projection-warning"><span className="projection-warning-icon" aria-hidden="true">QR</span><div><h2>Le QR code n’est pas disponible</h2><p>Configurez NEXT_PUBLIC_SITE_URL avec l’adresse publique HTTPS du site.</p></div></div>}
    </section>
    <div className="projection-note">Vos questions feront vivre la discussion.</div>
    <WaveDecoration/>
  </main>;
}
