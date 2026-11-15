import { redirect } from "next/navigation";

export default async function LegacyEventLink({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  redirect(`/question?code=${encodeURIComponent(code)}`);
}
