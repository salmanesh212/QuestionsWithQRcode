import { createHash } from "node:crypto";

export function slugCode(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 45);
}

export function hashValue(value: string) {
  const salt = process.env.SESSION_SECRET ?? "configuration-a-completer";
  return createHash("sha256").update(`${salt}:${value}`).digest("hex");
}

export function cleanQuestion(value: string) {
  return value.replace(/<[^>]*>/g, " ").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

export const inappropriateWords = ["connard", "pute", "enculé", "encule", "niquer", "nique ta mère", "fdp"];
