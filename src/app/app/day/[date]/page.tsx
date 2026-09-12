import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { formatLong, todayInTz, addDay } from "@/lib/date";
import { PopHeading } from "@/components/ui/PopHeading";
import { DayView } from "@/components/day/DayView";
import { CURRENCY_MAP, DEFAULT_CURRENCY } from "@/lib/constants";

export const metadata: Metadata = { title: "Day" };

export default async function DayPage({ params }: PageProps<"/app/day/[date]">) {
  const { date } = await params;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles").select("timezone, default_currency").eq("id", user.id).maybeSingle();
  const tz = profile?.timezone ?? "UTC";
  const sym = CURRENCY_MAP[profile?.default_currency ?? DEFAULT_CURRENCY]?.symbol ?? "₹";
  const today = todayInTz(tz);
  const isToday = date === today;

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="mb-1 flex items-center gap-2">
            <Link href={`/app/day/${addDay(date, -1)}`} className="clay grid h-8 w-8 place-items-center rounded-full text-sm">‹</Link>
            <Link href={`/app/day/${addDay(date, 1)}`} className="clay grid h-8 w-8 place-items-center rounded-full text-sm">›</Link>
            {isToday && <span className="chip text-xs" style={{ color: "var(--accent)" }}>today</span>}
          </div>
          <PopHeading as="h1" className="text-2xl sm:text-3xl">{formatLong(date)}</PopHeading>
        </div>
        {!isToday && (
          <Link href="/app" className="text-sm font-bold" style={{ color: "var(--accent)" }}>back to today →</Link>
        )}
      </header>

      <DayView date={date} userId={user.id} currencySymbol={sym} />
    </div>
  );
}
