import "server-only";
import { createClient } from "@/lib/supabase/server";
import { monthRange } from "@/lib/date";
import type { Transaction } from "@/lib/types";

export interface CurrencyTotals {
  currency: string;
  spent: number;
  received: number;
}

export interface CategoryTotal {
  category: string;
  amount: number;
}

export interface FinanceMonth {
  month: string;
  transactions: Transaction[];
  byCurrency: CurrencyTotals[];
  spentByCategory: CategoryTotal[]; // in the primary currency
  primaryCurrency: string;
}

/** All transactions + rollups for a YYYY-MM month, for the current user. */
export async function getFinanceMonth(month: string): Promise<FinanceMonth> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { month, transactions: [], byCurrency: [], spentByCategory: [], primaryCurrency: "INR" };
  }

  const { start, end } = monthRange(month);
  const { data } = await supabase
    .from("transactions")
    .select("*")
    .gte("entry_date", start)
    .lte("entry_date", end)
    .order("entry_date", { ascending: false })
    .order("created_at", { ascending: false });

  const transactions = (data as Transaction[]) ?? [];

  // Totals grouped by currency.
  const curMap = new Map<string, CurrencyTotals>();
  for (const t of transactions) {
    const c = curMap.get(t.currency) ?? { currency: t.currency, spent: 0, received: 0 };
    if (t.direction === "spent") c.spent += Number(t.amount);
    else c.received += Number(t.amount);
    curMap.set(t.currency, c);
  }
  const byCurrency = [...curMap.values()].sort(
    (a, b) => b.spent + b.received - (a.spent + a.received),
  );

  // Primary currency = the one with the most activity.
  const primaryCurrency = byCurrency[0]?.currency ?? "INR";

  // Spend by category, primary currency only (for the donut).
  const catMap = new Map<string, number>();
  for (const t of transactions) {
    if (t.direction !== "spent" || t.currency !== primaryCurrency) continue;
    catMap.set(t.category, (catMap.get(t.category) ?? 0) + Number(t.amount));
  }
  const spentByCategory = [...catMap.entries()]
    .map(([category, amount]) => ({ category, amount }))
    .sort((a, b) => b.amount - a.amount);

  return { month, transactions, byCurrency, spentByCategory, primaryCurrency };
}
