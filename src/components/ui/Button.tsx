import { type ButtonHTMLAttributes, forwardRef } from "react";

type Variant = "primary" | "glass" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-[var(--r-pill)] transition-[transform,box-shadow,background] duration-150 active:scale-[0.97] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[color-mix(in_srgb,var(--accent)_30%,transparent)] disabled:opacity-50 disabled:pointer-events-none select-none";

const sizes: Record<Size, string> = {
  sm: "text-sm px-4 h-9",
  md: "text-[0.95rem] px-5 h-11",
  lg: "text-base px-6 h-13",
};

const variants: Record<Variant, string> = {
  primary:
    "text-white shadow-[0_6px_20px_rgba(124,92,255,0.35)] [background-image:var(--grad-brand)] hover:brightness-[1.05]",
  glass:
    "glass glass-strong text-[color:var(--foreground)] hover:brightness-[1.03]",
  ghost:
    "text-[color:var(--foreground)] hover:bg-[color-mix(in_srgb,var(--foreground)_8%,transparent)]",
  danger:
    "text-white [background-image:linear-gradient(135deg,#ff6b6b,#ff8a3d)] hover:brightness-[1.05]",
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
