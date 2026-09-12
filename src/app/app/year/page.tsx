import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Yearly view" };

export default function YearPage() {
  return (
    <ComingSoon emoji="🔥" title="Your year" phase="Phase 4 · Time views">
      A contribution-style heatmap of every day you journaled.
    </ComingSoon>
  );
}
