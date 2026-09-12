import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppNav } from "@/components/app/AppNav";
import { DayLock } from "@/components/app/DayLock";
import { Avatar } from "@/components/ui/Avatar";

export default async function AppLayout({ children }: LayoutProps<"/app">) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: proxy.ts already guards, but never render app UI
  // without a user.
  if (!user) redirect("/login");

  // "Logged in for the day" signal used by the reminder cron; also grab the
  // name for the nav avatar.
  const { data: profile } = await supabase
    .from("profiles")
    .update({ last_seen_at: new Date().toISOString() })
    .eq("id", user.id)
    .select("display_name")
    .maybeSingle();

  return (
    <DayLock>
    <div className="flex min-h-dvh flex-col">
      <AppNav>
        <Link href="/app/settings" aria-label="Your profile" className="transition hover:brightness-110">
          <Avatar name={profile?.display_name} email={user.email ?? ""} size={36} />
        </Link>
      </AppNav>

      <main className="mx-auto w-full max-w-6xl flex-1 px-3 pb-28 pt-5 sm:px-4 md:pb-10">
        {children}
      </main>
    </div>
    </DayLock>
  );
}
