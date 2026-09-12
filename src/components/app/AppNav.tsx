"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/lib/constants";

const links = [
  { href: "/app", label: "Today", emoji: "☀️", exact: true },
  { href: "/app/week", label: "Week", emoji: "🗓️" },
  { href: "/app/month", label: "Month", emoji: "📅" },
  { href: "/app/year", label: "Year", emoji: "🔥" },
  { href: "/app/moments", label: "Moments", emoji: "⭐" },
  { href: "/app/finance", label: "Money", emoji: "💸" },
  { href: "/app/analytics", label: "Stats", emoji: "📊" },
];

function isActive(pathname: string, href: string, exact?: boolean) {
  return exact ? pathname === href : pathname.startsWith(href);
}

export function AppNav({ children }: { children?: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <>
      {/* Top bar (all sizes) */}
      <header className="sticky top-0 z-30 px-3 pt-3 sm:px-4 sm:pt-4">
        <nav className="clay mx-auto flex max-w-6xl items-center justify-between gap-2 rounded-[var(--r-pill)] px-3 py-2 sm:px-5">
          <Link href="/app" className="flex shrink-0 items-center gap-2 font-bold">
            <span className="text-lg">🗒️</span>
            <span className="pop-heading hidden text-lg sm:inline">{APP_NAME}</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden items-center gap-1 md:flex">
            {links.map((l) => {
              const active = isActive(pathname, l.href, l.exact);
              return (
                <Link
                  key={l.href}
                  href={l.href}
                  className={`rounded-[var(--r-pill)] px-3 py-1.5 text-sm font-semibold transition ${
                    active
                      ? "bg-[color-mix(in_srgb,var(--accent)_16%,transparent)] text-[color:var(--accent)]"
                      : "text-[color:var(--muted)] hover:text-[color:var(--foreground)]"
                  }`}
                >
                  {l.label}
                </Link>
              );
            })}
          </div>

          <div className="flex shrink-0 items-center gap-2">{children}</div>
        </nav>
      </header>

      {/* Bottom tab bar (mobile) */}
      <nav className="clay fixed inset-x-3 bottom-3 z-30 flex items-center justify-around rounded-[var(--r-pill)] px-1 py-1.5 md:hidden">
        {links.map((l) => {
          const active = isActive(pathname, l.href, l.exact);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-label={l.label}
              className={`flex min-w-0 flex-col items-center gap-0.5 rounded-[var(--r-md)] px-2 py-1 text-[0.62rem] font-semibold transition ${
                active ? "text-[color:var(--accent)]" : "text-[color:var(--muted-2)]"
              }`}
            >
              <span className="text-base leading-none">{l.emoji}</span>
              <span className="truncate">{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
