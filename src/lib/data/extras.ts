import "server-only";
import { createClient } from "@/lib/supabase/server";
import { addDay } from "@/lib/date";

/** Deterministic prompt-of-the-day from the seeded prompts pool. */
export async function getDailyPrompt(date: string): Promise<string | null> {
  const supabase = await createClient();
  const { data } = await supabase.from("prompts").select("text").eq("is_active", true);
  if (!data || data.length === 0) return null;
  let h = 0;
  for (const ch of date) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return data[h % data.length].text as string;
}

/** Current consecutive-day journaling streak ending today (0 if none). */
export async function getStreak(today: string): Promise<number> {
  const supabase = await createClient();
  const from = addDay(today, -180);
  const { data } = await supabase
    .from("journal_entries")
    .select("entry_date, body, mood")
    .gte("entry_date", from)
    .lte("entry_date", today);
  const done = new Set(
    (data ?? [])
      .filter((e) => (e.body as string)?.trim() || e.mood != null)
      .map((e) => e.entry_date as string),
  );
  let streak = 0;
  for (let d = today; done.has(d); d = addDay(d, -1)) streak += 1;
  return streak;
}

export interface Memory {
  date: string;
  label: string;
  title: string;
  snippet: string | null;
}

/** "On this day" — journal entries / first moment from the same date in past years. */
export async function getOnThisDay(date: string): Promise<Memory[]> {
  const supabase = await createClient();
  const year = Number(date.slice(0, 4));
  const mmdd = date.slice(5); // MM-DD
  const candidates = [1, 2, 3].map((n) => `${year - n}-${mmdd}`);

  const [entries, moments] = await Promise.all([
    supabase.from("journal_entries").select("entry_date, body").in("entry_date", candidates),
    supabase.from("key_moments").select("entry_date, title").in("entry_date", candidates),
  ]);

  const out: Memory[] = [];
  for (const c of candidates) {
    const yearsAgo = year - Number(c.slice(0, 4));
    const label = `${yearsAgo} year${yearsAgo > 1 ? "s" : ""} ago`;
    const entry = (entries.data ?? []).find((e) => e.entry_date === c && (e.body as string)?.trim());
    if (entry) {
      const body = entry.body as string;
      out.push({ date: c, label, title: "Journal", snippet: body.length > 140 ? body.slice(0, 140) + "…" : body });
      continue;
    }
    const moment = (moments.data ?? []).find((m) => m.entry_date === c);
    if (moment) out.push({ date: c, label, title: moment.title as string, snippet: null });
  }
  return out;
}
