"use client";

import { useRef } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useReducedMotion,
} from "framer-motion";

/** Polaroids with catch-phrases that drift left→right as you scroll past. */
const POLAROIDS = [
  { emoji: "☕", caption: "golden hour", tint: "var(--butter)", rot: -6 },
  { emoji: "🌆", caption: "friday nights", tint: "var(--lilac)", rot: 4 },
  { emoji: "🏆", caption: "little wins", tint: "var(--mint)", rot: -3 },
  { emoji: "🛋️", caption: "sunday slow", tint: "var(--peach)", rot: 6 },
  { emoji: "🌙", caption: "3am thoughts", tint: "var(--sky)", rot: -5 },
];

export function PhotoWallDemo() {
  const ref = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  // Whole strip drifts left→right across the scroll pass.
  const x = useTransform(scrollYProgress, [0, 1], reduced ? [0, 0] : [70, -70]);

  return (
    <div ref={ref} className="mt-5 overflow-hidden">
      <motion.div style={{ x }} className="flex gap-4 pb-2">
        {POLAROIDS.map((p, i) => (
          <motion.div
            key={p.caption}
            initial={reduced ? false : { opacity: 0, x: -40, rotate: p.rot * 2 }}
            whileInView={{ opacity: 1, x: 0, rotate: p.rot }}
            viewport={{ once: true, margin: "-8% 0px" }}
            transition={{
              duration: 0.6,
              delay: i * 0.09,
              ease: [0.22, 1, 0.36, 1],
            }}
            whileHover={{ y: -8, rotate: 0, scale: 1.05 }}
            className="shrink-0"
            style={{ rotate: p.rot }}
          >
            <div
              className="w-[128px] rounded-[8px] p-2.5 pb-3"
              style={{
                background: "#f3efe6",
                boxShadow: "6px 10px 22px rgba(0,0,0,0.55)",
              }}
            >
              <div
                className="grid aspect-square place-items-center rounded-[4px] text-3xl"
                style={{
                  background: `linear-gradient(140deg, color-mix(in srgb, ${p.tint} 60%, #2a2520), color-mix(in srgb, ${p.tint} 22%, #16130f))`,
                }}
              >
                {p.emoji}
              </div>
              <p
                className="mt-2 text-center text-[13px] font-bold"
                style={{ color: "#2a2520", fontFamily: "var(--font-display)" }}
              >
                {p.caption}
              </p>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
