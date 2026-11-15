import { supabaseAdmin } from "@/lib/supabase";
import type { EventRecord } from "@/lib/types";

export async function getFeaturedEvent() {
  const supabase = supabaseAdmin();
  const { data: setting, error: settingError } = await supabase.from("settings").select("value").eq("key", "featured_event_id").maybeSingle();
  if (settingError) throw new Error("Impossible de charger la configuration des événements.");
  const featuredId = typeof setting?.value === "string" ? setting.value : null;
  if (featuredId) {
    const { data, error } = await supabase.from("events").select("*").eq("id", featuredId).maybeSingle();
    if (error) throw new Error("Impossible de charger l’événement sélectionné.");
    if (data) return data as EventRecord;
  }
  const { data, error } = await supabase.from("events").select("*").order("created_at", { ascending: false }).limit(1).maybeSingle();
  if (error) throw new Error("Impossible de charger les événements.");
  if (data) return data as EventRecord;

  // Un premier événement permet au QR /user d'être utilisable dès l'installation.
  const initialEvent = { title: "Comité Social ESITH", speaker: "", code: "comite-social-esith", is_open: true };
  const { data: created, error: createError } = await supabase.from("events").insert(initialEvent).select("*").single();
  if (!createError && created) return created as EventRecord;

  // Une requête concurrente peut avoir créé le même événement entre-temps.
  const { data: concurrentEvent, error: retryError } = await supabase.from("events").select("*").eq("code", initialEvent.code).maybeSingle();
  if (!retryError && concurrentEvent) return concurrentEvent as EventRecord;
  throw new Error("Impossible de créer l’événement initial.");
}
