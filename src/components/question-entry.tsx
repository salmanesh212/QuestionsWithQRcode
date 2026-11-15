import { getFeaturedEvent } from "@/lib/events";
import { supabaseAdmin } from "@/lib/supabase";
import { ParticipantForm } from "@/components/participant-form";
import { Brand } from "@/components/brand";

export async function QuestionEntry({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code } = await searchParams;
  let event;
  try {
    if (code) {
      const { data, error } = await supabaseAdmin().from("events").select("id,title,speaker,event_date,code,is_open").eq("code", code).maybeSingle();
      if (error) throw error;
      event = data;
    } else {
      event = await getFeaturedEvent();
    }
  } catch {
    return <main className="question-page" lang="ar" dir="rtl"><div className="question-shell"><header className="question-header"><Brand compact/><p className="eyebrow">أسئلة مباشرة</p><h1>الخدمة غير متاحة مؤقتًا</h1></header><section className="panel question-state"><p>تعذّر الاتصال بقاعدة البيانات. لا يمكن حفظ الأسئلة حاليًا.</p></section></div></main>;
  }
  if (!event) return <main className="question-page" lang="ar" dir="rtl"><div className="question-shell"><header className="question-header"><Brand compact/><p className="eyebrow">أسئلة مباشرة</p><h1>لا توجد فعالية متاحة</h1></header><section className="panel question-state"><p>لا توجد فعالية يمكن إرسال الأسئلة إليها حاليًا.</p></section></div></main>;
  return <main className="question-page" lang="ar" dir="rtl"><div className="question-shell">
    <header className="question-header"><Brand compact/><p className="eyebrow">أسئلة مباشرة</p>
      <h1 dir="auto">{event.title}</h1>{event.speaker && <p className="event-speaker" dir="auto">{event.speaker}{event.event_date ? ` · ${new Date(`${event.event_date}T12:00:00`).toLocaleDateString("ar")}` : ""}</p>}
    </header>
    <ParticipantForm code={event.code} isOpen={event.is_open}/>
    <footer className="question-footer">لا حاجة إلى تسجيل الدخول · اللجنة الاجتماعية ESITH<span className="question-signature" lang="en" dir="ltr">Done by Salmane</span></footer>
  </div></main>;
}
