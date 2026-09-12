import type { Metadata } from "next";
import { format } from "date-fns";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";

export const metadata: Metadata = { title: "Today" };

function greeting(h: number) {
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

/**
 * Today (Current view) — mirrors the sketch's main screen:
 * left rail (To-Do, Photo Wall, Key Moments), center Journal, bottom Money.
 * Cards are wired to data in Phase 2+.
 */
export default function TodayPage() {
  const now = new Date();
  const today = format(now, "EEEE, d MMMM yyyy");

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <PopHeading as="h1" className="text-3xl sm:text-4xl">
            {greeting(now.getHours())} ✨
          </PopHeading>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{today}</p>
        </div>
        <span className="chip" style={{ color: "var(--lemon)" }}>
          🔥 Streak starts today
        </span>
      </header>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_1.4fr]">
        {/* Left rail */}
        <div className="flex flex-col gap-4">
          <GlassCard accent="grape">
            <h2 className="mb-2 font-display font-semibold">✅ To-Do</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Your checklist for the day lands here.
            </p>
          </GlassCard>

          <GlassCard accent="candy">
            <h2 className="mb-2 font-display font-semibold">📸 Photo Wall</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Add photos from your phone, each with an optional note.
            </p>
          </GlassCard>

          <GlassCard accent="sunset">
            <h2 className="mb-2 font-display font-semibold">⭐ Key Moments</h2>
            <p className="text-sm text-[color:var(--muted)]">
              Capture what mattered, tag it, find it later.
            </p>
          </GlassCard>
        </div>

        {/* Center: journal */}
        <GlassCard accent="grape" padding="lg" className="min-h-[22rem]">
          <h2 className="mb-3 font-display text-lg font-semibold">
            📖 Journal of the day
          </h2>
          <p className="text-sm text-[color:var(--muted)]">
            The big writing space — dictation-friendly — goes here in Phase 2.
          </p>
        </GlassCard>
      </div>

      {/* Bottom: money */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <GlassCard accent="coral">
          <h2 className="mb-1 font-display font-semibold">💸 Money spent</h2>
          <p className="text-2xl font-bold text-[color:var(--coral)]">—</p>
        </GlassCard>
        <GlassCard accent="mint">
          <h2 className="mb-1 font-display font-semibold">💰 Money received</h2>
          <p className="text-2xl font-bold text-[color:var(--mint)]">—</p>
        </GlassCard>
      </div>
    </div>
  );
}
