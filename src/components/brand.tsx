import Image from "next/image";

export function Brand({ compact = false, light = false, showArabic = true }: { compact?: boolean; light?: boolean; showArabic?: boolean }) {
  return (
    <div className={`brand-lockup${compact ? " brand-lockup-compact" : ""}${light ? " brand-lockup-light" : ""}`}>
      <Image className="brand-logo" src="/logo.png" width={88} height={88} alt="" priority />
      <div className="brand-copy">
        <span className="brand-name">Comité Social <span>ESITH</span></span>
        {showArabic && <span lang="ar" dir="rtl" className="brand-arabic">اللجنة الاجتماعية</span>}
      </div>
    </div>
  );
}

export function WaveDecoration() {
  return (
    <svg className="wave-decoration" viewBox="0 0 1440 180" preserveAspectRatio="none" aria-hidden="true">
      <path d="M0 72c210 100 410 56 650 16S1090 32 1440 94v86H0z" fill="var(--blue)" />
      <path d="M0 126c280-72 490-32 710 8s460 30 730-44v90H0z" fill="var(--green)" />
    </svg>
  );
}
