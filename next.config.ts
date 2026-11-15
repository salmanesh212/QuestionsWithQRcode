import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: false,
  outputFileTracingRoot: process.cwd(),
  // Domaine public fourni pour que le QR reste visible sur le déploiement Vercel
  // même si la variable n’a pas encore été ajoutée au projet.
  env: { NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "https://scan-for-questions.vercel.app" },
};
export default nextConfig;
