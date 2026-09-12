import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { SignOutButton } from "@/components/app/SignOutButton";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: proxy.ts already guards, but never render app UI
  // without a user.
  if (!user) redirect("/login");

  // "Logged in for the day" signal used by the reminder cron.
  await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id);

  return (
    <div className="flex min-h-dvh flex-col">
      <AppNav>
        <Link
          href="/app/settings"
          aria-label="Settings"
          className="grid h-9 w-9 place-items-center rounded-full bg-[color-mix(in_srgb,var(--grape)_16%,transparent)] text-base"
        >
          ⚙️
        </Link>
        <div className="hidden sm:block">
          <SignOutButton />
        </div>
      </AppNav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-28 pt-5 sm:px-4 md:pb-10">
        {children}
      </main>
    </div>
  );
}
