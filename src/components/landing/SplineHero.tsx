"use client";

import { createElement, useEffect, useState } from "react";
import { FloatingObjects } from "./FloatingObjects";

const SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL;
// Spline's lightweight web-component viewer (avoids bundling the heavy runtime,
// which doesn't build under Turbopack). Loaded on the client only when needed.
const VIEWER_SRC =
  "https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js";

/**
 * Interactive 3D hero. When NEXT_PUBLIC_SPLINE_SCENE_URL points at a LUMA
 * Spline scene (books / pencils / bubbles), it renders that draggable scene
 * via <spline-viewer>. Until then it shows the crafted clay objects so the
 * hero is on-brand and never blank.
 */
export function SplineHero() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!SCENE_URL) return;
    if (customElements.get("spline-viewer")) {
      setReady(true);
      return;
    }
    const existing = document.querySelector(`script[src="${VIEWER_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => setReady(true));
      return;
    }
    const s = document.createElement("script");
    s.type = "module";
    s.src = VIEWER_SRC;
    s.onload = () => setReady(true);
    document.head.appendChild(s);
  }, []);

  if (!SCENE_URL) return <FloatingObjects />;

  return (
    <div className="relative aspect-square w-full max-w-lg">
      {ready ? (
        createElement("spline-viewer", {
          url: SCENE_URL,
          style: { width: "100%", height: "100%" },
        })
      ) : (
        <FloatingObjects />
      )}
    </div>
  );
}
