"use client";

import { useEffect, useRef, useState } from "react";
import { saveJournal } from "@/lib/actions/day";
import { MOODS } from "@/lib/constants";

type SaveState = "idle" | "saving" | "saved" | "error";

export function JournalEditor({
  date,
  initialBody,
  initialMood,
}: {
  date: string;
  initialBody: string;
  initialMood: number | null;
}) {
  const [body, setBody] = useState(initialBody);
  const [mood, setMood] = useState<number | null>(initialMood);
  const [state, setState] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  // Debounced autosave whenever body or mood changes (skip initial mount).
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    setState("saving");
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      const res = await saveJournal(date, body, mood);
      setState(res.ok ? "saved" : "error");
    }, 800);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [body, mood, date]);

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="type-heading text-lg" style={{ color: "var(--sky)" }}>
          📖 Journal of the day
        </h2>
        <span className="text-xs text-[color:var(--muted-2)]">
          {state === "saving" && "saving…"}
          {state === "saved" && "✓ saved"}
          {state === "error" && "⚠ not saved"}
        </span>
      </div>

      {/* Mood */}
      <div className="mb-3 flex gap-1.5">
        {MOODS.map((m) => (
          <button
            key={m.value}
            type="button"
            onClick={() => setMood(mood === m.value ? null : m.value)}
            aria-label={m.label}
            aria-pressed={mood === m.value}
            className="grid h-9 w-9 place-items-center rounded-full text-lg transition"
            style={
              mood === m.value
                ? { background: `color-mix(in srgb, ${m.color} 28%, var(--surface))`, boxShadow: "var(--clay-inset)" }
                : { opacity: 0.5 }
            }
          >
            {m.emoji}
          </button>
        ))}
      </div>

      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="How was today? Start typing — or dictate with your voice…"
        rows={10}
        className="field w-full resize-y leading-relaxed"
        style={{ minHeight: "12rem" }}
      />
    </div>
  );
}
