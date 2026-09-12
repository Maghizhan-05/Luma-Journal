"use client";

import { useState } from "react";
import { renderMomentCard } from "@/lib/share/renderMomentCard";
import type { TagKey } from "@/lib/constants";

interface Props {
  title: string;
  description?: string | null;
  date: string;
  tags: TagKey[];
  className?: string;
}

export function ShareMomentButton({ title, description, date, tags, className }: Props) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  async function openCard() {
    setBusy(true);
    setOpen(true);
    const b = await renderMomentCard({ title, description, date, tags });
    setBlob(b);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(b);
    });
    setBusy(false);
  }

  function close() {
    setOpen(false);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setBlob(null);
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], "luma-moment.png", { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "A moment from LUMA" });
        return;
      }
    } catch { /* fall through to download */ }
    download();
  }

  function download() {
    if (!url) return;
    const a = document.createElement("a");
    a.href = url;
    a.download = "luma-moment.png";
    a.click();
  }

  return (
    <>
      <button
        type="button"
        onClick={openCard}
        aria-label="Share this moment"
        className={className ?? "text-[color:var(--muted-2)] transition hover:text-[color:var(--accent)]"}
      >
        ↗
      </button>

      {open && (
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-4 p-6" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", backdropFilter: "blur(6px)" }} onClick={close}>
          <div className="w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="clay overflow-hidden p-3">
              {busy || !url ? (
                <div className="grid aspect-square place-items-center text-sm text-[color:var(--muted)]">rendering…</div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt="Shareable moment card" className="w-full rounded-[var(--r-md)]" />
              )}
            </div>
            <div className="mt-4 flex items-center justify-center gap-2">
              <button type="button" onClick={share} disabled={busy} className="rounded-[var(--r-pill)] px-5 py-2.5 text-sm font-bold disabled:opacity-60" style={{ background: "var(--accent)", color: "#17130a" }}>Share</button>
              <button type="button" onClick={download} disabled={busy} className="clay rounded-[var(--r-pill)] px-5 py-2.5 text-sm font-bold text-[color:var(--ink)]">Download</button>
              <button type="button" onClick={close} className="px-3 py-2.5 text-sm text-[color:var(--muted)]">close</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
