"use client";

import { useEffect, useState } from "react";
import { PIN_KEY, UNLOCK_KEY, hashPin, getStoredPin } from "@/lib/lock";

export function PinLock() {
  const [hasPin, setHasPin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [msg, setMsg] = useState<string | null>(null);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    // Read device-local lock state on mount (no SSR access to localStorage).
    setHasPin(getStoredPin() !== null);
    setMounted(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function setLock(e: React.FormEvent) {
    e.preventDefault();
    if (pin.length < 4) return setMsg("Use at least 4 digits.");
    if (pin !== confirm) return setMsg("PINs don't match.");
    try {
      localStorage.setItem(PIN_KEY, await hashPin(pin));
      localStorage.removeItem(UNLOCK_KEY); // require unlock next open
      setHasPin(true);
      setPin("");
      setConfirm("");
      setMsg("Lock set — you'll enter it once a day.");
    } catch {
      setMsg("Couldn't save on this device.");
    }
  }

  function removeLock() {
    try {
      localStorage.removeItem(PIN_KEY);
      localStorage.removeItem(UNLOCK_KEY);
    } catch { /* ignore */ }
    setHasPin(false);
    setMsg("Lock removed.");
  }

  if (!mounted) return null;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between">
        <p className="text-sm font-bold" style={{ color: "var(--sky)" }}>🔒 Day lock</p>
        {hasPin && <span className="chip text-xs" style={{ color: "var(--mint)" }}>on</span>}
      </div>
      <p className="mb-3 text-xs text-[color:var(--muted-2)]">
        A PIN that opens LUMA once a day, then re-locks tomorrow. Saved on this device only.
      </p>

      {hasPin ? (
        <button type="button" onClick={removeLock} className="rounded-[var(--r-pill)] px-4 py-2 text-sm font-bold" style={{ background: "var(--bg-2)", boxShadow: "var(--clay-inset)", color: "var(--coral)" }}>
          Remove lock
        </button>
      ) : (
        <form onSubmit={setLock} className="flex flex-wrap items-center gap-2">
          <input type="password" inputMode="numeric" value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="PIN" className="field w-24 py-2 text-sm" />
          <input type="password" inputMode="numeric" value={confirm} onChange={(e) => setConfirm(e.target.value.replace(/\D/g, "").slice(0, 8))} placeholder="confirm" className="field w-28 py-2 text-sm" />
          <button type="submit" className="rounded-[var(--r-pill)] px-4 py-2 text-sm font-bold" style={{ background: "var(--accent)", color: "#17130a" }}>Set PIN</button>
        </form>
      )}
      {msg && <p className="mt-2 text-xs text-[color:var(--muted)]">{msg}</p>}
    </div>
  );
}
