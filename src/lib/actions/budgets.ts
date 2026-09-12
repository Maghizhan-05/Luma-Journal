"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES, CATEGORIES } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

const schema = z.object({
  category: z.enum(CATEGORIES.map((c) => c.key) as [string, ...string[]]),
  monthly_limit: z.number().nonnegative().max(1_000_000_000),
  currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
});

export async function setBudget(input: { category: string; monthly_limit: number; currency: string }): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Invalid budget" };
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("budgets")
    .upsert({ user_id: user.id, ...parsed.data }, { onConflict: "user_id,category" });
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/analytics");
  return { ok: true };
}

export async function deleteBudget(category: string): Promise<Result> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };
  const { error } = await supabase.from("budgets").delete().eq("category", category);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app/analytics");
  return { ok: true };
}
