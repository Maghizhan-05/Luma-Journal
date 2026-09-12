import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { SettingsForm } from "@/components/settings/SettingsForm";
import { SignOutButton } from "@/components/app/SignOutButton";
import { Avatar } from "@/components/ui/Avatar";
import { DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Profile" };

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, timezone, default_currency, reminders_daily, reminders_weekly")
    .eq("id", user.id)
    .maybeSingle();

  const displayName = profile?.display_name ?? "";

  return (
    <div className="mx-auto flex max-w-lg flex-col gap-4">
      <PopHeading as="h1" className="text-3xl sm:text-4xl">Profile 👤</PopHeading>

      {/* Identity */}
      <GlassCard accent="sky" padding="lg">
        <div className="flex items-center gap-4">
          <Avatar name={displayName} email={user.email ?? ""} size={64} />
          <div className="min-w-0">
            <p className="type-heading text-xl">{displayName || "Your name"}</p>
            <p className="truncate text-sm text-[color:var(--muted)]">{user.email}</p>
          </div>
        </div>
      </GlassCard>

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

      <GlassCard accent="mint">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-bold text-[color:var(--ink)]">📦 Your data</p>
            <p className="text-xs text-[color:var(--muted-2)]">Download everything as JSON — it&apos;s yours.</p>
          </div>
          <a href="/api/export" download className="shrink-0 rounded-[var(--r-pill)] px-4 py-2 text-sm font-bold" style={{ background: "var(--mint)", color: "#14140f" }}>Export</a>
        </div>
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
