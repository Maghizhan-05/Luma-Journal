import { TAG_MAP, type TagKey } from "@/lib/constants";
import { formatLong } from "@/lib/date";

export type ShareFormat = "story" | "portrait" | "square" | "landscape";
export type ShareStyle = "scatter" | "confetti" | "aurora" | "minimal";

export const FORMATS: Record<ShareFormat, { w: number; h: number; label: string; hint: string }> = {
  story: { w: 1080, h: 1920, label: "Story", hint: "9:16" },
  portrait: { w: 1080, h: 1350, label: "Portrait", hint: "4:5" },
  square: { w: 1080, h: 1080, label: "Post", hint: "1:1" },
  landscape: { w: 1080, h: 566, label: "Landscape", hint: "1.91:1" },
};

export const STYLES: { key: ShareStyle; label: string }[] = [
  { key: "scatter", label: "✨ Scatter" },
  { key: "confetti", label: "🎉 Confetti" },
  { key: "aurora", label: "🌌 Aurora" },
  { key: "minimal", label: "⬛ Minimal" },
];

interface MomentCardData {
  title: string;
  description?: string | null;
  date: string;
  tags: TagKey[];
}

const BG = "#0a0a0b";
const INK = "#f0ede6";
const MUTED = "#948f85";
const ACCENT = "#e6b566";
const PALETTE = ["#e6b566", "#e0a17f", "#d97b6c", "#86a7c9", "#7fb59d", "#a99bcf", "#b58fb0"];
const TAG_HEX: Record<string, string> = {
  work: "#86a7c9", family: "#e0a17f", friends: "#b58fb0", health: "#7fb59d",
  travel: "#86a7c9", money: "#7fb59d", learning: "#a99bcf", creative: "#b58fb0",
  milestone: "#e6c07a", fun: "#a99bcf", hard_day: "#d97b6c", grateful: "#e0a17f",
};
const DEFAULT_EMOJI = ["✨", "📖", "🌙", "☕", "🌿", "⭐", "💭", "🔖", "🕰️", "🌱"];

/** Deterministic PRNG so a given moment always renders identically. */
function rngFrom(seed: string) {
  let s = 0;
  for (const ch of seed) s = (s * 31 + ch.charCodeAt(0)) >>> 0;
  return function () {
    s += 0x6d2b79f5;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

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

function drawBackground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  style: ShareStyle,
  data: MomentCardData,
  rand: () => number,
) {
  ctx.fillStyle = BG;
  ctx.fillRect(0, 0, W, H);

  // Base warm glow present in every style
  const g = ctx.createRadialGradient(W * 0.2, H * 0.12, 0, W * 0.2, H * 0.12, W * 1.1);
  g.addColorStop(0, "rgba(230,181,102,0.16)");
  g.addColorStop(1, "rgba(230,181,102,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  if (style === "aurora") {
    for (let i = 0; i < 6; i++) {
      const cx = rand() * W;
      const cy = rand() * H;
      const r = W * (0.4 + rand() * 0.5);
      const color = PALETTE[Math.floor(rand() * PALETTE.length)];
      const rg = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
      rg.addColorStop(0, hexA(color, 0.28));
      rg.addColorStop(1, hexA(color, 0));
      ctx.fillStyle = rg;
      ctx.fillRect(0, 0, W, H);
    }
  } else if (style === "confetti") {
    for (let i = 0; i < 90; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const s = 8 + rand() * 20;
      const color = PALETTE[Math.floor(rand() * PALETTE.length)];
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rand() - 0.5) * 2);
      ctx.globalAlpha = 0.18 + rand() * 0.35;
      ctx.fillStyle = color;
      if (rand() > 0.5) {
        roundRect(ctx, -s / 2, -s / 4, s, s / 2, s / 6);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, s / 2.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  } else if (style === "scatter") {
    const emojis = data.tags.length
      ? data.tags.map((t) => TAG_MAP[t]?.emoji).filter(Boolean) as string[]
      : DEFAULT_EMOJI;
    const pool = [...emojis, ...DEFAULT_EMOJI];
    for (let i = 0; i < 34; i++) {
      const x = rand() * W;
      const y = rand() * H;
      const size = 44 + rand() * 92;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate((rand() - 0.5) * 1.1);
      ctx.globalAlpha = 0.06 + rand() * 0.1;
      ctx.font = `${size}px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(pool[Math.floor(rand() * pool.length)], 0, 0);
      ctx.restore();
    }
    ctx.textAlign = "left";
  }

  // Legibility scrim (darker toward the top-left where the wordmark/title sit)
  if (style !== "minimal") {
    const scrim = ctx.createLinearGradient(0, 0, W * 0.4, H);
    scrim.addColorStop(0, "rgba(10,10,11,0.62)");
    scrim.addColorStop(0.55, "rgba(10,10,11,0.5)");
    scrim.addColorStop(1, "rgba(10,10,11,0.66)");
    ctx.fillStyle = scrim;
    ctx.fillRect(0, 0, W, H);
  }
}

/** Render a shareable card for a key moment (format + decorative style). */
export async function renderMomentCard(
  data: MomentCardData,
  format: ShareFormat = "square",
  style: ShareStyle = "scatter",
): Promise<Blob> {
  const { w: W, h: H } = FORMATS[format];
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;
  const rand = rngFrom(data.title + data.date);
  const tall = H > 1200;
  const short = H < 800;

  drawBackground(ctx, W, H, style, data, rand);

  // Rounded frame that lets the decoration breathe around the content
  const m = Math.round(W * 0.05);
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  roundRect(ctx, m, m, W - m * 2, H - m * 2, 40);
  ctx.stroke();

  const padX = m + 52;
  const padTop = m + (short ? 32 : 54);
  const padBottom = H - m - (short ? 32 : 54);
  ctx.textBaseline = "top";
  ctx.textAlign = "left";

  // Top: wordmark + date
  ctx.fillStyle = ACCENT;
  ctx.font = "700 40px 'Courier New', monospace";
  ctx.fillText("LUMA", padX, padTop);
  ctx.fillStyle = MUTED;
  ctx.font = "400 26px 'Courier New', monospace";
  ctx.fillText(formatLong(data.date), padX, padTop + 52);
  const topBottom = padTop + 96;

  const bottomReserved = 120;
  const bottomTop = padBottom - bottomReserved;

  ctx.font = "700 62px 'Courier New', monospace";
  const titleLines = wrap(ctx, data.title, W - padX * 2).slice(0, tall ? 6 : 4);
  const titleH = titleLines.length * 76;
  ctx.font = "400 32px 'Courier New', monospace";
  const descLines = data.description ? wrap(ctx, data.description, W - padX * 2).slice(0, tall ? 8 : short ? 2 : 5) : [];
  const descH = descLines.length ? 16 + descLines.length * 46 : 0;
  const contentH = titleH + descH;

  const band = bottomTop - topBottom;
  let y = topBottom + Math.max(24, (band - contentH) / 2);

  // Title with a soft shadow for contrast over decoration
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.6)";
  ctx.shadowBlur = 16;
  ctx.fillStyle = INK;
  ctx.font = "700 62px 'Courier New', monospace";
  for (const l of titleLines) { ctx.fillText(l, padX, y); y += 76; }
  ctx.restore();

  if (descLines.length) {
    ctx.save();
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#cfcbc2";
    ctx.font = "400 32px 'Courier New', monospace";
    y += 16;
    for (const l of descLines) { ctx.fillText(l, padX, y); y += 46; }
    ctx.restore();
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
    ctx.fillStyle = "rgba(20,20,22,0.72)";
    roundRect(ctx, cx, cy, cw, 48, 24);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.fillText(label, cx + 20, cy + 10);
    cx += cw + 14;
  }

  ctx.fillStyle = MUTED;
  ctx.font = "400 24px 'Courier New', monospace";
  ctx.fillText("your day's diary", padX, padBottom - 30);

  return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), "image/png"));
}

function hexA(hex: string, a: number): string {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
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
