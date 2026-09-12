import { type ElementType, type ReactNode, createElement } from "react";

interface PopHeadingProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Typewriter display heading. Character comes from the mono face + weight and
 * from optional <span className="marker"> highlights inside the text — a
 * crafted, human touch rather than an AI-default gradient.
 *
 * Uses createElement so the polymorphic `as` tag type-checks cleanly even with
 * React Three Fiber's global JSX augmentation present.
 */
export function PopHeading({
  as = "h2",
  className = "",
  children,
}: PopHeadingProps) {
  return createElement(
    as,
    { className: `type-heading ${className}` },
    children,
  );
}
