import { NextResponse } from "next/server";
import { adminCookieName, makeSession, validPassword } from "@/lib/auth";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body.password !== "string" || !validPassword(body.password)) {
    return NextResponse.json({ error: "Mot de passe incorrect." }, { status: 401 });
  }
  const response = NextResponse.json({ ok: true });
  response.cookies.set(adminCookieName, makeSession(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "strict", path: "/", maxAge: 60 * 60 * 12 });
  return response;
}
