"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { CURRENCIES } from "@/lib/constants";

type Result = { ok: boolean; error?: string };

const schema = z.object({
  display_name: z.string().trim().max(60).optional(),
  timezone: z.string().trim().max(64),
  default_currency: z.enum(CURRENCIES.map((c) => c.code) as [string, ...string[]]),
  reminders_daily: z.boolean(),
  reminders_weekly: z.boolean(),
});

export async function updateProfile(input: {
  display_name?: string;
  timezone: string;
  default_currency: string;
  reminders_daily: boolean;
  reminders_weekly: boolean;
}): Promise<Result> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false, error: "Please check your settings." };

  // Guard: timezone must be a valid IANA zone.
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: parsed.data.timezone });
  } catch {
    return { ok: false, error: "Unknown timezone." };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      display_name: parsed.data.display_name || null,
      timezone: parsed.data.timezone,
      default_currency: parsed.data.default_currency,
      reminders_daily: parsed.data.reminders_daily,
      reminders_weekly: parsed.data.reminders_weekly,
    })
    .eq("id", user.id);
  if (error) return { ok: false, error: error.message };
  revalidatePath("/app");
  return { ok: true };
}
