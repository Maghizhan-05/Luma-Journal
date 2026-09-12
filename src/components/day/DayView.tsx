import { getDayData } from "@/lib/data/day";
import { DayBoard, type BoardItem } from "@/components/day/DayBoard";
import { JournalEditor } from "@/components/day/JournalEditor";
import { TodoCard } from "@/components/day/TodoCard";
import { KeyMomentsCard } from "@/components/day/KeyMomentsCard";
import { PhotoWallCard } from "@/components/day/PhotoWallCard";
import Link from "next/link";

/** The full editable day board for a given date — used by Today and /app/day/[date]. */
export async function DayView({
  date,
  userId,
  currencySymbol,
}: {
  date: string;
  userId: string;
  currencySymbol: string;
}) {
  const { entry, todos, moments, photos, transactions } = await getDayData(date);
  const spent = transactions.filter((t) => t.direction === "spent").reduce((s, t) => s + Number(t.amount), 0);
  const received = transactions.filter((t) => t.direction === "received").reduce((s, t) => s + Number(t.amount), 0);
  const money = (n: number) => `${currencySymbol}${n.toLocaleString()}`;
  const financeHref = `/app/finance?m=${date.slice(0, 7)}`;

  const items: BoardItem[] = [
    { id: "journal", accent: "sky", wide: true, content: <JournalEditor date={date} initialBody={entry?.body ?? ""} initialMood={entry?.mood ?? null} /> },
    { id: "todo", accent: "lilac", content: <TodoCard date={date} todos={todos} /> },
    { id: "moments", accent: "peach", content: <KeyMomentsCard date={date} moments={moments} /> },
    { id: "photos", accent: "bubble", content: <PhotoWallCard date={date} userId={userId} photos={photos} /> },
    {
      id: "spent",
      accent: "coral",
      content: (
        <div>
          <div className="mb-1 flex items-center justify-between">
            <h2 className="type-heading">💸 Money spent</h2>
            <Link href={financeHref} className="text-xs font-bold" style={{ color: "var(--coral)" }}>log →</Link>
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
            <Link href={financeHref} className="text-xs font-bold" style={{ color: "var(--mint)" }}>log →</Link>
          </div>
          <p className="type-heading text-2xl" style={{ color: "var(--mint)" }}>{money(received)}</p>
        </div>
      ),
    },
  ];

  return <DayBoard items={items} />;
}
