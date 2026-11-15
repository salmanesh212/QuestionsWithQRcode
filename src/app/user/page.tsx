import type { Metadata } from "next";
import { QuestionEntry } from "@/components/question-entry";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Poser une question — Comité Social ESITH", robots: { index: false, follow: false, noarchive: true } };

export default async function UserPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return <QuestionEntry searchParams={searchParams}/>;
}
