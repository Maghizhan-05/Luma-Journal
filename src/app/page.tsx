import Link from "next/link";
import { PopHeading } from "@/components/ui/PopHeading";
import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { APP_NAME, APP_TAGLINE } from "@/lib/constants";

const features = [
  { no: "01", emoji: "📸", accent: "var(--bubble)", title: "Photo Wall", copy: "Drop the day's photos straight from your phone — each with an optional note underneath. Compressed, alt-texted, effortless." },
  { no: "02", emoji: "⭐", accent: "var(--peach)", title: "Key Moments", copy: "Jot what mattered and sticker it with a tag. Search back across everything by word, tag or date in a heartbeat." },
  { no: "03", emoji: "💸", accent: "var(--mint)", title: "Money Tracker", copy: "Log what you spent and earned, in any currency, with budgets — and read it back as clean, quiet analytics." },
  { no: "04", emoji: "🗓️", accent: "var(--sky)", title: "Every view", copy: "Today, this week, the month calendar, and a whole-year heatmap that lights up with every day you show up." },
  { no: "05", emoji: "🔥", accent: "var(--butter)", title: "Streaks & gentle nudges", copy: "Keep your run alive. A soft email reminder finds you — but only on the days you actually forget." },
] as const;

export default function Landing() {
  return (
    <main className="relative flex-1 overflow-hidden">
      {/* Nav */}
      <header className="sticky top-0 z-20 px-4 pt-4">
        <nav className="clay mx-auto flex max-w-4xl items-center justify-between rounded-[var(--r-pill)] px-4 py-2.5 sm:px-6">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="type-heading text-xl">{APP_NAME}</span>
            <span className="hidden text-xs text-[color:var(--muted)] sm:inline">{APP_TAGLINE}</span>
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/login"><Button variant="ghost" size="sm">Log in</Button></Link>
            <Link href="/signup"><Button size="sm">Sign up</Button></Link>
          </div>
        </nav>
      </header>

      {/* Hero — text-forward, subtle drifting glow behind */}
      <section className="relative mx-auto max-w-3xl px-5 pt-24 pb-28 text-center sm:pt-32">
        <div className="glow-orb left-[15%] top-[8%] h-72 w-72" style={{ background: "radial-gradient(circle, rgba(230,181,102,0.22), transparent 70%)" }} />
        <div className="glow-orb right-[12%] top-[30%] h-64 w-64" style={{ background: "radial-gradient(circle, rgba(169,155,207,0.18), transparent 70%)", animationDelay: "-6s" }} />

        <Reveal>
          <p className="mb-6 text-xs font-bold uppercase tracking-[0.32em] text-[color:var(--muted)]">
            A diary you&apos;ll actually keep
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <PopHeading as="h1" className="relative text-5xl leading-[1.05] sm:text-7xl">
            Your whole day,
            <br />
            <span className="marker">one</span> quiet{" "}
            <span className="marker peach">diary.</span>
          </PopHeading>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mx-auto mt-7 max-w-md text-[color:var(--ink-soft)]">
            {APP_NAME} keeps your journal, photos, key moments and money in one
            calm, dark, tactile place — with weekly, monthly and yearly views.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Link href="/signup"><Button size="lg">Start your diary →</Button></Link>
            <Link href="/login"><Button variant="clay" size="lg">I have an account</Button></Link>
          </div>
          <p className="mt-4 text-xs text-[color:var(--muted-2)]">
            free to start · works beautifully on your phone
          </p>
        </Reveal>
      </section>

      {/* Features — stacked full-width rows, each revealing on scroll */}
      <section className="relative z-10 mx-auto max-w-3xl px-5 pb-24">
        <div className="flex flex-col gap-5">
          {features.map((f, i) => (
            <Reveal key={f.no} delay={i * 0.03}>
              <div
                className="clay flex items-start gap-5 p-6 sm:p-8"
                style={{ boxShadow: `var(--clay-shadow), var(--clay-inset), 0 0 60px -30px ${f.accent}` }}
              >
                <div
                  className="grid h-14 w-14 shrink-0 place-items-center rounded-[var(--r-md)] text-2xl"
                  style={{ background: `color-mix(in srgb, ${f.accent} 16%, var(--surface))`, boxShadow: "var(--clay-inset)" }}
                >
                  {f.emoji}
                </div>
                <div className="min-w-0">
                  <div className="mb-1 flex items-center gap-3">
                    <span className="text-xs font-bold tracking-widest text-[color:var(--muted-2)]">{f.no}</span>
                    <h3 className="type-heading text-xl" style={{ color: f.accent }}>{f.title}</h3>
                  </div>
                  <p className="text-[color:var(--ink-soft)]">{f.copy}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Closing CTA */}
      <section className="relative z-10 mx-auto max-w-2xl px-5 pb-28 text-center">
        <Reveal>
          <PopHeading as="h2" className="text-3xl sm:text-4xl">
            Today&apos;s worth <span className="marker">keeping.</span>
          </PopHeading>
          <div className="mt-7">
            <Link href="/signup"><Button size="lg">Start your diary →</Button></Link>
          </div>
        </Reveal>
      </section>

      <footer className="relative z-10 px-4 py-10 text-center text-sm text-[color:var(--muted-2)]">
        <span className="type-heading text-base">{APP_NAME}</span> · {APP_TAGLINE}
      </footer>
    </main>
  );
}
