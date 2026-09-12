import type { Metadata } from "next";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = { title: "Sign up" };

export default function SignupPage() {
  return (
    <GlassCard padding="lg">
      <PopHeading as="h1" className="mb-1 text-2xl">
        Start your <span className="marker peach">diary</span> ✨
      </PopHeading>
      <p className="mb-5 text-sm text-[color:var(--muted)]">
        One happy place for your days, photos, moments and money.
      </p>
      <AuthForm mode="signup" />
    </GlassCard>
  );
}
