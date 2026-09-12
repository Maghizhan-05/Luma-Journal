import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getFinanceMonth } from "@/lib/data/finance";
import { currentMonth, addMonth, monthLabel, todayInTz, monthRange } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { AddTransaction } from "@/components/finance/AddTransaction";
import { TransactionList } from "@/components/finance/TransactionList";
import { CURRENCY_MAP, CATEGORY_MAP, DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Money" };

export default async function FinancePage({ searchParams }: PageProps<"/app/finance">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("timezone, default_currency").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const defaultCurrency = profile?.default_currency ?? DEFAULT_CURRENCY;

  const params = await searchParams;
  const month = typeof params.m === "string" && /^\d{4}-\d{2}$/.test(params.m) ? params.m : currentMonth(tz);
  const { transactions, byCurrency, spentByCategory, primaryCurrency } = await getFinanceMonth(month);

  // Default new-transaction date: today if this month, else the 1st of it.
  const today = todayInTz(tz);
  const defaultDate = today.startsWith(month) ? today : monthRange(month).start;

  const sym = (c: string) => CURRENCY_MAP[c]?.symbol ?? "";
  const primary = byCurrency.find((c) => c.currency === primaryCurrency);
  const net = (primary?.received ?? 0) - (primary?.spent ?? 0);
  const totalSpent = spentByCategory.reduce((s, c) => s + c.amount, 0);

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-2">
        <PopHeading as="h1" className="text-3xl sm:text-4xl">Money 💸</PopHeading>
        <div className="flex items-center gap-2">
          <Link href={`/app/finance?m=${addMonth(month, -1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">‹</Link>
          <span className="min-w-40 text-center text-sm font-bold">{monthLabel(month)}</span>
          <Link href={`/app/finance?m=${addMonth(month, 1)}`} className="clay grid h-9 w-9 place-items-center rounded-full">›</Link>
        </div>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.1fr]">
        {/* Summary */}
        <div className="flex flex-col gap-4">
          <GlassCard accent={net >= 0 ? "mint" : "coral"} padding="lg">
            <p className="text-sm text-[color:var(--muted)]">Net this month</p>
            <p className="type-heading text-4xl" style={{ color: net >= 0 ? "var(--mint)" : "var(--coral)" }}>
              {net >= 0 ? "+" : "−"}{sym(primaryCurrency)}{Math.abs(net).toLocaleString()}
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              {byCurrency.length === 0 && <p className="text-sm text-[color:var(--muted-2)]">Nothing logged yet.</p>}
              {byCurrency.map((c) => (
                <div key={c.currency} className="flex items-center justify-between text-sm">
                  <span className="text-[color:var(--muted)]">{c.currency}</span>
                  <span>
                    <span style={{ color: "var(--mint)" }}>+{sym(c.currency)}{c.received.toLocaleString()}</span>
                    {"  "}
                    <span style={{ color: "var(--coral)" }}>−{sym(c.currency)}{c.spent.toLocaleString()}</span>
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>

          {spentByCategory.length > 0 && (
            <GlassCard accent="peach" padding="lg">
              <h2 className="mb-3 type-heading" style={{ color: "var(--peach)" }}>Where it went</h2>
              <div className="flex flex-col gap-2.5">
                {spentByCategory.slice(0, 6).map((c) => {
                  const cat = CATEGORY_MAP[c.category];
                  const pct = totalSpent ? Math.round((c.amount / totalSpent) * 100) : 0;
                  return (
                    <div key={c.category}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span>{cat?.emoji} {cat?.label ?? c.category}</span>
                        <span className="text-[color:var(--muted)]">{sym(primaryCurrency)}{c.amount.toLocaleString()} · {pct}%</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full" style={{ background: "var(--bg-2)" }}>
                        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: "var(--peach)" }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </GlassCard>
          )}

          <GlassCard accent="butter"><AddTransaction defaultDate={defaultDate} defaultCurrency={defaultCurrency} /></GlassCard>
        </div>

        {/* History */}
        <GlassCard accent="sky" padding="lg">
          <h2 className="mb-3 type-heading" style={{ color: "var(--sky)" }}>History</h2>
          <TransactionList transactions={transactions} />
        </GlassCard>
      </div>
    </div>
  );
}
