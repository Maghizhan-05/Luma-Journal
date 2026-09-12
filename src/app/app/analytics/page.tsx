import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAnalytics } from "@/lib/data/analytics";
import { currentMonth, addMonth, monthLabel } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { Donut, type Segment } from "@/components/analytics/Donut";
import { BudgetManager } from "@/components/analytics/BudgetManager";
import { CATEGORY_MAP, CURRENCY_MAP, MOODS, TAG_MAP, DEFAULT_CURRENCY, type TagKey } from "@/lib/constants";
import type { Budget } from "@/lib/types";

export const metadata: Metadata = { title: "Analytics" };

const PALETTE = ["var(--peach)", "var(--sky)", "var(--mint)", "var(--lilac)", "var(--butter)", "var(--coral)", "var(--bubble)"];

export default async function AnalyticsPage({ searchParams }: PageProps<"/app/analytics">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase.from("profiles").select("timezone, default_currency").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";

  const params = await searchParams;
  const month = typeof params.m === "string" && /^\d{4}-\d{2}$/.test(params.m) ? params.m : currentMonth(tz);
  const a = await getAnalytics(month);
  const sym = CURRENCY_MAP[a.primaryCurrency ?? DEFAULT_CURRENCY]?.symbol ?? "₹";
  const { data: budgets } = await supabase.from("budgets").select("*").order("category");

  const spendSegments: Segment[] = a.spendByCategory.map((c, i) => ({
    label: CATEGORY_MAP[c.category]?.label ?? c.category,
    emoji: CATEGORY_MAP[c.category]?.emoji,
    value: c.amount,
    color: PALETTE[i % PALETTE.length],
  }));

  const maxMood = Math.max(1, ...MOODS.map((m) => a.moodCounts[m.value] ?? 0));
  const maxTag = Math.max(1, ...a.tagCounts.map((t) => t.count));
  const flowMax = Math.max(1, a.spent, a.received);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <PopHeading as="h1" className="text-3xl sm:text-4xl">Your stats 📊</PopHeading>
        <div className="flex items-center gap-2">
          <Link href={`/app/analytics?m=${addMonth(month, -1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">‹</Link>
          <span className="min-w-40 text-center text-sm font-bold">{monthLabel(month)}</span>
          <Link href={`/app/analytics?m=${addMonth(month, 1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">›</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {/* Spend donut */}
        <GlassCard accent="peach" padding="lg">
          <h2 className="mb-4 type-heading" style={{ color: "var(--peach)" }}>Where money went</h2>
          <Donut segments={spendSegments} centerTop="spent" centerMain={`${sym}${a.spent.toLocaleString()}`} />
        </GlassCard>

        {/* Money flow */}
        <GlassCard accent="mint" padding="lg">
          <h2 className="mb-4 type-heading" style={{ color: "var(--mint)" }}>In vs out</h2>
          <div className="flex flex-col gap-4">
            {[
              { label: "Received", value: a.received, color: "var(--mint)", sign: "+" },
              { label: "Spent", value: a.spent, color: "var(--coral)", sign: "−" },
            ].map((row) => (
              <div key={row.label}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="text-[color:var(--muted)]">{row.label}</span>
                  <span className="type-heading" style={{ color: row.color }}>{row.sign}{sym}{row.value.toLocaleString()}</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full" style={{ background: "var(--bg-2)" }}>
                  <div className="h-full rounded-full" style={{ width: `${(row.value / flowMax) * 100}%`, background: row.color }} />
                </div>
              </div>
            ))}
            <div className="border-t border-[color:var(--hairline)] pt-2 text-sm">
              Net{" "}
              <span className="type-heading" style={{ color: a.received - a.spent >= 0 ? "var(--mint)" : "var(--coral)" }}>
                {a.received - a.spent >= 0 ? "+" : "−"}{sym}{Math.abs(a.received - a.spent).toLocaleString()}
              </span>
            </div>
          </div>
        </GlassCard>

        {/* Mood distribution */}
        <GlassCard accent="lilac" padding="lg">
          <h2 className="mb-4 type-heading" style={{ color: "var(--lilac)" }}>How you felt</h2>
          <div className="flex items-end justify-around gap-2" style={{ height: 120 }}>
            {MOODS.map((m) => {
              const c = a.moodCounts[m.value] ?? 0;
              return (
                <div key={m.value} className="flex flex-1 flex-col items-center justify-end gap-1">
                  <span className="text-xs text-[color:var(--muted-2)]">{c || ""}</span>
                  <div className="w-full rounded-t-[6px]" style={{ height: `${(c / maxMood) * 80}px`, minHeight: c ? 4 : 0, background: m.color }} />
                  <span className="text-lg">{m.emoji}</span>
                </div>
              );
            })}
          </div>
          {a.journaledDays === 0 && <p className="mt-2 text-center text-sm text-[color:var(--muted-2)]">No moods logged yet.</p>}
        </GlassCard>

        {/* Top tags */}
        <GlassCard accent="sky" padding="lg">
          <h2 className="mb-4 type-heading" style={{ color: "var(--sky)" }}>Moment tags</h2>
          {a.tagCounts.length === 0 ? (
            <p className="text-sm text-[color:var(--muted-2)]">No tagged moments this month.</p>
          ) : (
            <div className="flex flex-col gap-2.5">
              {a.tagCounts.slice(0, 6).map((t) => {
                const meta = TAG_MAP[t.tag as TagKey];
                return (
                  <div key={t.tag}>
                    <div className="mb-1 flex items-center justify-between text-sm">
                      <span>{meta?.emoji} {meta?.label ?? t.tag}</span>
                      <span className="text-[color:var(--muted)]">{t.count}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-2)" }}>
                      <div className="h-full rounded-full" style={{ width: `${(t.count / maxTag) * 100}%`, background: meta?.color ?? "var(--sky)" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </GlassCard>

        {/* Budgets */}
        <GlassCard accent="butter" padding="lg" className="lg:col-span-2">
          <BudgetManager
            budgets={(budgets as Budget[]) ?? []}
            spendByCategory={a.spendByCategory}
            currency={a.primaryCurrency}
          />
        </GlassCard>
      </div>
    </div>
  );
}
