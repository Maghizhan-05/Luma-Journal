import type { Metadata } from "next";
import { ComingSoon } from "@/components/app/ComingSoon";
import { SignOutButton } from "@/components/app/SignOutButton";

export const metadata: Metadata = { title: "Settings" };

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-md">
      <ComingSoon emoji="⚙️" title="Settings" phase="Phase 1 · Auth (base)">
        Profile, currency, timezone and reminder preferences arrive here.
      </ComingSoon>
      <div className="mt-4 flex justify-center">
        <SignOutButton />
      </div>
    </div>
  );
}
