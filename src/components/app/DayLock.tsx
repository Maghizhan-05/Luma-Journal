"use client";

import { type ReactNode, useEffect, useState } from "react";
import { getStoredPin, hashPin, isUnlockedToday, markUnlocked } from "@/lib/lock";

/**
 * Day-lock: if a PIN is set on this device and today isn't unlocked yet, cover
 * the app with a lock screen. Once entered, it stays unlocked for the rest of
 * the local day and re-locks tomorrow. Privacy gate only — the data itself is
 * protected server-side by auth + RLS.
 */
export function DayLock({ children }: { children: ReactNode }) {
  const [locked, setLocked] = useState(false);
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Sync the device-local lock state on mount (localStorage isn't available
    // during SSR, so this can't be a lazy initializer).
    const stored = getStoredPin();
    if (stored && !isUnlockedToday()) setLocked(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const stored = getStoredPin();
    if (!stored) {
      setLocked(false);
      return;
    }
    if ((await hashPin(pin)) === stored) {
      markUnlocked();
      setLocked(false);
      setPin("");
    } else {
      setError(true);
      setPin("");
      setTimeout(() => setError(false), 500);
    }
  }

  return (
    <>
      {children}
      {locked && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center px-6" style={{ background: "var(--bg)" }}>
          <div className="text-5xl">🔒</div>
          <p className="type-heading mt-4 text-2xl" style={{ color: "var(--accent)" }}>LUMA is locked</p>
          <p className="mt-1 text-sm text-[color:var(--muted)]">Enter your PIN to open today.</p>
          <form onSubmit={submit} className="mt-6 flex flex-col items-center gap-3">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))}
              placeholder="••••"
              className="field w-44 text-center text-2xl tracking-[0.5em]"
              style={error ? { animation: "shake 0.4s", boxShadow: "var(--clay-press), 0 0 0 2px var(--coral)" } : undefined}
            />
            <button type="submit" className="rounded-[var(--r-pill)] px-6 py-2.5 text-sm font-bold" style={{ background: "var(--accent)", color: "#17130a" }}>
              Unlock
            </button>
          </form>
        </div>
      )}
    </>
  );
}
