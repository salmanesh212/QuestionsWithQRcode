"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { Brand } from "@/components/brand";

export function AdminLogin() {
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
      const result = await res.json().catch(() => ({}));
      if (res.ok) window.location.reload(); else setError(result.error ?? "Mot de passe incorrect.");
    } catch { setError("La connexion est indisponible. Réessayez."); }
    finally { setBusy(false); }
  }
  return <main className="login-page"><form onSubmit={login} className="panel login-card">
    <Brand compact/><div className="login-lock"><LockKeyhole/></div>
    <h1 className="mt-5 text-center text-2xl font-bold">Administration</h1><p className="mt-2 text-center text-sm text-[#6a7a8f]">Comité Social · ESITH</p>
    <label className="label mt-7" htmlFor="password">Mot de passe</label><input className="field" type="password" id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
    {error && <p role="alert" className="form-error">{error}</p>}<button className="btn submit-question mt-5" disabled={busy}>{busy ? "Vérification…" : "Se connecter"}</button>
  </form></main>;
}
