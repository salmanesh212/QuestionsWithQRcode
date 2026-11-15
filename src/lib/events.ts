import { supabaseAdmin } from "@/lib/supabase";
import type { EventRecord } from "@/lib/types";

export async function getFeaturedEvent() {
  const supabase = supabaseAdmin();
  const { data: setting } = await supabase.from("settings").select("value").eq("key", "featured_event_id").maybeSingle();
  const featuredId = typeof setting?.value === "string" ? setting.value : null;
  if (featuredId) {
    const { data } = await supabase.from("events").select("*").eq("id", featuredId).maybeSingle();
    if (data) return data as EventRecord;
  }
  const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
  return data as EventRecord | null;
}
