import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { todayInTz, formatLong } from "@/lib/date";
import { PopHeading } from "@/components/ui/PopHeading";
import { DayView } from "@/components/day/DayView";
import { CURRENCY_MAP, DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Today" };

function greeting(h: number) {
  if (h < 5) return "Late night";
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  if (h < 21) return "Good evening";
  return "Winding down";
}

export default async function TodayPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("timezone, default_currency, display_name")
    .eq("id", user.id)
    .maybeSingle();

  const tz = profile?.timezone ?? "UTC";
  const sym = CURRENCY_MAP[profile?.default_currency ?? DEFAULT_CURRENCY]?.symbol ?? "₹";
  const date = todayInTz(tz);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date()),
  );

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <PopHeading as="h1" className="text-3xl sm:text-4xl">
            {greeting(hour)}{profile?.display_name ? `, ${profile.display_name}` : ""} ✦
          </PopHeading>
          <p className="mt-1 text-sm text-[color:var(--muted)]">{formatLong(date)}</p>
        </div>
        <p className="text-xs text-[color:var(--muted-2)]">drag ⠿ to rearrange</p>
      </header>

      <DayView date={date} userId={user.id} currencySymbol={sym} />
    </div>
  );
}
