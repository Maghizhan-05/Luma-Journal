import { TAG_MAP, type TagKey } from "@/lib/constants";
import { formatLong } from "@/lib/date";

export type ShareFormat = "story" | "portrait" | "square" | "landscape";

export const FORMATS: Record<ShareFormat, { w: number; h: number; label: string; hint: string }> = {
  story: { w: 1080, h: 1920, label: "Story", hint: "9:16" },
  portrait: { w: 1080, h: 1350, label: "Portrait", hint: "4:5" },
  square: { w: 1080, h: 1080, label: "Post", hint: "1:1" },
  landscape: { w: 1080, h: 566, label: "Landscape", hint: "1.91:1" },
};

interface MomentCardData {
  title: string;
  description?: string | null;
  date: string;
  tags: TagKey[];
}

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

/** Render a shareable card for a key moment in the given Instagram format. */
export async function renderMomentCard(data: MomentCardData, format: ShareFormat = "square"): Promise<Blob> {
  const { w: W, h: H } = FORMATS[format];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const tall = H > 1200;
  const short = H < 800;

  // Background + soft accent glow
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);
  const glow = ctx.createRadialGradient(W * 0.2, H * 0.12, 0, W * 0.2, H * 0.12, W * 1.1);
  glow.addColorStop(0, "rgba(230,181,102,0.22)");
  glow.addColorStop(1, "rgba(230,181,102,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Card panel
  const m = Math.round(W * 0.055);
  ctx.fillStyle = CARD;
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 44);
  ctx.fill();

  const padX = m + 56;
  const padTop = m + (short ? 34 : 56);
  const padBottom = H - m - (short ? 34 : 56);
  ctx.textBaseline = "top";

  // Top block: wordmark + date
  ctx.fillStyle = ACCENT;
  ctx.font = "700 40px 'Courier New', monospace";
  ctx.fillText("LUMA", padX, padTop);
  ctx.fillStyle = MUTED;
  ctx.font = "400 26px 'Courier New', monospace";
  ctx.fillText(formatLong(data.date), padX, padTop + 52);
  const topBottom = padTop + 96;

  // Bottom block reserved height (tags + footer)
  const bottomReserved = 120;
  const bottomTop = padBottom - bottomReserved;

  // Measure title + description to center vertically in the middle band
  ctx.font = "700 62px 'Courier New', monospace";
  const titleLines = wrap(ctx, data.title, W - padX * 2).slice(0, tall ? 6 : 4);
  const titleH = titleLines.length * 76;
  ctx.font = "400 32px 'Courier New', monospace";
  const descLines = data.description ? wrap(ctx, data.description, W - padX * 2).slice(0, tall ? 8 : short ? 2 : 5) : [];
  const descH = descLines.length ? 16 + descLines.length * 46 : 0;
  const contentH = titleH + descH;

  const band = bottomTop - topBottom;
  let y = topBottom + Math.max(24, (band - contentH) / 2);

  // Title
  ctx.fillStyle = INK;
  ctx.font = "700 62px 'Courier New', monospace";
  for (const l of titleLines) { ctx.fillText(l, padX, y); y += 76; }

  // Description
  if (descLines.length) {
    ctx.fillStyle = MUTED;
    ctx.font = "400 32px 'Courier New', monospace";
    y += 16;
    for (const l of descLines) { ctx.fillText(l, padX, y); y += 46; }
  }

  // Tag chips
  let cx = padX;
  const cy = padBottom - 92;
  ctx.font = "700 26px 'Courier New', monospace";
  for (const tag of data.tags.slice(0, 4)) {
    const meta = TAG_MAP[tag];
    if (!meta) continue;
    const label = `${meta.emoji} ${meta.label}`;
    const cw = ctx.measureText(label).width + 40;
    if (cx + cw > W - padX) break;
    const color = TAG_HEX[tag] ?? ACCENT;
    ctx.fillStyle = color;
    ctx.globalAlpha = 0.22;
    roundRect(ctx, cx, cy, cw, 48, 24);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.fillStyle = color;
    ctx.fillText(label, cx + 20, cy + 10);
    cx += cw + 14;
  }

  // Footer
  ctx.fillStyle = MUTED;
  ctx.font = "400 24px 'Courier New', monospace";
  ctx.fillText("your day's diary", padX, padBottom - 30);

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
