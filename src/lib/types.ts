export type EventRecord = {
  id: string; title: string; speaker: string; event_date: string | null; code: string;
  is_open: boolean; premoderation: boolean; max_per_device: number; created_at: string;
};

export type QuestionRecord = {
  id: string; event_id: string; question: string; first_name: string | null;
  is_anonymous: boolean; status: "pending" | "approved" | "hidden";
  is_pinned: boolean; is_answered: boolean; votes: number; created_at: string;
};
