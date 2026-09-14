"use client";

import { useState } from "react";
import { renderMomentCard, FORMATS, STYLES, type ShareFormat, type ShareStyle } from "@/lib/share/renderMomentCard";
import type { TagKey } from "@/lib/constants";

interface Props {
  title: string;
  description?: string | null;
  date: string;
  tags: TagKey[];
  className?: string;
}

const ORDER: ShareFormat[] = ["story", "portrait", "square", "landscape"];

export function ShareMomentButton({ title, description, date, tags, className }: Props) {
  const [open, setOpen] = useState(false);
  const [format, setFormat] = useState<ShareFormat>("story");
  const [style, setStyle] = useState<ShareStyle>("scatter");
  const [url, setUrl] = useState<string | null>(null);
  const [blob, setBlob] = useState<Blob | null>(null);
  const [busy, setBusy] = useState(false);

  async function render(fmt: ShareFormat, sty: ShareStyle) {
    setBusy(true);
    const b = await renderMomentCard({ title, description, date, tags }, fmt, sty);
    setBlob(b);
    setUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(b);
    });
    setBusy(false);
  }

  function openCard() {
    setOpen(true);
    setFormat("story");
    setStyle("scatter");
    void render("story", "scatter");
  }
  function pickFormat(fmt: ShareFormat) { setFormat(fmt); void render(fmt, style); }
  function pickStyle(sty: ShareStyle) { setStyle(sty); void render(format, sty); }

  function close() {
    setOpen(false);
    if (url) URL.revokeObjectURL(url);
    setUrl(null);
    setBlob(null);
  }

  async function share() {
    if (!blob) return;
    const file = new File([blob], `luma-${format}.png`, { type: "image/png" });
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
    a.download = `luma-${format}.png`;
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
        <div className="fixed inset-0 z-[70] flex flex-col items-center justify-center gap-3 p-6" style={{ background: "color-mix(in srgb, var(--bg) 80%, transparent)", backdropFilter: "blur(6px)" }} onClick={close}>
          <div className="flex w-full max-w-sm flex-col items-center" onClick={(e) => e.stopPropagation()}>
            {/* Format tabs */}
            <div className="mb-2 flex flex-wrap justify-center gap-1.5">
              {ORDER.map((f) => {
                const on = format === f;
                return (
                  <button key={f} type="button" onClick={() => pickFormat(f)} className="chip text-xs" style={on ? { color: "var(--accent)", boxShadow: "var(--clay-inset), 0 0 0 1.5px var(--accent)" } : { opacity: 0.6 }}>
                    {FORMATS[f].label} · {FORMATS[f].hint}
                  </button>
                );
              })}
            </div>
            {/* Style tabs */}
            <div className="mb-3 flex flex-wrap justify-center gap-1.5">
              {STYLES.map((s) => {
                const on = style === s.key;
                return (
                  <button key={s.key} type="button" onClick={() => pickStyle(s.key)} className="chip text-xs" style={on ? { color: "var(--lilac)", boxShadow: "var(--clay-inset), 0 0 0 1.5px var(--lilac)" } : { opacity: 0.6 }}>
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Preview */}
            <div className="clay flex max-h-[52vh] items-center justify-center overflow-hidden p-3">
              {busy || !url ? (
                <div className="grid h-64 w-64 place-items-center text-sm text-[color:var(--muted)]">rendering…</div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={url} alt="Shareable moment card" className="max-h-[46vh] w-auto rounded-[var(--r-md)]" />
              )}
            </div>

            {/* Actions */}
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
