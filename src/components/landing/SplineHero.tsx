"use client";

import { createElement, useEffect, useState } from "react";
import { FloatingObjects } from "./FloatingObjects";

const SCENE_URL = process.env.NEXT_PUBLIC_SPLINE_SCENE_URL;
// Spline's lightweight web-component viewer (avoids bundling the heavy runtime,
// which doesn't build under Turbopack). Loaded on the client only when needed.
const VIEWER_SRC =
  "https://unpkg.com/@splinetool/viewer@1.9.48/build/spline-viewer.js";

function viewerDefined() {
  return (
    typeof window !== "undefined" && !!window.customElements?.get("spline-viewer")
  );
}

/**
 * Interactive 3D hero. When NEXT_PUBLIC_SPLINE_SCENE_URL points at a LUMA
 * Spline scene (books / pencils / bubbles), it renders that draggable scene
 * via <spline-viewer>. Until then it shows the crafted clay objects so the
 * hero is on-brand and never blank.
 */
export function SplineHero() {
  // Seed from initial state so we don't call setState synchronously in effect.
  const [ready, setReady] = useState<boolean>(viewerDefined);

  useEffect(() => {
    if (!SCENE_URL || ready) return;

    const onLoad = () => setReady(true);
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${VIEWER_SRC}"]`,
    );
    if (existing) {
      existing.addEventListener("load", onLoad);
      return () => existing.removeEventListener("load", onLoad);
    }

    const s = document.createElement("script");
    s.type = "module";
    s.src = VIEWER_SRC;
    s.addEventListener("load", onLoad);
    document.head.appendChild(s);
    return () => s.removeEventListener("load", onLoad);
  }, [ready]);

  if (!SCENE_URL) return <FloatingObjects />;

  return (
    <div className="relative aspect-square w-full max-w-lg">
      {ready
        ? createElement("spline-viewer", {
            url: SCENE_URL,
            style: { width: "100%", height: "100%" },
          })
        : <FloatingObjects />}
    </div>
  );
}
