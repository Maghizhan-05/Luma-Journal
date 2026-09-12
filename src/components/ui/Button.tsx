import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "clay" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-bold rounded-[var(--r-pill)] font-[family-name:var(--font-display)] tracking-tight transition-[transform,box-shadow,filter] duration-150 active:translate-y-[1px] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_35%,transparent)] disabled:opacity-55 disabled:pointer-events-none select-none";

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 h-9",
  md: "text-[0.95rem] px-5 h-11",
  lg: "text-base px-6 h-13",
};

// Puffy clay buttons: colored fill + soft outer shadow + inner rim light.
const variants: Record<Variant, string> = {
  // Warm gold glow with dark ink — pops on near-black without shouting.
  primary:
    "text-[#17130a] bg-[var(--accent)] [box-shadow:0_10px_30px_color-mix(in_srgb,var(--accent)_30%,transparent),inset_1px_1px_2px_rgba(255,255,255,0.4)] hover:brightness-[1.06] active:[box-shadow:var(--clay-press)]",
  clay:
    "clay text-[color:var(--ink)] hover:brightness-[1.15] active:[box-shadow:var(--clay-press)]",
  ghost:
    "text-[color:var(--ink-soft)] hover:bg-[color-mix(in_srgb,var(--ink)_9%,transparent)]",
  danger:
    "text-[#1a0f0c] bg-[var(--danger)] [box-shadow:0_10px_30px_color-mix(in_srgb,var(--danger)_30%,transparent),inset_1px_1px_2px_rgba(255,255,255,0.35)] hover:brightness-[1.06]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    { variant = "primary", size = "md", className = "", ...rest },
    ref,
  ) {
    return (
      <button
        ref={ref}
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        {...rest}
      />
    );
  },
);
