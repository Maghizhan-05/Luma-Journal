import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { KeyMoment } from "@/lib/types";
import type { TagKey } from "@/lib/constants";

export interface MomentSearch {
  q?: string;
  tags?: TagKey[];
  from?: string;
  to?: string;
}

/**
 * Search the current user's key moments. Tag/date filters run in SQL
 * (parameterized, RLS-scoped); free-text is matched in JS to avoid building
 * PostgREST filter strings from user input.
 */
export async function searchMoments(opts: MomentSearch): Promise<KeyMoment[]> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  let query = supabase
    .from("key_moments")
    .select("*")
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(500);

  if (opts.tags && opts.tags.length) query = query.overlaps("tags", opts.tags);
  if (opts.from && /^\d{4}-\d{2}-\d{2}$/.test(opts.from)) query = query.gte("entry_date", opts.from);
  if (opts.to && /^\d{4}-\d{2}-\d{2}$/.test(opts.to)) query = query.lte("entry_date", opts.to);

  const { data } = await query;
  let rows = (data as KeyMoment[]) ?? [];

  const text = opts.q?.trim().toLowerCase();
  if (text) {
    rows = rows.filter(
      (m) =>
        m.title.toLowerCase().includes(text) ||
        (m.description ?? "").toLowerCase().includes(text),
    );
  }
  return rows;
}
