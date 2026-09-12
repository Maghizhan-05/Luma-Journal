import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { PopHeading } from "@/components/ui/PopHeading";
import { APP_NAME } from "@/lib/constants";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-5 py-16 text-center">
      <span className="type-heading text-7xl" style={{ color: "var(--accent)" }}>4🔍4</span>
      <PopHeading as="h1" className="mt-6 text-3xl">
        This page slipped out of the <span className="marker">diary.</span>
      </PopHeading>
      <p className="mt-3 max-w-sm text-[color:var(--ink-soft)]">
        The page you were looking for isn&apos;t here — maybe it was never written.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link href="/app"><Button size="lg">Go to today →</Button></Link>
        <Link href="/"><Button variant="clay" size="lg">Back home</Button></Link>
      </div>
      <p className="mt-10 text-xs text-[color:var(--muted-2)]">{APP_NAME} · your day&apos;s diary</p>
    </main>
  );
}
