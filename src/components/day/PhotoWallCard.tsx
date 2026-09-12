"use client";

import { useRef, useState } from "react";
import imageCompression from "browser-image-compression";
import { createClient } from "@/lib/supabase/client";
import { addPhoto, deletePhoto } from "@/lib/actions/day";
import type { PhotoWithUrl } from "@/lib/data/day";

export function PhotoWallCard({
  date,
  userId,
  photos,
}: {
  date: string;
  userId: string;
  photos: PhotoWithUrl[];
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [alt, setAlt] = useState("");
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError(null);
  }

  function reset() {
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setAlt("");
    setCaption("");
    if (fileRef.current) fileRef.current.value = "";
  }

  async function upload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;
    if (!alt.trim()) {
      setError("Please add alt text (helps accessibility).");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const compressed = await imageCompression(file, {
        maxWidthOrHeight: 1600,
        maxSizeMB: 0.5,
        fileType: "image/webp",
        useWebWorker: true,
      });
      let width: number | undefined;
      let height: number | undefined;
      try {
        const bmp = await createImageBitmap(compressed);
        width = bmp.width;
        height = bmp.height;
        bmp.close();
      } catch {
        /* dimensions are optional */
      }

      const supabase = createClient();
      const path = `${userId}/${date}/${crypto.randomUUID()}.webp`;
      const { error: upErr } = await supabase.storage
        .from("photos")
        .upload(path, compressed, { contentType: "image/webp" });
      if (upErr) throw new Error(upErr.message);

      const res = await addPhoto({
        date,
        storage_path: path,
        alt_text: alt.trim(),
        caption: caption.trim() || undefined,
        width,
        height,
        size_bytes: compressed.size,
      });
      if (!res.ok) throw new Error(res.error ?? "Could not save photo");
      reset();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="type-heading" style={{ color: "var(--bubble)" }}>📸 Photo Wall</h2>
        {!file && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="text-xs font-bold"
            style={{ color: "var(--bubble)" }}
          >
            + add photo
          </button>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={pick}
        className="hidden"
      />

      {/* Upload form */}
      {file && (
        <form onSubmit={upload} className="mb-4 flex flex-col gap-2.5 rounded-[var(--r-md)] p-3" style={{ boxShadow: "var(--clay-inset)", background: "var(--bg-2)" }}>
          {preview && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={preview} alt="Selected preview" className="max-h-48 w-full rounded-[var(--r-sm)] object-cover" />
          )}
          <input
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Alt text (describe the photo) — required"
            className="field py-2 text-sm"
          />
          <input
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="A note about this moment (optional)"
            className="field py-2 text-sm"
          />
          {error && <p className="text-sm text-[color:var(--coral)]">{error}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} className="rounded-[var(--r-pill)] px-4 py-1.5 text-sm font-bold disabled:opacity-60" style={{ background: "var(--accent)", color: "#17130a" }}>
              {busy ? "uploading…" : "Add photo"}
            </button>
            <button type="button" onClick={reset} disabled={busy} className="text-sm text-[color:var(--muted)]">
              cancel
            </button>
          </div>
        </form>
      )}

      {/* Grid */}
      {photos.length > 0 ? (
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
          {photos.map((p) => (
            <figure key={p.id} className="group relative">
              {p.url ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={p.url} alt={p.alt_text} loading="lazy" className="aspect-square w-full rounded-[var(--r-sm)] object-cover" style={{ boxShadow: "var(--clay-inset)" }} />
              ) : (
                <div className="grid aspect-square w-full place-items-center rounded-[var(--r-sm)] text-2xl" style={{ background: "var(--bg-2)" }}>🖼️</div>
              )}
              <button
                type="button"
                onClick={() => deletePhoto(p.id, p.storage_path)}
                aria-label="Delete photo"
                className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full text-xs opacity-0 transition group-hover:opacity-100"
                style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}
              >
                ✕
              </button>
              {p.caption && (
                <figcaption className="mt-1 text-xs text-[color:var(--muted)]">{p.caption}</figcaption>
              )}
            </figure>
          ))}
        </div>
      ) : (
        !file && <p className="text-sm text-[color:var(--muted-2)]">No photos yet — add one from your phone.</p>
      )}
    </div>
  );
}
