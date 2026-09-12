import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Monthly view" };

export default function MonthPage() {
  return (
    <ComingSoon emoji="📅" title="Your month" phase="Phase 4 · Time views">
      The calendar grid from your sketch — click a day to see its photos and moments.
    </ComingSoon>
  );
}
