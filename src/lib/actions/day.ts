"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { TAGS } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

const TAG_KEYS = TAGS.map((t) => t.key) as [string, ...string[]];
const dateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/);

async function userOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

/* ---------------- Journal ---------------- */

export async function saveJournal(
  date: string,
  body: string,
  mood: number | null,
): Promise<Result> {
  const parse = dateSchema.safeParse(date);
  if (!parse.success) return { ok: false, error: "Invalid date" };
  const { supabase, user } = await userOrThrow();

  const { error } = await supabase
    .from("journal_entries")
    .upsert(
      { user_id: user.id, entry_date: date, body, mood },
      { onConflict: "user_id,entry_date" },
    );
  if (error) return { ok: false, error: error.message };
  // No revalidate: the editor holds its own state, so avoid refetching the
  // whole day (and re-signing photo URLs) on every debounced autosave.
  return { ok: true };
}

/* ---------------- Todos ---------------- */

export async function addTodo(date: string, text: string): Promise<Result> {
  const clean = text.trim();
  if (!clean) return { ok: false, error: "Empty todo" };
  const { supabase, user } = await userOrThrow();
  const { error } = await supabase
    .from("todos")
    .insert({ user_id: user.id, entry_date: date, text: clean });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function toggleTodo(id: string, isDone: boolean): Promise<Result> {
  const { supabase } = await userOrThrow();
  const { error } = await supabase.from("todos").update({ is_done: isDone }).eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteTodo(id: string): Promise<Result> {
  const { supabase } = await userOrThrow();
  const { error } = await supabase.from("todos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

/* ---------------- Key Moments ---------------- */

const momentSchema = z.object({
  date: dateSchema,
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  tags: z.array(z.enum(TAG_KEYS)).max(6),
});

export async function addMoment(input: {
  date: string;
  title: string;
  description?: string;
  tags: string[];
}): Promise<Result> {
  const parsed = momentSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please add a title." };
  const { supabase, user } = await userOrThrow();
  const { date, title, description, tags } = parsed.data;
  const { error } = await supabase.from("key_moments").insert({
    user_id: user.id,
    entry_date: date,
    title,
    description: description || null,
    tags,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteMoment(id: string): Promise<Result> {
  const { supabase } = await userOrThrow();
  const { error } = await supabase.from("key_moments").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

/* ---------------- Photos ---------------- */

const photoSchema = z.object({
  date: dateSchema,
  storage_path: z.string().min(1),
  alt_text: z.string().trim().min(1).max(300),
  caption: z.string().trim().max(500).optional(),
  width: z.number().int().positive().optional(),
  height: z.number().int().positive().optional(),
  size_bytes: z.number().int().positive().optional(),
});

export async function addPhoto(input: {
  date: string;
  storage_path: string;
  alt_text: string;
  caption?: string;
  width?: number;
  height?: number;
  size_bytes?: number;
}): Promise<Result> {
  const parsed = photoSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Alt text is required." };
  const { supabase, user } = await userOrThrow();
  const p = parsed.data;

  // Ensure the uploaded path is inside the user's own folder.
  if (!p.storage_path.startsWith(`${user.id}/`)) {
    return { ok: false, error: "Invalid storage path." };
  }

  const { error } = await supabase.from("photos").insert({
    user_id: user.id,
    entry_date: p.date,
    storage_path: p.storage_path,
    alt_text: p.alt_text,
    caption: p.caption || null,
    width: p.width ?? null,
    height: p.height ?? null,
    size_bytes: p.size_bytes ?? null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}

export async function deletePhoto(id: string, storagePath: string): Promise<Result> {
  const { supabase } = await userOrThrow();
  await supabase.storage.from("photos").remove([storagePath]);
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}
