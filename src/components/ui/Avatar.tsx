const PALETTE = ["#e6b566", "#e0a17f", "#d97b6c", "#8bb5ff", "#7fd8b4", "#a99bcf", "#ff9ec9"];

function initials(name: string | null | undefined, email: string): string {
  const src = (name || "").trim();
  if (src) {
    const parts = src.split(/\s+/);
    return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

function colorFor(seed: string): string {
  let h = 0;
  for (const ch of seed) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return PALETTE[h % PALETTE.length];
}

/** Deterministic initials avatar (no upload needed). */
export function Avatar({
  name,
  email,
  size = 40,
}: {
  name?: string | null;
  email: string;
  size?: number;
}) {
  const bg = colorFor(email);
  return (
    <span
      aria-hidden
      className="grid shrink-0 place-items-center rounded-full font-[family-name:var(--font-display)] font-bold"
      style={{
        width: size,
        height: size,
        background: bg,
        color: "#17130a",
        fontSize: size * 0.4,
        boxShadow: "var(--clay-inset)",
      }}
    >
      {initials(name, email)}
    </span>
  );
}
