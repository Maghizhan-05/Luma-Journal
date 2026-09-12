"use client";

import { motion } from "framer-motion";

const COLS = 20;
const ROWS = 7;
const CELLS = COLS * ROWS;

// Deterministic "intensity" per cell (0 = empty day, 1-3 = lit) so server and
// client render the same grid (no hydration mismatch).
function level(i: number) {
  const h = (i * 2654435761) >>> 0;
  const v = h % 10;
  if (v < 4) return 0;
  if (v < 6) return 1;
  if (v < 8) return 2;
  return 3;
}

const fill = ["var(--bg-2)", "color-mix(in srgb, var(--butter) 35%, var(--bg-2))", "color-mix(in srgb, var(--butter) 65%, var(--bg-2))", "var(--accent)"];

export function EveryViewDemo() {
  return (
    <div className="mt-5">
      <div className="mb-3 text-xs font-bold tracking-widest text-[color:var(--muted-2)]">
        YOUR YEAR, LIGHTING UP
      </div>
      <div
        className="grid gap-1.5"
        style={{ gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: CELLS }).map((_, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          const lv = level(i);
          return (
            <motion.div
              key={i}
              className="aspect-square rounded-[4px]"
              style={{ background: fill[lv] }}
              initial={{ opacity: 0.12, scale: 0.7 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{
                duration: 0.4,
                delay: (col + row) * 0.022,
                ease: "easeOut",
              }}
            />
          );
        })}
      </div>
    </div>
  );
}
