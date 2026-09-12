"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";

/** Faint oversized watermark word behind the hero, drifting slightly on scroll. */
export function HeroWatermark({ word = "today." }: { word?: string }) {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const x = useTransform(scrollYProgress, [0, 0.25], reduced ? [0, 0] : [0, -80]);
  const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <motion.div
      aria-hidden
      style={{ x, opacity }}
      className="pointer-events-none absolute inset-x-0 top-[34%] z-0 select-none text-center"
    >
      <span
        className="type-heading whitespace-nowrap text-[28vw] leading-none sm:text-[20vw]"
        style={{ color: "color-mix(in srgb, var(--ink) 5%, transparent)" }}
      >
        {word}
      </span>
    </motion.div>
  );
}
