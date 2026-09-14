"use client";

import { useOptimistic, useTransition } from "react";
import { deleteTransaction } from "@/lib/actions/finance";
import { CATEGORY_MAP, CURRENCY_MAP } from "@/lib/constants";
import { dayLabel } from "@/lib/date";
import type { Transaction } from "@/lib/types";

export function TransactionList({ transactions }: { transactions: Transaction[] }) {
  const [, startTransition] = useTransition();
  const [items, removeOptimistic] = useOptimistic<Transaction[], string>(
    transactions,
    (state, id) => state.filter((t) => t.id !== id),
  );

  if (items.length === 0) {
    return <p className="text-sm text-[color:var(--muted-2)]">No transactions this month yet.</p>;
  }

  // Group by date.
  const groups = new Map<string, Transaction[]>();
  for (const t of items) {
    const g = groups.get(t.entry_date) ?? [];
    g.push(t);
    groups.set(t.entry_date, g);
  }

  return (
    <div className="flex flex-col gap-4">
      {[...groups.entries()].map(([date, rows]) => (
        <div key={date}>
          <div className="mb-1.5 text-xs font-bold tracking-widest text-[color:var(--muted-2)]">
            {dayLabel(date).toUpperCase()}
          </div>
          <ul className="flex flex-col gap-1.5">
            {rows.map((t) => {
              const cat = CATEGORY_MAP[t.category];
              const sym = CURRENCY_MAP[t.currency]?.symbol ?? "";
              const spent = t.direction === "spent";
              return (
                <li key={t.id} className="group flex items-center gap-3 rounded-[var(--r-md)] px-3 py-2" style={{ boxShadow: "var(--clay-inset)", background: "var(--surface)" }}>
                  <span className="text-lg">{cat?.emoji ?? "✨"}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-[color:var(--ink)]">{cat?.label ?? t.category}</p>
                    {t.note && <p className="truncate text-xs text-[color:var(--muted-2)]">{t.note}</p>}
                  </div>
                  <span className="type-heading text-sm" style={{ color: spent ? "var(--coral)" : "var(--mint)" }}>
                    {spent ? "−" : "+"}{sym}{Number(t.amount).toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => startTransition(async () => { removeOptimistic(t.id); await deleteTransaction(t.id); })}
                    aria-label="Delete transaction"
                    className="text-[color:var(--muted-2)] transition hover:text-[color:var(--coral)]"
                  >
                    ✕
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
