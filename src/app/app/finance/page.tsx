import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";

export const metadata: Metadata = { title: "Money" };

export default function FinancePage() {
  return (
    <ComingSoon emoji="💸" title="Money tracker" phase="Phase 3 · Financial tracker">
      Log what you spent and received, in any currency.
    </ComingSoon>
  );
}
