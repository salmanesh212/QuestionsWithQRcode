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
  const { data: attempt, error } = await supabaseAdmin().rpc("record_admin_login_attempt", {
    p_ip_hash: hashValue(ip), p_password_valid: validPassword(body.password),
  });
  if (error) return NextResponse.json({ error: "Le contrôle de connexion est indisponible." }, { status: 503 });
  if (attempt === -1) return NextResponse.json({ error: "Trop de tentatives. Réessayez dans 15 minutes." }, { status: 429 });
  if (attempt !== 1) return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, makeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
