import { randomUUID, createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

function sign(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant.");
  return createHmac("sha256", secret).update(value).digest("hex");
}
export async function GET() {
  const jar = await cookies();
  const response = NextResponse.json({ ok: true });
  const started = String(Date.now());
  if (!jar.get("cs_device")) response.cookies.set("cs_device", randomUUID(), { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 365 });
  response.cookies.set("cs_started", `${started}.${sign(started)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 60 * 60 });
  return response;
}
