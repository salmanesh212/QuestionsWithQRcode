import { QuestionEntry } from "@/components/question-entry";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "إرسال سؤال — Comité Social ESITH", robots: { index: false, follow: false, noarchive: true } };

export const dynamic = "force-dynamic";

export default async function QuestionPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  return <QuestionEntry searchParams={searchParams}/>;
}
