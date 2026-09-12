import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { Button } from "@/components/ui/Button";
import { HeroCanvas } from "@/components/landing/HeroCanvas";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const features = [
  { emoji: "📸", accent: "bubble", title: "Photo Wall", copy: "Drop the day's photos straight from your phone — each with an optional note underneath." },
  { emoji: "⭐", accent: "peach", title: "Key Moments", copy: "Jot what mattered, sticker it with a tag, and find it again in a heartbeat." },
  { emoji: "💸", accent: "mint", title: "Money Tracker", copy: "Log what you spent and earned, any currency, with budgets and tidy donut charts." },
  { emoji: "🗓️", accent: "sky", title: "Every view", copy: "Today, this week, the month calendar, and a whole-year heatmap of your streaks." },
  { emoji: "📊", accent: "lilac", title: "Gentle stats", copy: "See your spending, moods and moments drift over time — no spreadsheets required." },
  { emoji: "🔥", accent: "butter", title: "Streaks & nudges", copy: "A little email nudge keeps your run alive — but only on the days you forget." },
] as const;

export default function Landing() {
  return (
    <main className="flex-1">
      {/* Nav */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <nav className="clay mx-auto flex max-w-5xl items-center justify-between rounded-[var(--r-pill)] px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="type-heading text-xl">{APP_NAME}</span>
            <span className="hidden text-xs text-[color:var(--muted)] sm:inline">
              {APP_TAGLINE}
            </span>
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
      <section className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-6 px-4 pt-10 pb-6 md:grid-cols-2 md:pt-16">
        <div className="order-2 text-center md:order-1 md:text-left">
          <span className="chip mb-5 inline-flex" style={{ color: "var(--coral)" }}>
            ✶ a diary you&apos;ll actually keep
          </span>
          <PopHeading as="h1" className="text-4xl leading-[1.08] sm:text-5xl">
            Your whole day,
            <br /> in one <span className="marker">warm</span>{" "}
            <span className="marker peach">little diary.</span>
          </PopHeading>
          <p className="mx-auto mt-5 max-w-md text-[color:var(--ink-soft)] md:mx-0">
            {APP_NAME} keeps your journal, photos, key moments and money together
            in a cosy, tactile space — with weekly, monthly and yearly views.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link href="/signup"><Button size="lg">Start your diary →</Button></Link>
            <Link href="/login"><Button variant="clay" size="lg">I have an account</Button></Link>
          </div>
          <p className="mt-4 text-xs text-[color:var(--muted-2)]">
            free to start · works beautifully on your phone
          </p>
        </div>

        {/* 3D hero */}
        <div className="order-1 flex justify-center md:order-2">
          <HeroCanvas />
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-5xl px-4 pb-20 pt-6">
        <PopHeading as="h2" className="mb-6 text-center text-2xl sm:text-3xl">
          Everything about today, <span className="marker mint">in one place</span>
        </PopHeading>
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <GlassCard key={f.title} accent={f.accent} padding="lg" className="text-left">
              <div className="mb-3 text-3xl">{f.emoji}</div>
              <h3 className="mb-1.5 type-heading text-lg">{f.title}</h3>
              <p className="text-sm text-[color:var(--ink-soft)]">{f.copy}</p>
            </GlassCard>
          ))}
        </div>
      </section>

      <footer className="px-4 py-10 text-center text-sm text-[color:var(--muted-2)]">
        <span className="type-heading text-base">{APP_NAME}</span> · {APP_TAGLINE}
      </footer>
    </main>
  );
}
