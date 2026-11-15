import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = { title: "Comité Social ESITH — Questions en direct", description: "Questions et échanges en direct pour les événements du Comité Social de l'ESITH." };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body>{children}</body></html>;
}
