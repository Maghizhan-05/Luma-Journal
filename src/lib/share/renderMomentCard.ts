import { TAG_MAP, type TagKey } from "@/lib/constants";
import { formatLong } from "@/lib/date";

interface MomentCardData {
  title: string;
  description?: string | null;
  date: string;
  tags: TagKey[];
}

// Theme colors (canvas can't read CSS vars).
const BG = "#0a0a0b";
const CARD = "#141416";
const INK = "#f0ede6";
const MUTED = "#948f85";
const ACCENT = "#e6b566";
const TAG_HEX: Record<string, string> = {
  work: "#86a7c9", family: "#e0a17f", friends: "#b58fb0", health: "#7fb59d",
  travel: "#86a7c9", money: "#7fb59d", learning: "#a99bcf", creative: "#b58fb0",
  milestone: "#e6c07a", fun: "#a99bcf", hard_day: "#d97b6c", grateful: "#e0a17f",
};

function wrap(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else line = test;
  }
  if (line) lines.push(line);
  return lines;
}

/** Render a 1080×1080 shareable card for a key moment. Returns a PNG blob. */
export async function renderMomentCard(data: MomentCardData): Promise<Blob> {
  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  // Background + soft accent glow
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, S, S);
  const glow = ctx.createRadialGradient(S * 0.2, S * 0.1, 0, S * 0.2, S * 0.1, S * 0.9);
  glow.addColorStop(0, "rgba(230,181,102,0.22)");
  glow.addColorStop(1, "rgba(230,181,102,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, S, S);

  // Card panel
  const m = 72;
  ctx.fillStyle = CARD;
  roundRect(ctx, m, m, S - m * 2, S - m * 2, 44);
  ctx.fill();

  const pad = m + 56;
  ctx.textBaseline = "top";

  // Wordmark + date
  ctx.fillStyle = ACCENT;
  ctx.font = "700 40px 'Courier New', monospace";
  ctx.fillText("LUMA", pad, pad);
  ctx.fillStyle = MUTED;
  ctx.font = "400 26px 'Courier New', monospace";
  const dateStr = formatLong(data.date);
  ctx.fillText(dateStr, pad, pad + 52);

  // Title
  ctx.fillStyle = INK;
  ctx.font = "700 64px 'Courier New', monospace";
  const titleLines = wrap(ctx, data.title, S - pad * 2).slice(0, 4);
  let y = pad + 150;
  for (const l of titleLines) {
    ctx.fillText(l, pad, y);
    y += 78;
  }

  // Description
  if (data.description) {
    ctx.fillStyle = MUTED;
    ctx.font = "400 32px 'Courier New', monospace";
    const descLines = wrap(ctx, data.description, S - pad * 2).slice(0, 5);
    y += 16;
    for (const l of descLines) {
      ctx.fillText(l, pad, y);
      y += 46;
    }
  }

  // Tag chips (bottom)
  let cx = pad;
  const cy = S - pad - 44;
  ctx.font = "700 26px 'Courier New', monospace";
  for (const tag of data.tags.slice(0, 4)) {
    const meta = TAG_MAP[tag];
    if (!meta) continue;
    const label = `${meta.emoji} ${meta.label}`;
    const w = ctx.measureText(label).width + 40;
    if (cx + w > S - pad) break;
    ctx.fillStyle = TAG_HEX[tag] ?? ACCENT;
    roundRect(ctx, cx, cy, w, 48, 24);
    ctx.globalAlpha = 0.22;
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = TAG_HEX[tag] ?? ACCENT;
    ctx.fillText(label, cx + 20, cy + 10);
    cx += w + 14;
  }

  // Footer
  ctx.fillStyle = MUTED;
  ctx.font = "400 24px 'Courier New', monospace";
  ctx.fillText("your day's diary", pad, S - pad + 8);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}
