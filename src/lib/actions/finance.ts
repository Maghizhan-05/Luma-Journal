"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES, CATEGORIES } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

const CURRENCY_CODES = CURRENCIES.map((c) => c.code) as [string, ...string[]];
const CATEGORY_KEYS = CATEGORIES.map((c) => c.key) as [string, ...string[]];

const txSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  direction: z.enum(["spent", "received"]),
  amount: z.number().positive().max(1_000_000_000),
  currency: z.enum(CURRENCY_CODES),
  category: z.enum(CATEGORY_KEYS),
  note: z.string().trim().max(300).optional(),
});

async function userOrThrow() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not authenticated");
  return { supabase, user };
}

export async function addTransaction(input: {
  date: string;
  direction: "spent" | "received";
  amount: number;
  currency: string;
  category: string;
  note?: string;
}): Promise<Result> {
  const parsed = txSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please enter a valid amount." };
  const { supabase, user } = await userOrThrow();
  const t = parsed.data;

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    entry_date: t.date,
    direction: t.direction,
    amount: t.amount,
    currency: t.currency,
    category: t.category,
    note: t.note || null,
  });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/finance");
  revalidatePath("/app");
  return { ok: true };
}

export async function deleteTransaction(id: string): Promise<Result> {
  const { supabase } = await userOrThrow();
  const { error } = await supabase.from("transactions").delete().eq("id", id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/finance");
  revalidatePath("/app");
  return { ok: true };
}
