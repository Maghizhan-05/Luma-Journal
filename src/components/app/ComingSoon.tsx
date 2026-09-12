import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";

/** Temporary placeholder for routes built in later phases. */
export function ComingSoon({
  emoji,
  title,
  phase,
  children,
}: {
  emoji: string;
  title: string;
  phase: string;
  children?: React.ReactNode;
}) {
  return (
    <GlassCard padding="lg" className="text-center">
      <div className="mb-3 text-4xl">{emoji}</div>
      <PopHeading as="h1" className="text-2xl">
        {title}
      </PopHeading>
      <p className="mt-2 text-sm text-[color:var(--muted)]">
        {children ?? "Coming together soon."}
      </p>
      <span className="chip mt-4 inline-flex" style={{ color: "var(--sky)" }}>
        🚧 {phase}
      </span>
    </GlassCard>
  );
}
