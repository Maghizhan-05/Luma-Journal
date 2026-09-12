import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Key Moments" };

export default function MomentsPage() {
  return (
    <ComingSoon emoji="⭐" title="Key Moments" phase="Phase 5 · Search + analytics">
      Search every moment by text, tag or date.
    </ComingSoon>
  );
}
