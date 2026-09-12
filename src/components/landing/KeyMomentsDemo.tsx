"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { TAGS } from "@/lib/constants";

const CHIPS = ["milestone", "work", "grateful", "fun", "travel", "creative"] as const;
const MOMENT = "Shipped the thing I was scared of. Coffee tasted better after.";

function Typewriter({ text }: { text: string }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-15%" });
  const reduced = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduced) return;
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setN(i);
      if (i >= text.length) clearInterval(id);
    }, 26);
    return () => clearInterval(id);
  }, [inView, text, reduced]);

  const shown = reduced ? text : text.slice(0, n);
  return (
    <p ref={ref} className="text-[color:var(--ink)]">
      {shown}
      <span className="caret">▋</span>
    </p>
  );
}

export function KeyMomentsDemo() {
  const meta = CHIPS.map((k) => TAGS.find((t) => t.key === k)!);

  return (
    <div className="mt-5">
      <div className="mb-4 flex flex-wrap gap-2">
        {meta.map((t, i) => (
          <motion.span
            key={t.key}
            className="chip"
            style={{ color: t.color }}
            initial={{ opacity: 0, scale: 0, rotate: -12 }}
            whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ type: "spring", stiffness: 500, damping: 14, delay: i * 0.08 }}
            whileHover={{ y: -3, rotate: -3 }}
          >
            {t.emoji} {t.label}
          </motion.span>
        ))}
      </div>
      <div className="clay-well p-4">
        <div className="mb-1 text-xs font-bold tracking-widest text-[color:var(--muted-2)]">
          TUE · 14:32
        </div>
        <Typewriter text={MOMENT} />
      </div>
    </div>
  );
}
