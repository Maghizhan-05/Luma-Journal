"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { TAGS, type TagKey } from "@/lib/constants";

export function SearchControls({
  initialQ,
  initialTags,
  initialFrom,
  initialTo,
}: {
  initialQ: string;
  initialTags: TagKey[];
  initialFrom: string;
  initialTo: string;
}) {
  const router = useRouter();
  const [q, setQ] = useState(initialQ);
  const [tags, setTags] = useState<TagKey[]>(initialTags);
  const [from, setFrom] = useState(initialFrom);
  const [to, setTo] = useState(initialTo);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (q.trim()) params.set("q", q.trim());
      if (tags.length) params.set("tags", tags.join(","));
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      const qs = params.toString();
      router.replace(qs ? `/app/moments?${qs}` : "/app/moments");
    }, 300);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [q, tags, from, to, router]);

  function toggleTag(k: TagKey) {
    setTags((prev) => (prev.includes(k) ? prev.filter((t) => t !== k) : [...prev, k]));
  }

  return (
    <div className="flex flex-col gap-3">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="🔍 Search your moments…"
        className="field"
        autoFocus
      />
      <div className="flex flex-wrap gap-1.5">
        {TAGS.map((t) => {
          const on = tags.includes(t.key);
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => toggleTag(t.key)}
              className="chip text-xs"
              style={on ? { color: t.color, boxShadow: `var(--clay-inset), 0 0 0 1.5px ${t.color}` } : { opacity: 0.55 }}
            >
              {t.emoji} {t.label}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap items-center gap-2 text-sm text-[color:var(--muted)]">
        <span>from</span>
        <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="field w-auto py-1.5 text-sm" />
        <span>to</span>
        <input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="field w-auto py-1.5 text-sm" />
        {(q || tags.length || from || to) && (
          <button
            type="button"
            onClick={() => { setQ(""); setTags([]); setFrom(""); setTo(""); }}
            className="font-bold"
            style={{ color: "var(--accent)" }}
          >
            clear
          </button>
        )}
      </div>
    </div>
  );
}
