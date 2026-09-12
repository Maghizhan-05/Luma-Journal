import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { Button } from "@/components/ui/Button";
import { APP_NAME } from "@/lib/constants";

const features = [
  { emoji: "📸", accent: "candy", title: "Photo Wall", copy: "Drop the day's photos straight from your phone. Add an optional note under each one." },
  { emoji: "⭐", accent: "sunset", title: "Key Moments", copy: "Capture what mattered with colorful tags — then search across everything later." },
  { emoji: "💸", accent: "mint", title: "Money Tracker", copy: "Log what you spent and received, multi-currency, with budgets and donut analytics." },
  { emoji: "🗓️", accent: "sky", title: "Every view", copy: "Today, weekly, monthly calendar and a yearly heatmap of your streaks." },
  { emoji: "📊", accent: "grape", title: "Analytics", copy: "See your spending, income and moments trend over time at a glance." },
  { emoji: "🔥", accent: "lemon", title: "Streaks & nudges", copy: "Keep your run alive with gentle daily & weekly email reminders — only when you skip." },
] as const;

export default function Landing() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <nav className="glass glass-strong mx-auto flex max-w-5xl items-center justify-between rounded-[var(--r-pill)] px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-center gap-2 font-bold">
            <span className="text-xl">🗒️</span>
            <span className="pop-heading text-lg">{APP_NAME}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Sign up</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="mx-auto max-w-5xl px-4 pt-14 pb-8 text-center sm:pt-20">
        <span className="chip mx-auto mb-5 w-fit" style={{ color: "var(--grape)" }}>
          ✨ Journaling, but make it fun
        </span>
        <PopHeading as="h1" className="text-4xl leading-[1.05] sm:text-6xl">
          Your whole day,
          <br /> in one happy place.
        </PopHeading>
        <p className="mx-auto mt-5 max-w-xl text-base text-[color:var(--muted)] sm:text-lg">
          {APP_NAME} blends a daily journal, a photo wall, key moments and a money
          tracker into one calm, glassy space — with weekly, monthly and yearly views.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link href="/signup"><Button size="lg">Start journaling — it&apos;s free</Button></Link>
          <Link href="/login"><Button variant="glass" size="lg">I have an account</Button></Link>
        </div>
      </section>

      {/* Feature grid */}
      <section className="mx-auto max-w-5xl px-4 pb-20">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} accent={f.accent} padding="lg" className="text-left">
              <div className="mb-3 text-3xl">{f.emoji}</div>
              <h3 className="mb-1.5 font-display text-lg font-semibold">{f.title}</h3>
              <p className="text-sm text-[color:var(--muted)]">{f.copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="border-t border-[color:var(--hairline)] px-4 py-8 text-center text-sm text-[color:var(--muted-2)]">
        {APP_NAME} · made for keeping days worth remembering.
      </footer>
    </main>
  );
}
