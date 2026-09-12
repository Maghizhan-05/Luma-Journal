import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Weekly view" };

export default function WeekPage() {
  return (
    <ComingSoon emoji="🗓️" title="Your week" phase="Phase 4 · Time views">
      A 7-day glance at your journal, moments and money.
    </ComingSoon>
  );
}
