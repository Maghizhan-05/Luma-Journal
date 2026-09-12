"use client";

import { motion } from "framer-motion";
import { CountUp } from "./CountUp";

const RECEIVED = 3500;
const SPENT = 1240;
const total = RECEIVED + SPENT;
const recFrac = RECEIVED / total;
const spentFrac = SPENT / total;

export function MoneyTrackerDemo() {
  return (
    <div className="mt-5 flex flex-wrap items-center gap-6">
      {/* Donut that draws itself on scroll */}
      <svg viewBox="0 0 120 120" className="h-32 w-32 shrink-0">
        <circle cx="60" cy="60" r="44" fill="none" stroke="var(--bg-2)" strokeWidth="12" />
        <g transform="rotate(-90 60 60)">
          <motion.circle
            cx="60" cy="60" r="44" fill="none" stroke="var(--mint)" strokeWidth="12" strokeLinecap="round"
            style={{ pathOffset: 0 }}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: recFrac }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          />
          <motion.circle
            cx="60" cy="60" r="44" fill="none" stroke="var(--coral)" strokeWidth="12" strokeLinecap="round"
            style={{ pathOffset: recFrac + 0.012 }}
            initial={{ pathLength: 0 }}
            whileInView={{ pathLength: spentFrac - 0.024 }}
            viewport={{ once: true, margin: "-12%" }}
            transition={{ duration: 1.1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          />
        </g>
        <text x="60" y="58" textAnchor="middle" className="fill-[var(--muted)]" style={{ fontSize: 9, fontFamily: "var(--font-display)" }}>this</text>
        <text x="60" y="70" textAnchor="middle" className="fill-[var(--ink)]" style={{ fontSize: 11, fontFamily: "var(--font-display)", fontWeight: 700 }}>month</text>
      </svg>

      {/* Legend with count-up figures */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--mint)" }} />
          <span className="text-sm text-[color:var(--muted)]">Received</span>
          <span className="type-heading text-lg" style={{ color: "var(--mint)" }}>
            <CountUp to={RECEIVED} prefix="₹" />
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="h-3 w-3 rounded-full" style={{ background: "var(--coral)" }} />
          <span className="text-sm text-[color:var(--muted)]">Spent</span>
          <span className="type-heading text-lg" style={{ color: "var(--coral)" }}>
            <CountUp to={SPENT} prefix="₹" />
          </span>
        </div>
        <div className="mt-1 flex items-center gap-2.5 border-t border-[color:var(--hairline)] pt-2">
          <span className="text-sm text-[color:var(--muted)]">Saved</span>
          <span className="type-heading text-lg" style={{ color: "var(--butter)" }}>
            <CountUp to={RECEIVED - SPENT} prefix="₹" />
          </span>
        </div>
      </div>
    </div>
  );
}
