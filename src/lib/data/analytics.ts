import "server-only";
import { createClient } from "@/lib/supabase/server";
import { monthRange } from "@/lib/date";
import type { TagKey } from "@/lib/constants";

export interface Analytics {
  month: string;
  primaryCurrency: string;
  spent: number;
  received: number;
  spendByCategory: { category: string; amount: number }[];
  moodCounts: Record<number, number>; // 1..5 → count
  tagCounts: { tag: TagKey; count: number }[];
  momentTotal: number;
  journaledDays: number;
}

export async function getAnalytics(month: string): Promise<Analytics> {
  const empty: Analytics = {
    month, primaryCurrency: "INR", spent: 0, received: 0,
    spendByCategory: [], moodCounts: {}, tagCounts: [], momentTotal: 0, journaledDays: 0,
  };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return empty;

  const { start, end } = monthRange(month);
  const [txRes, momentsRes, entriesRes] = await Promise.all([
    supabase.from("transactions").select("direction, amount, currency, category").gte("entry_date", start).lte("entry_date", end),
    supabase.from("key_moments").select("tags").gte("entry_date", start).lte("entry_date", end),
    supabase.from("journal_entries").select("mood, body").gte("entry_date", start).lte("entry_date", end),
  ]);

  const tx = txRes.data ?? [];
  // Primary currency = most-used among transactions.
  const curCount = new Map<string, number>();
  for (const t of tx) curCount.set(t.currency as string, (curCount.get(t.currency as string) ?? 0) + 1);
  const primaryCurrency = [...curCount.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] ?? "INR";

  let spent = 0, received = 0;
  const catMap = new Map<string, number>();
  for (const t of tx) {
    if (t.currency !== primaryCurrency) continue;
    if (t.direction === "spent") {
      spent += Number(t.amount);
      catMap.set(t.category as string, (catMap.get(t.category as string) ?? 0) + Number(t.amount));
    } else received += Number(t.amount);
  }
  const spendByCategory = [...catMap.entries()].map(([category, amount]) => ({ category, amount })).sort((a, b) => b.amount - a.amount);

  const tagMap = new Map<string, number>();
  let momentTotal = 0;
  for (const m of momentsRes.data ?? []) {
    momentTotal += 1;
    for (const tag of (m.tags as string[]) ?? []) tagMap.set(tag, (tagMap.get(tag) ?? 0) + 1);
  }
  const tagCounts = [...tagMap.entries()].map(([tag, count]) => ({ tag: tag as TagKey, count })).sort((a, b) => b.count - a.count);

  const moodCounts: Record<number, number> = {};
  let journaledDays = 0;
  for (const e of entriesRes.data ?? []) {
    if ((e.body as string)?.trim() || e.mood != null) journaledDays += 1;
    if (e.mood != null) moodCounts[e.mood as number] = (moodCounts[e.mood as number] ?? 0) + 1;
  }

  return { month, primaryCurrency, spent, received, spendByCategory, moodCounts, tagCounts, momentTotal, journaledDays };
}
