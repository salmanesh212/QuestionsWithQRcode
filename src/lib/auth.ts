import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "cs_admin";
function signature(value: string) {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET manquant.");
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function validPassword(password: string) {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected || password.length !== expected.length) return false;
  return timingSafeEqual(Buffer.from(password), Buffer.from(expected));
}

export function makeSession() {
  const value = `${Date.now() + 1000 * 60 * 60 * 12}`;
  return `${value}.${signature(value)}`;
}

export function validSession(value?: string) {
  if (!value) return false;
  const [expiry, provided] = value.split(".");
  if (!expiry || !provided || Number(expiry) < Date.now()) return false;
  const expected = signature(expiry);
  const a = Buffer.from(provided);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function isAdmin() {
  const jar = await cookies();
  return validSession(jar.get(COOKIE)?.value);
}

export const adminCookieName = COOKIE;
