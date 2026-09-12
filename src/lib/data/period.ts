import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface DaySummary {
  date: string;
  hasJournal: boolean;
  mood: number | null;
  moments: number;
  photos: number;
  spent: number;
  received: number;
  currency: string | null;
}

/** Activity level 0-4 for heatmaps: journal + moments + photos. */
export function activityLevel(s: DaySummary | undefined): number {
  if (!s) return 0;
  let n = 0;
  if (s.hasJournal) n += 2;
  n += Math.min(s.moments, 2);
  n += Math.min(s.photos, 2);
  return Math.min(4, n);
}

/**
 * Per-day activity summaries for [start, end] (inclusive, YYYY-MM-DD) for the
 * current user. One query per table, aggregated by date.
 */
export async function getDaySummaries(
  start: string,
  end: string,
): Promise<Map<string, DaySummary>> {
  const map = new Map<string, DaySummary>();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return map;

  const ensure = (date: string): DaySummary => {
    let s = map.get(date);
    if (!s) {
      s = { date, hasJournal: false, mood: null, moments: 0, photos: 0, spent: 0, received: 0, currency: null };
      map.set(date, s);
    }
    return s;
  };

  const [entries, moments, photos, tx] = await Promise.all([
    supabase.from("journal_entries").select("entry_date, body, mood").gte("entry_date", start).lte("entry_date", end),
    supabase.from("key_moments").select("entry_date").gte("entry_date", start).lte("entry_date", end),
    supabase.from("photos").select("entry_date").gte("entry_date", start).lte("entry_date", end),
    supabase.from("transactions").select("entry_date, direction, amount, currency").gte("entry_date", start).lte("entry_date", end),
  ]);

  for (const e of entries.data ?? []) {
    const s = ensure(e.entry_date as string);
    s.hasJournal = Boolean((e.body as string)?.trim()) || e.mood != null;
    s.mood = (e.mood as number) ?? null;
  }
  for (const m of moments.data ?? []) ensure(m.entry_date as string).moments += 1;
  for (const p of photos.data ?? []) ensure(p.entry_date as string).photos += 1;
  for (const t of tx.data ?? []) {
    const s = ensure(t.entry_date as string);
    if (t.direction === "spent") s.spent += Number(t.amount);
    else s.received += Number(t.amount);
    s.currency = s.currency ?? (t.currency as string);
  }

  return map;
}
