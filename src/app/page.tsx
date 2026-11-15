import Link from "next/link";

export default function Home() {
  return <main className="min-h-screen grid place-items-center p-6"><div className="panel max-w-xl p-10 text-center">
    <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-[#eaf0fa] text-2xl font-black text-[#2256a4]">CS</div>
    <p className="text-xs font-bold uppercase tracking-[.22em] text-[#687b93]">ESITH · Casablanca</p>
    <h1 className="mt-3 text-3xl font-bold">Comité Social</h1>
    <p className="mt-3 text-[#65758a]">Posez vos questions en toute simplicité pendant nos conférences.</p>
    <Link className="btn mt-7" href="/admin">Accéder à l’administration</Link>
  </div></main>;
}
