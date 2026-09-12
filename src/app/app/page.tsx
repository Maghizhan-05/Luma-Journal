import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayInTz, formatLong } from "@/lib/date";
import { getDailyPrompt, getStreak, getOnThisDay } from "@/lib/data/extras";
import { PopHeading } from "@/components/ui/PopHeading";
import { GlassCard } from "@/components/ui/GlassCard";
import { DayView } from "@/components/day/DayView";
import { CURRENCY_MAP, DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Today" };

function greeting(h: number) {
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, default_currency, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const tz = profile?.timezone ?? "UTC";
  const sym = CURRENCY_MAP[profile?.default_currency ?? DEFAULT_CURRENCY]?.symbol ?? "₹";
  const date = todayInTz(tz);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date()),
  );

  const [prompt, streak, memories] = await Promise.all([
    getDailyPrompt(date),
    getStreak(date),
    getOnThisDay(date),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <PopHeading as="h1" className="text-3xl sm:text-4xl">
            {greeting(hour)}{profile?.display_name ? `, ${profile.display_name}` : ""} ✦
          </PopHeading>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{formatLong(date)}</p>
        </div>
        <div className="flex items-center gap-2">
          {streak > 0 && (
            <span className="chip" style={{ color: "var(--accent)" }}>🔥 {streak}-day streak</span>
          )}
          <p className="hidden text-xs text-[color:var(--muted-2)] sm:block">drag ⠿ to rearrange</p>
        </div>
      </header>

      {/* Prompt of the day */}
      {prompt && (
        <GlassCard accent="butter" className="flex items-center gap-3">
          <span className="text-xl">✍️</span>
          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-[color:var(--muted-2)]">Prompt of the day</p>
            <p className="text-[color:var(--ink)]">{prompt}</p>
          </div>
        </GlassCard>
      )}

      {/* On this day */}
      {memories.length > 0 && (
        <GlassCard accent="lilac">
          <h2 className="mb-2 type-heading" style={{ color: "var(--lilac)" }}>🕰️ On this day</h2>
          <div className="flex flex-col gap-2">
            {memories.map((m) => (
              <Link key={m.date} href={`/app/day/${m.date}`} className="rounded-[var(--r-md)] p-3 transition hover:brightness-110" style={{ boxShadow: "var(--clay-inset)", background: "var(--surface)" }}>
                <div className="mb-0.5 flex items-center justify-between">
                  <span className="text-sm font-bold text-[color:var(--ink)]">{m.title}</span>
                  <span className="text-xs text-[color:var(--muted-2)]">{m.label}</span>
                </div>
                {m.snippet && <p className="text-sm text-[color:var(--muted)]">{m.snippet}</p>}
              </Link>
            ))}
          </div>
        </GlassCard>
      )}

      <DayView date={date} userId={user.id} currencySymbol={sym} />
    </div>
  );
}
