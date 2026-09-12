"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { CountUp } from "./CountUp";

const DOTS = 16;

export function StreaksDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const scale = useTransform(
    scrollYProgress,
    [0, 0.5, 1],
    reduced ? [1, 1, 1] : [0.8, 1.35, 1.1],
  );
  const rotate = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [-8, 8]);

  return (
    <div ref={ref} className="mt-5 flex flex-wrap items-center gap-5">
      <motion.div style={{ scale, rotate }} className="text-6xl" aria-hidden>
        🔥
      </motion.div>
      <div>
        <div className="flex items-baseline gap-2">
          <span className="type-heading text-4xl" style={{ color: "var(--butter)" }}>
            <CountUp to={128} />
          </span>
          <span className="text-sm text-[color:var(--muted)]">day streak</span>
        </div>
        <div className="mt-3 flex gap-1.5">
          {Array.from({ length: DOTS }).map((_, i) => (
            <motion.span
              key={i}
              className="h-2.5 w-2.5 rounded-full"
              style={{ background: "var(--accent)" }}
              initial={{ scale: 0, opacity: 0.2 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ type: "spring", stiffness: 600, damping: 18, delay: i * 0.05 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
