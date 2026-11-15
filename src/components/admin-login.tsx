"use client";

import { useState } from "react";
import { LockKeyhole } from "lucide-react";

export function AdminLogin() {
  const [password, setPassword] = useState(""); const [error, setError] = useState(""); const [busy, setBusy] = useState(false);
  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const res = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password }) });
    setBusy(false);
    if (res.ok) window.location.reload(); else setError("Mot de passe incorrect.");
  }
  return <main className="grid min-h-screen place-items-center p-5"><form onSubmit={login} className="panel w-full max-w-sm p-8">
    <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-[#e8eef9] text-[#2256a4]"><LockKeyhole/></div>
    <h1 className="mt-5 text-center text-2xl font-bold">Administration</h1><p className="mt-2 text-center text-sm text-[#6a7a8f]">Comité Social · ESITH</p>
    <label className="label mt-7" htmlFor="password">Mot de passe</label><input className="field" type="password" id="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)}/>
    {error && <p role="alert" className="mt-3 text-sm text-red-700">{error}</p>}<button className="btn mt-5 w-full" disabled={busy}>{busy ? "Vérification…" : "Se connecter"}</button>
  </form></main>;
}
