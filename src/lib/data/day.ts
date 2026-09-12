import "server-only";
import { createClient } from "@/lib/supabase/server";
import type {
  JournalEntry,
  Todo,
  KeyMoment,
  Photo,
  Transaction,
} from "@/lib/types";

export interface PhotoWithUrl extends Photo {
  url: string | null;
}

export interface DayData {
  entry: JournalEntry | null;
  todos: Todo[];
  moments: KeyMoment[];
  photos: PhotoWithUrl[];
  transactions: Transaction[];
}

/** Fetch everything for a single day for the current user. */
export async function getDayData(date: string): Promise<DayData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { entry: null, todos: [], moments: [], photos: [], transactions: [] };
  }

  const [entryRes, todosRes, momentsRes, photosRes, txRes] = await Promise.all([
    supabase.from("journal_entries").select("*").eq("entry_date", date).maybeSingle(),
    supabase.from("todos").select("*").eq("entry_date", date).order("created_at", { ascending: true }),
    supabase.from("key_moments").select("*").eq("entry_date", date).order("created_at", { ascending: false }),
    supabase.from("photos").select("*").eq("entry_date", date).order("created_at", { ascending: true }),
    supabase.from("transactions").select("*").eq("entry_date", date).order("created_at", { ascending: false }),
  ]);

  const photos = (photosRes.data ?? []) as Photo[];
  let withUrls: PhotoWithUrl[] = photos.map((p) => ({ ...p, url: null }));
  if (photos.length) {
    const { data: signed } = await supabase.storage
      .from("photos")
      .createSignedUrls(photos.map((p) => p.storage_path), 60 * 60);
    if (signed) {
      withUrls = photos.map((p, i) => ({ ...p, url: signed[i]?.signedUrl ?? null }));
    }
  }

  return {
    entry: (entryRes.data as JournalEntry) ?? null,
    todos: (todosRes.data as Todo[]) ?? [],
    moments: (momentsRes.data as KeyMoment[]) ?? [],
    photos: withUrls,
    transactions: (txRes.data as Transaction[]) ?? [],
  };
}
