import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDaySummaries, activityLevel } from "@/lib/data/period";
import { currentMonth, addMonth, monthLabel, monthRange, todayInTz, parseDate } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { MOODS } from "@/lib/constants";

export const metadata: Metadata = { title: "Monthly view" };

const WEEK = ["S", "M", "T", "W", "T", "F", "S"];
const LEVEL_BG = [
  "transparent",
  "color-mix(in srgb, var(--butter) 30%, transparent)",
  "color-mix(in srgb, var(--butter) 55%, transparent)",
  "color-mix(in srgb, var(--accent) 75%, transparent)",
  "var(--accent)",
];

export default async function MonthPage({ searchParams }: PageProps<"/app/month">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);

  const params = await searchParams;
  const month = typeof params.m === "string" && /^\d{4}-\d{2}$/.test(params.m) ? params.m : currentMonth(tz);
  const { start, end } = monthRange(month);
  const summaries = await getDaySummaries(start, end);

  const firstDow = parseDate(start).getDay();
  const daysInMonth = parseDate(end).getDate();
  const cells: (string | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => `${month}-${String(i + 1).padStart(2, "0")}`),
  ];

  const moodEmoji = (m: number | null) => (m ? MOODS.find((x) => x.value === m)?.emoji : null);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <PopHeading as="h1" className="text-3xl sm:text-4xl">Calendar 📅</PopHeading>
        <div className="flex items-center gap-2">
          <Link href={`/app/month?m=${addMonth(month, -1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">‹</Link>
          <span className="min-w-40 text-center text-sm font-bold">{monthLabel(month)}</span>
          <Link href={`/app/month?m=${addMonth(month, 1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">›</Link>
        </div>
      </header>

      <GlassCard accent="sky" padding="lg">
        <div className="mb-2 grid grid-cols-7 gap-1.5 text-center text-xs font-bold text-[color:var(--muted-2)]">
          {WEEK.map((w, i) => <div key={i}>{w}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((d, i) => {
            if (!d) return <div key={i} />;
            const s = summaries.get(d);
            const lvl = activityLevel(s);
            const isToday = d === today;
            const dayNum = Number(d.slice(-2));
            const mood = moodEmoji(s?.mood ?? null);
            return (
              <Link
                key={d}
                href={`/app/day/${d}`}
                className="relative grid aspect-square place-items-center rounded-[var(--r-sm)] text-sm transition hover:brightness-125"
                style={{
                  background: LEVEL_BG[lvl],
                  boxShadow: isToday ? "0 0 0 2px var(--accent)" : "var(--clay-inset)",
                  color: lvl >= 3 ? "#17130a" : "var(--ink-soft)",
                }}
              >
                {mood ? <span className="text-base leading-none">{mood}</span> : <span>{dayNum}</span>}
                {mood && <span className="absolute bottom-0.5 right-1 text-[9px] opacity-70" style={{ color: lvl >= 3 ? "#17130a" : "var(--muted-2)" }}>{dayNum}</span>}
              </Link>
            );
          })}
        </div>
      </GlassCard>

      <p className="text-center text-xs text-[color:var(--muted-2)]">Tap any day to open it · brighter = more that day</p>
    </div>
  );
}
