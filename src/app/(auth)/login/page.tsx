import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Log in" };

export default async function LoginPage({ searchParams }: PageProps<"/login">) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : undefined;

  return (
    <GlassCard padding="lg" strong>
      <PopHeading as="h1" className="mb-1 text-2xl">
        Welcome back 👋
      </PopHeading>
      <p className="mb-5 text-sm text-[color:var(--muted)]">
        Log in to pick up your day where you left off.
      </p>
      <AuthForm mode="login" next={next} />
    </GlassCard>
  );
}
