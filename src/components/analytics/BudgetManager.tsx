"use client";

import { useState, useTransition } from "react";
import { setBudget, deleteBudget } from "@/lib/actions/budgets";
import { CATEGORIES, CATEGORY_MAP, CURRENCY_MAP } from "@/lib/constants";
import type { Budget } from "@/lib/types";

const SPEND_CATS = CATEGORIES.filter((c) => c.direction === "spent" || c.direction === "both");

export function BudgetManager({
  budgets,
  spendByCategory,
  currency,
}: {
  budgets: Budget[];
  spendByCategory: { category: string; amount: number }[];
  currency: string;
}) {
  const [category, setCategory] = useState(SPEND_CATS[0].key);
  const [limit, setLimit] = useState("");
  const [pending, startTransition] = useTransition();
  const sym = CURRENCY_MAP[currency]?.symbol ?? "";
  const spend = new Map(spendByCategory.map((s) => [s.category, s.amount]));

  function add(e: React.FormEvent) {
    e.preventDefault();
    const n = Number(limit);
    if (!n || n <= 0) return;
    setLimit("");
    startTransition(async () => {
      await setBudget({ category, monthly_limit: n, currency });
    });
  }

  return (
    <div>
      <h2 className="mb-4 type-heading" style={{ color: "var(--butter)" }}>Budgets</h2>

      <div className="mb-4 flex flex-col gap-2.5">
        {budgets.length === 0 && <p className="text-sm text-[color:var(--muted-2)]">No budgets set — add one below.</p>}
        {budgets.map((b) => {
          const used = spend.get(b.category) ?? 0;
          const pct = b.monthly_limit ? Math.min(100, Math.round((used / b.monthly_limit) * 100)) : 0;
          const over = used > b.monthly_limit;
          const cat = CATEGORY_MAP[b.category];
          const bSym = CURRENCY_MAP[b.currency]?.symbol ?? "";
          return (
            <div key={b.id} className="group">
              <div className="mb-1 flex items-center justify-between text-sm">
                <span>{cat?.emoji} {cat?.label ?? b.category}</span>
                <span className="flex items-center gap-2">
                  <span style={{ color: over ? "var(--coral)" : "var(--muted)" }}>
                    {bSym}{used.toLocaleString()} / {bSym}{b.monthly_limit.toLocaleString()}
                  </span>
                  <button
                    type="button"
                    onClick={() => startTransition(async () => { await deleteBudget(b.category); })}
                    aria-label="Remove budget"
                    className="text-[color:var(--muted-2)] transition hover:text-[color:var(--coral)]"
                  >✕</button>
                </span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "var(--bg-2)" }}>
                <div className="h-full rounded-full transition-[width]" style={{ width: `${pct}%`, background: over ? "var(--coral)" : "var(--mint)" }} />
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={add} className="flex flex-wrap items-center gap-2">
        <select value={category} onChange={(e) => setCategory(e.target.value)} className="field w-auto flex-1 py-2 text-sm">
          {SPEND_CATS.map((c) => <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>)}
        </select>
        <input type="number" min="0" step="1" value={limit} onChange={(e) => setLimit(e.target.value)} placeholder={`${sym} limit`} className="field w-28 py-2 text-sm" />
        <button type="submit" disabled={pending} className="rounded-[var(--r-pill)] px-4 py-2 text-sm font-bold disabled:opacity-60" style={{ background: "var(--accent)", color: "#17130a" }}>set</button>
      </form>
    </div>
  );
}
