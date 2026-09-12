import { type ElementType, type ReactNode } from "react";

type Variant = "brand" | "sunset" | "ocean" | "lemon";

interface PopHeadingProps {
  as?: ElementType;
  variant?: Variant;
  className?: string;
  children: ReactNode;
}

/**
 * Playful gradient heading — the Gen-Z pop lives here while body stays minimal.
 */
export function PopHeading({
  as: Tag = "h2",
  variant = "brand",
  className = "",
  children,
}: PopHeadingProps) {
  const v = variant === "brand" ? "" : variant;
  return <Tag className={`pop-heading ${v} ${className}`}>{children}</Tag>;
}
