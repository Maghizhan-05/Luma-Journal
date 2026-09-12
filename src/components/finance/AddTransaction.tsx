"use client";

import { useState, useTransition } from "react";
import { addTransaction } from "@/lib/actions/finance";
import { CURRENCIES, CATEGORIES, type TxDirection } from "@/lib/constants";

export function AddTransaction({
  defaultDate,
  defaultCurrency,
}: {
  defaultDate: string;
  defaultCurrency: string;
}) {
  const [direction, setDirection] = useState<TxDirection>("spent");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(defaultCurrency);
  const [category, setCategory] = useState("food");
  const [note, setNote] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const cats = CATEGORIES.filter((c) => c.direction === direction || c.direction === "both");

  function setDir(d: TxDirection) {
    setDirection(d);
    const stillValid = CATEGORIES.some(
      (c) => c.key === category && (c.direction === d || c.direction === "both"),
    );
    if (!stillValid) {
      setCategory(d === "spent" ? "food" : "salary");
    }
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) {
      setError("Enter an amount greater than zero.");
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await addTransaction({ date, direction, amount: amt, currency, category, note: note.trim() || undefined });
      if (!res.ok) {
        setError(res.error ?? "Could not save");
        return;
      }
      setAmount("");
      setNote("");
    });
  }

  return (
    <form onSubmit={submit} className="flex flex-col gap-3">
      <h2 className="type-heading" style={{ color: "var(--butter)" }}>➕ Log money</h2>

      {/* Direction toggle */}
      <div className="grid grid-cols-2 gap-2">
        {(["spent", "received"] as const).map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDir(d)}
            className="rounded-[var(--r-md)] py-2 text-sm font-bold capitalize transition"
            style={
              direction === d
                ? { background: d === "spent" ? "var(--coral)" : "var(--mint)", color: "#17130a" }
                : { boxShadow: "var(--clay-inset)", color: "var(--muted)", background: "var(--bg-2)" }
            }
          >
            {d === "spent" ? "💸 Spent" : "💰 Received"}
          </button>
        ))}
      </div>

      {/* Amount + currency */}
      <div className="flex gap-2">
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="field w-24 py-2 text-sm">
          {CURRENCIES.map((c) => (
            <option key={c.code} value={c.code}>{c.symbol} {c.code}</option>
          ))}
        </select>
        <input
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="0.00"
          className="field flex-1 py-2 text-sm"
        />
      </div>

      {/* Category */}
      <select value={category} onChange={(e) => setCategory(e.target.value)} className="field py-2 text-sm">
        {cats.map((c) => (
          <option key={c.key} value={c.key}>{c.emoji} {c.label}</option>
        ))}
      </select>

      {/* Note + date */}
      <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Note (optional)" className="field py-2 text-sm" />
      <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="field py-2 text-sm" />

      {error && <p className="text-sm text-[color:var(--coral)]">{error}</p>}

      <button type="submit" disabled={pending} className="self-start rounded-[var(--r-pill)] px-5 py-2 text-sm font-bold disabled:opacity-60" style={{ background: "var(--accent)", color: "#17130a" }}>
        {pending ? "saving…" : "Add"}
      </button>
    </form>
  );
}
