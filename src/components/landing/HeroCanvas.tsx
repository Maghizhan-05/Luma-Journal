"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { FloatingObjects } from "./FloatingObjects";

// Three.js scene is client-only and heavy — load it lazily, never on the server.
// While it loads (and on the server) the crafted SVG clay objects show.
const Hero3D = dynamic(() => import("./Hero3D"), {
  ssr: false,
  loading: () => <FloatingObjects />,
});

function prefersReduced() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Landing hero visual. Renders the interactive Three.js scene, but shows the
 * crafted SVG clay objects whenever the viewer prefers reduced motion.
 */
export function HeroCanvas() {
  const [reduced, setReduced] = useState(prefersReduced);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = (e: MediaQueryListEvent) => setReduced(e.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return (
    <div className="relative aspect-square w-full max-w-lg cursor-grab active:cursor-grabbing">
      {reduced ? <FloatingObjects /> : <Hero3D />}
    </div>
  );
}
