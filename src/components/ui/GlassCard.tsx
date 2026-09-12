import { type HTMLAttributes, forwardRef } from "react";

type Accent =
  | "grape"
  | "candy"
  | "sunset"
  | "mint"
  | "sky"
  | "lemon"
  | "coral"
  | "none";

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  padding?: "sm" | "md" | "lg";
  strong?: boolean;
}

const accentVar: Record<Exclude<Accent, "none">, string> = {
  grape: "var(--grape)",
  candy: "var(--candy)",
  sunset: "var(--sunset)",
  mint: "var(--mint)",
  sky: "var(--sky)",
  lemon: "var(--lemon)",
  coral: "var(--coral)",
};

const pad = { sm: "p-3", md: "p-5", lg: "p-6 sm:p-7" };

/**
 * Frosted-glass surface — the base building block for every card in the app.
 * `accent` adds a subtle colored glow so each section reads distinctly.
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  function GlassCard(
    { accent = "none", padding = "md", strong, className = "", style, ...rest },
    ref,
  ) {
    const glow =
      accent !== "none"
        ? {
            boxShadow: `var(--glass-shadow), 0 0 0 1px color-mix(in srgb, ${accentVar[accent]} 22%, transparent)`,
          }
        : undefined;

    return (
      <div
        ref={ref}
        className={`glass ${strong ? "glass-strong" : ""} ${pad[padding]} ${className}`}
        style={{ ...glow, ...style }}
        {...rest}
      />
    );
  },
);
