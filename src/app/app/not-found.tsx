import Link from "next/link";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { Button } from "@/components/ui/Button";

/** In-app 404 — renders inside the app shell (nav stays). */
export default function AppNotFound() {
  return (
    <GlassCard padding="lg" className="mx-auto max-w-md text-center">
      <div className="text-5xl">🗺️</div>
      <PopHeading as="h1" className="mt-4 text-2xl">
        Nothing here <span className="marker">yet.</span>
      </PopHeading>
      <p className="mt-2 text-sm text-[color:var(--ink-soft)]">
        That day or page doesn&apos;t exist. Let&apos;s head back to today.
      </p>
      <div className="mt-6">
        <Link href="/app"><Button size="lg">Back to today →</Button></Link>
      </div>
    </GlassCard>
  );
}
