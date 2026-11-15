import type { Metadata } from "next";
import { Cairo, Inter, Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-poppins", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const cairo = Cairo({ subsets: ["arabic"], weight: ["400", "600", "700"], variable: "--font-arabic", display: "swap" });

export const metadata: Metadata = {
  title: "Comité Social ESITH — Questions en direct",
  description: "Questions et échanges en direct pour les événements du Comité Social de l'ESITH.",
  icons: { icon: "/logo.png", apple: "/logo.png" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="fr"><body className={`${poppins.variable} ${inter.variable} ${cairo.variable}`}>{children}</body></html>;
}
