import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Analytics" };

export default function AnalyticsPage() {
  return (
    <ComingSoon emoji="📊" title="Your stats" phase="Phase 5 · Search + analytics">
      Donut charts for money and trends for your moments and moods.
    </ComingSoon>
  );
}
