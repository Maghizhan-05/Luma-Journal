"use client";

import { useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { CURRENCIES } from "@/lib/constants";

const TIMEZONES = [
  "UTC", "Asia/Kolkata", "Asia/Dubai", "Asia/Singapore", "Asia/Tokyo",
  "Europe/London", "Europe/Paris", "Europe/Berlin",
  "America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles",
  "Australia/Sydney", "Pacific/Auckland",
];

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={on} className="flex items-center justify-between gap-3 text-left">
      <span className="text-sm text-[color:var(--ink-soft)]">{label}</span>
      <span className="relative h-6 w-11 shrink-0 rounded-full transition" style={{ background: on ? "var(--mint)" : "var(--bg-2)", boxShadow: "var(--clay-inset)" }}>
        <span className="absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all" style={{ left: on ? "22px" : "2px" }} />
      </span>
    </button>
  );
}

export function SettingsForm({ initial }: {
  initial: { display_name: string; timezone: string; default_currency: string; reminders_daily: boolean; reminders_weekly: boolean };
}) {
  const [name, setName] = useState(initial.display_name);
  const [tz, setTz] = useState(initial.timezone);
  const [currency, setCurrency] = useState(initial.default_currency);
  const [daily, setDaily] = useState(initial.reminders_daily);
  const [weekly, setWeekly] = useState(initial.reminders_weekly);
  const [status, setStatus] = useState<"idle" | "saved" | "error">("idle");
  const [pending, startTransition] = useTransition();

  const tzOptions = TIMEZONES.includes(tz) ? TIMEZONES : [tz, ...TIMEZONES];

  function detectTz() {
    try { setTz(Intl.DateTimeFormat().resolvedOptions().timeZone); } catch { /* ignore */ }
  }

  function save(e: React.FormEvent) {
    e.preventDefault();
    startTransition(async () => {
      const res = await updateProfile({ display_name: name.trim(), timezone: tz, default_currency: currency, reminders_daily: daily, reminders_weekly: weekly });
      setStatus(res.ok ? "saved" : "error");
    });
  }

  return (
    <form onSubmit={save} className="flex flex-col gap-5">
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[color:var(--muted)]">Your name</span>
        <input value={name} onChange={(e) => setName(e.target.value)} className="field" placeholder="Alex" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[color:var(--muted)]">Timezone <button type="button" onClick={detectTz} className="ml-1 font-bold" style={{ color: "var(--accent)" }}>use my device</button></span>
        <select value={tz} onChange={(e) => setTz(e.target.value)} className="field">
          {tzOptions.map((z) => <option key={z} value={z}>{z}</option>)}
        </select>
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[color:var(--muted)]">Default currency</span>
        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="field">
          {CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.code} — {c.label}</option>)}
        </select>
      </label>

      <div className="flex flex-col gap-3 rounded-[var(--r-md)] p-4" style={{ boxShadow: "var(--clay-inset)", background: "var(--bg-2)" }}>
        <p className="text-sm font-bold" style={{ color: "var(--butter)" }}>Email reminders</p>
        <Toggle on={daily} onClick={() => setDaily((v) => !v)} label="Daily nudge (only on days you don't open LUMA)" />
        <Toggle on={weekly} onClick={() => setWeekly((v) => !v)} label="Weekly nudge (Sundays)" />
      </div>

      <div className="flex items-center gap-3">
        <button type="submit" disabled={pending} className="rounded-[var(--r-pill)] px-6 py-2.5 text-sm font-bold disabled:opacity-60" style={{ background: "var(--accent)", color: "#17130a" }}>
          {pending ? "saving…" : "Save settings"}
        </button>
        {status === "saved" && <span className="text-sm" style={{ color: "var(--mint)" }}>✓ saved</span>}
        {status === "error" && <span className="text-sm" style={{ color: "var(--coral)" }}>⚠ not saved</span>}
      </div>
    </form>
  );
}
