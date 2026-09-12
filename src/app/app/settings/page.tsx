import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { SignOutButton } from "@/components/app/SignOutButton";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, default_currency, reminders_daily, reminders_weekly")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <PopHeading as="h1" className="text-3xl sm:text-4xl">Settings ⚙️</PopHeading>

      <GlassCard accent="lilac" padding="lg">
        <SettingsForm
          initial={{
            display_name: profile?.display_name ?? "",
            timezone: profile?.timezone ?? "UTC",
            default_currency: profile?.default_currency ?? DEFAULT_CURRENCY,
            reminders_daily: profile?.reminders_daily ?? true,
            reminders_weekly: profile?.reminders_weekly ?? true,
          }}
        />
      </GlassCard>

      <GlassCard>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-bold text-[color:var(--ink)]">{user.email}</p>
            <p className="text-xs text-[color:var(--muted-2)]">Signed in</p>
          </div>
          <SignOutButton />
        </div>
      </GlassCard>
    </div>
  );
}
