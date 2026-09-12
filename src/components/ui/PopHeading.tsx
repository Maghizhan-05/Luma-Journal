import { type ElementType, type ReactNode } from "react";

interface PopHeadingProps {
  as?: ElementType;
  className?: string;
  children: ReactNode;
}

/**
 * Typewriter display heading. Character comes from the mono face + weight and
 * from optional <span className="marker"> highlights inside the text — a
 * crafted, human touch rather than an AI-default gradient.
 */
export function PopHeading({
  as: Tag = "h2",
  className = "",
  children,
}: PopHeadingProps) {
  return <Tag className={`type-heading ${className}`}>{children}</Tag>;
}
