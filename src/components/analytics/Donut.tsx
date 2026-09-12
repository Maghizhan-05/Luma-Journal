"use client";

import { motion } from "framer-motion";

export interface Segment {
  label: string;
  value: number;
  color: string;
  emoji?: string;
}

export function Donut({
  segments,
  centerTop,
  centerMain,
}: {
  segments: Segment[];
  centerTop?: string;
  centerMain?: string;
}) {
  const total = segments.reduce((s, x) => s + x.value, 0) || 1;
  const fracs = segments.map((s) => s.value / total);
  const arcs = segments.map((s, i) => ({
    ...s,
    frac: fracs[i],
    start: fracs.slice(0, i).reduce((a, b) => a + b, 0),
  }));

  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-36 w-36 shrink-0">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--bg-2)" strokeWidth="13" />
        <g transform="rotate(-90 60 60)">
          {arcs.map((a, i) => (
            <motion.circle
              key={i}
              cx="60" cy="60" r="44" fill="none"
              stroke={a.color} strokeWidth="13" strokeLinecap="butt"
              style={{ pathOffset: a.start + 0.004 }}
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: Math.max(0, a.frac - 0.008) }}
              viewport={{ once: true }}
              transition={{ duration: 0.9, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            />
          ))}
        </g>
        {centerTop && <text x="60" y="56" textAnchor="middle" className="fill-[var(--muted)]" style={{ fontSize: 8, fontFamily: "var(--font-display)" }}>{centerTop}</text>}
        {centerMain && <text x="60" y="70" textAnchor="middle" className="fill-[var(--ink)]" style={{ fontSize: 13, fontFamily: "var(--font-display)", fontWeight: 700 }}>{centerMain}</text>}
      </svg>

      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        {segments.map((s, i) => (
          <div key={i} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex items-center gap-2 truncate">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ background: s.color }} />
              <span className="truncate text-[color:var(--ink-soft)]">{s.emoji} {s.label}</span>
            </span>
            <span className="shrink-0 text-[color:var(--muted)]">{Math.round((s.value / total) * 100)}%</span>
          </div>
        ))}
        {segments.length === 0 && <p className="text-sm text-[color:var(--muted-2)]">No data yet.</p>}
      </div>
    </div>
  );
}
