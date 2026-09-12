import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDaySummaries, activityLevel, type DaySummary } from "@/lib/data/period";
import { todayInTz, addDay, parseDate } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";

export const metadata: Metadata = { title: "Yearly view" };

const LEVEL_BG = [
  "var(--bg-2)",
  "color-mix(in srgb, var(--butter) 28%, var(--bg-2))",
  "color-mix(in srgb, var(--butter) 52%, var(--bg-2))",
  "color-mix(in srgb, var(--accent) 76%, var(--bg-2))",
  "var(--accent)",
];
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default async function YearPage({ searchParams }: PageProps<"/app/year">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("timezone").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const today = todayInTz(tz);

  const params = await searchParams;
  const year = typeof params.y === "string" && /^\d{4}$/.test(params.y) ? Number(params.y) : Number(today.slice(0, 4));
  const yearStart = `${year}-01-01`;
  const yearEnd = `${year}-12-31`;
  const summaries = await getDaySummaries(yearStart, yearEnd);

  // Build week columns starting from the Sunday on/before Jan 1.
  const gridStart = addDay(yearStart, -parseDate(yearStart).getDay());
  const weeks: string[][] = [];
  let cur = gridStart;
  while (cur <= yearEnd) {
    weeks.push(Array.from({ length: 7 }, (_, i) => addDay(cur, i)));
    cur = addDay(cur, 7);
  }

  // Stats
  let total = 0;
  for (const s of summaries.values()) if (s.hasJournal) total += 1;
  let streak = 0;
  for (let d = today; ; d = addDay(d, -1)) {
    if (summaries.get(d)?.hasJournal) streak += 1;
    else break;
  }

  // Month labels aligned to the week column where each month first appears.
  const monthCols: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((wk, ci) => {
    const m = parseDate(wk[0]).getMonth();
    const inYear = wk[0].slice(0, 4) === String(year) || wk[6].slice(0, 4) === String(year);
    if (inYear && m !== lastMonth) {
      monthCols.push({ col: ci, label: MONTHS[m] });
      lastMonth = m;
    }
  });

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <PopHeading as="h1" className="text-3xl sm:text-4xl">Your year 🔥</PopHeading>
        <div className="flex items-center gap-2">
          <Link href={`/app/year?y=${year - 1}`} className="clay grid h-9 w-9 place-items-center rounded-full">‹</Link>
          <span className="min-w-16 text-center text-sm font-bold">{year}</span>
          <Link href={`/app/year?y=${year + 1}`} className="clay grid h-9 w-9 place-items-center rounded-full">›</Link>
        </div>
      </header>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <GlassCard accent="butter"><p className="text-sm text-[color:var(--muted)]">Current streak</p><p className="type-heading text-3xl" style={{ color: "var(--accent)" }}>{streak}🔥</p></GlassCard>
        <GlassCard accent="mint"><p className="text-sm text-[color:var(--muted)]">Days journaled</p><p className="type-heading text-3xl" style={{ color: "var(--mint)" }}>{total}</p></GlassCard>
        <GlassCard accent="sky" className="hidden sm:block"><p className="text-sm text-[color:var(--muted)]">Year</p><p className="type-heading text-3xl" style={{ color: "var(--sky)" }}>{year}</p></GlassCard>
      </div>

      <GlassCard accent="sky" padding="lg">
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="relative mb-1 h-4" style={{ marginLeft: 0 }}>
              {monthCols.map((mc) => (
                <span key={`${mc.col}-${mc.label}`} className="absolute text-[10px] text-[color:var(--muted-2)]" style={{ left: `${mc.col * 15}px` }}>{mc.label}</span>
              ))}
            </div>
            {/* Grid: columns of weeks */}
            <div className="flex gap-[3px]">
              {weeks.map((wk, ci) => (
                <div key={ci} className="flex flex-col gap-[3px]">
                  {wk.map((d) => {
                    const inYear = d.slice(0, 4) === String(year);
                    const s: DaySummary | undefined = summaries.get(d);
                    const lvl = activityLevel(s);
                    const isToday = d === today;
                    return (
                      <Link
                        key={d}
                        href={inYear ? `/app/day/${d}` : "#"}
                        aria-label={d}
                        className="h-3 w-3 rounded-[3px] transition hover:scale-125"
                        style={{
                          background: inYear ? LEVEL_BG[lvl] : "transparent",
                          boxShadow: isToday ? "0 0 0 1.5px var(--accent)" : undefined,
                          pointerEvents: inYear ? "auto" : "none",
                        }}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-end gap-1.5 text-[10px] text-[color:var(--muted-2)]">
          less
          {LEVEL_BG.map((bg, i) => <span key={i} className="h-3 w-3 rounded-[3px]" style={{ background: bg }} />)}
          more
        </div>
      </GlassCard>
    </div>
  );
}
