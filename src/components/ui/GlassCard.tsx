import { type HTMLAttributes, forwardRef } from "react";

type Accent =
  | "peach"
  | "coral"
  | "butter"
  | "lemon"
  | "sky"
  | "mint"
  | "lilac"
  | "bubble"
  | "none";

interface ClayCardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: Accent;
  padding?: "sm" | "md" | "lg";
  /** Flatter surface (less puffed) for nested elements. */
  flat?: boolean;
}

const accentVar: Record<Exclude<Accent, "none">, string> = {
  peach: "var(--peach)",
  coral: "var(--coral)",
  butter: "var(--butter)",
  lemon: "var(--lemon)",
  sky: "var(--sky)",
  mint: "var(--mint)",
  lilac: "var(--lilac)",
  bubble: "var(--bubble)",
};

const pad = { sm: "p-4", md: "p-5", lg: "p-6 sm:p-7" };

/**
 * Puffy clay surface — the base building block for every card in LUMA.
 * `accent` warms the card with a soft colored wash + tinted contact shadow,
 * so each section reads distinctly without loud gradients.
 */
export const GlassCard = forwardRef<HTMLDivElement, ClayCardProps>(
  function ClayCard(
    { accent = "none", padding = "md", flat, className = "", style, ...rest },
    ref,
  ) {
    const accentStyle =
      accent !== "none"
        ? {
            background: `color-mix(in srgb, ${accentVar[accent]} 12%, var(--clay))`,
            boxShadow: `var(--clay-shadow), var(--clay-inset), 6px 8px 22px color-mix(in srgb, ${accentVar[accent]} 22%, transparent)`,
          }
        : undefined;

    return (
      <div
        ref={ref}
        className={`${flat ? "clay-flat" : "clay"} ${pad[padding]} ${className}`}
        style={{ ...accentStyle, ...style }}
        {...rest}
      />
    );
  },
);
