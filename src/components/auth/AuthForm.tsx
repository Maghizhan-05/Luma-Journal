"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";
import Link from "next/link";
import { signIn, signUp, type AuthState } from "@/lib/auth-actions";
import { Button } from "@/components/ui/Button";

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" className="w-full" disabled={pending}>
      {pending ? "One sec…" : label}
    </Button>
  );
}

export function AuthForm({
  mode,
  next,
}: {
  mode: "login" | "signup";
  next?: string;
}) {
  const action = mode === "login" ? signIn : signUp;
  const [state, formAction] = useActionState<AuthState, FormData>(action, {});

  return (
    <form action={formAction} className="flex flex-col gap-3.5">
      {next ? <input type="hidden" name="next" value={next} /> : null}

      {mode === "signup" && (
        <label className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-[color:var(--muted)]">
            Your name
          </span>
          <input
            name="display_name"
            type="text"
            autoComplete="name"
            placeholder="Alex"
            className="field"
          />
        </label>
      )}

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[color:var(--muted)]">
          Email
        </span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          placeholder="you@email.com"
          className="field"
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium text-[color:var(--muted)]">
          Password
        </span>
        <input
          name="password"
          type="password"
          required
          autoComplete={mode === "login" ? "current-password" : "new-password"}
          placeholder={mode === "signup" ? "At least 8 characters" : "••••••••"}
          className="field"
        />
      </label>

      {state.error && (
        <p
          role="alert"
          className="rounded-[var(--r-md)] bg-[color-mix(in_srgb,var(--coral)_14%,transparent)] px-3.5 py-2.5 text-sm text-[color:var(--coral)]"
        >
          {state.error}
        </p>
      )}
      {state.message && (
        <p
          role="status"
          className="rounded-[var(--r-md)] bg-[color-mix(in_srgb,var(--mint)_16%,transparent)] px-3.5 py-2.5 text-sm text-[color:var(--foreground)]"
        >
          {state.message}
        </p>
      )}

      <div className="mt-1">
        <SubmitButton label={mode === "login" ? "Log in" : "Create account"} />
      </div>

      <p className="mt-1 text-center text-sm text-[color:var(--muted)]">
        {mode === "login" ? (
          <>
            New here?{" "}
            <Link href="/signup" className="font-semibold text-[color:var(--accent)]">
              Create an account
            </Link>
          </>
        ) : (
          <>
            Already have one?{" "}
            <Link href="/login" className="font-semibold text-[color:var(--accent)]">
              Log in
            </Link>
          </>
        )}
      </p>
    </form>
  );
}
