import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDaySummaries } from "@/lib/data/period";
import { todayInTz, addDay, parseDate, dayLabel } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { MOODS, CURRENCY_MAP, DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Weekly view" };

function weekStart(date: string): string {
  const dt = parseDate(date);
  return addDay(date, -dt.getDay()); // back to Sunday
}

export default async function WeekPage({ searchParams }: PageProps<"/app/week">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("timezone, default_currency").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const sym = CURRENCY_MAP[profile?.default_currency ?? DEFAULT_CURRENCY]?.symbol ?? "₹";
  const today = todayInTz(tz);

  const params = await searchParams;
  const start = typeof params.w === "string" && /^\d{4}-\d{2}-\d{2}$/.test(params.w) ? params.w : weekStart(today);
  const end = addDay(start, 6);
  const summaries = await getDaySummaries(start, end);
  const days = Array.from({ length: 7 }, (_, i) => addDay(start, i));

  const moodEmoji = (m: number | null) => (m ? MOODS.find((x) => x.value === m)?.emoji : null);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <PopHeading as="h1" className="text-3xl sm:text-4xl">This week 🗓️</PopHeading>
        <div className="flex items-center gap-2">
          <Link href={`/app/week?w=${addDay(start, -7)}`} className="clay grid h-9 w-9 place-items-center rounded-full">‹</Link>
          <Link href={`/app/week?w=${weekStart(today)}`} className="text-sm font-bold" style={{ color: "var(--accent)" }}>this week</Link>
          <Link href={`/app/week?w=${addDay(start, 7)}`} className="clay grid h-9 w-9 place-items-center rounded-full">›</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {days.map((d) => {
          const s = summaries.get(d);
          const net = (s?.received ?? 0) - (s?.spent ?? 0);
          const isToday = d === today;
          return (
            <Link key={d} href={`/app/day/${d}`}>
              <GlassCard accent={isToday ? "sky" : "lilac"} className="h-full transition hover:brightness-110">
                <div className="mb-2 flex items-center justify-between">
                  <span className="type-heading text-sm" style={{ color: isToday ? "var(--sky)" : "var(--ink)" }}>{dayLabel(d)}</span>
                  {moodEmoji(s?.mood ?? null) && <span className="text-lg">{moodEmoji(s?.mood ?? null)}</span>}
                </div>
                <div className="flex flex-col gap-1 text-xs text-[color:var(--muted)]">
                  <span>{s?.hasJournal ? "📖 journaled" : "— no entry"}</span>
                  {(s?.moments ?? 0) > 0 && <span>⭐ {s!.moments} moment{s!.moments > 1 ? "s" : ""}</span>}
                  {(s?.photos ?? 0) > 0 && <span>📸 {s!.photos} photo{s!.photos > 1 ? "s" : ""}</span>}
                  {net !== 0 && (
                    <span style={{ color: net >= 0 ? "var(--mint)" : "var(--coral)" }}>
                      {net >= 0 ? "+" : "−"}{sym}{Math.abs(net).toLocaleString()}
                    </span>
                  )}
                </div>
              </GlassCard>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
