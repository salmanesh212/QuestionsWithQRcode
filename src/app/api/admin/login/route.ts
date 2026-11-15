import { NextResponse } from "next/server";
import { headers } from "next/headers";
import { adminCookieName, makeSession, validPassword } from "@/lib/auth";
import { supabaseAdmin } from "@/lib/supabase";
import { hashValue } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string") {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }
  const requestHeaders = await headers();
  const ip = (requestHeaders.get("x-forwarded-for") ?? requestHeaders.get("x-real-ip") ?? "inconnu").split(",")[0].trim();
  let attempt: number | null = null;
  try {
    const result = await supabaseAdmin().rpc("record_admin_login_attempt", {
      p_ip_hash: hashValue(ip), p_password_valid: validPassword(body.password),
    });
    if (result.error) {
      // PGRST202 means the database has not received the latest schema/function.
      const message = result.error.code === "PGRST202"
        ? "La base Supabase n’a pas été mise à jour. Réexécutez supabase/schema.sql dans SQL Editor."
        : "Supabase est inaccessible. Vérifiez les variables de connexion serveur puis réessayez.";
      console.error("Échec du contrôle de connexion admin:", result.error.code || result.error.message);
      return NextResponse.json({ error: message }, { status: 503 });
    }
    attempt = result.data;
  } catch (error) {
    console.error("Échec du contrôle de connexion admin:", error instanceof Error ? error.message : "erreur inconnue");
    return NextResponse.json({ error: "Supabase est inaccessible. Vérifiez les variables de connexion serveur puis réessayez." }, { status: 503 });
  }
  if (attempt === -1) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  if (attempt !== 1) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, makeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
