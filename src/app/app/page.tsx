import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getDayData } from "@/lib/data/day";
import { todayInTz, formatLong } from "@/lib/date";
import { PopHeading } from "@/components/ui/PopHeading";
import { DayBoard, type BoardItem } from "@/components/day/DayBoard";
import { JournalEditor } from "@/components/day/JournalEditor";
import { TodoCard } from "@/components/day/TodoCard";
import { KeyMomentsCard } from "@/components/day/KeyMomentsCard";
import { PhotoWallCard } from "@/components/day/PhotoWallCard";
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
  const currency = profile?.default_currency ?? DEFAULT_CURRENCY;
  const sym = CURRENCY_MAP[currency]?.symbol ?? "₹";
  const date = todayInTz(tz);
  const hour = Number(
    new Intl.DateTimeFormat("en-US", { timeZone: tz, hour: "numeric", hour12: false }).format(new Date()),
  );

  const { entry, todos, moments, photos, transactions } = await getDayData(date);

  const spent = transactions.filter((t) => t.direction === "spent").reduce((s, t) => s + Number(t.amount), 0);
  const received = transactions.filter((t) => t.direction === "received").reduce((s, t) => s + Number(t.amount), 0);
  const money = (n: number) => `${sym}${n.toLocaleString()}`;

  const items: BoardItem[] = [
    {
      id: "journal",
      accent: "sky",
      wide: true,
      content: <JournalEditor date={date} initialBody={entry?.body ?? ""} initialMood={entry?.mood ?? null} />,
    },
    { id: "todo", accent: "lilac", content: <TodoCard date={date} todos={todos} /> },
    { id: "moments", accent: "peach", content: <KeyMomentsCard date={date} moments={moments} /> },
    { id: "photos", accent: "bubble", content: <PhotoWallCard date={date} userId={user.id} photos={photos} /> },
    {
      id: "spent",
      accent: "coral",
      content: (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="type-heading">💸 Money spent</h2>
            <Link href="/app/finance" className="text-xs font-bold" style={{ color: "var(--coral)" }}>log →</Link>
          </div>
          <p className="type-heading text-2xl" style={{ color: "var(--coral)" }}>{money(spent)}</p>
        </div>
      ),
    },
    {
      id: "received",
      accent: "mint",
      content: (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="type-heading">💰 Money received</h2>
            <Link href="/app/finance" className="text-xs font-bold" style={{ color: "var(--mint)" }}>log →</Link>
          </div>
          <p className="type-heading text-2xl" style={{ color: "var(--mint)" }}>{money(received)}</p>
        </div>
      ),
    },
  ];

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

      <DayBoard items={items} />
    </div>
  );
}
