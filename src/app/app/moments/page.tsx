import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { searchMoments } from "@/lib/data/moments";
import { formatLong } from "@/lib/date";
import { GlassCard } from "@/components/ui/GlassCard";
import { PopHeading } from "@/components/ui/PopHeading";
import { SearchControls } from "@/components/moments/SearchControls";
import { TAG_MAP, TAGS, type TagKey } from "@/lib/constants";

export const metadata: Metadata = { title: "Key Moments" };

const VALID_TAGS = new Set(TAGS.map((t) => t.key));

export default async function MomentsPage({ searchParams }: PageProps<"/app/moments">) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const tags = (typeof params.tags === "string" ? params.tags.split(",") : []).filter((t): t is TagKey => VALID_TAGS.has(t as TagKey));
  const from = typeof params.from === "string" ? params.from : "";
  const to = typeof params.to === "string" ? params.to : "";

  const results = await searchMoments({ q, tags, from, to });

  return (
    <div className="flex flex-col gap-4">
      <PopHeading as="h1" className="text-3xl sm:text-4xl">Key Moments ⭐</PopHeading>

      <GlassCard accent="peach" padding="lg">
        <SearchControls initialQ={q} initialTags={tags} initialFrom={from} initialTo={to} />
      </GlassCard>

      <p className="text-sm text-[color:var(--muted-2)]">
        {results.length} moment{results.length === 1 ? "" : "s"}{q || tags.length || from || to ? " found" : ""}
      </p>

      <div className="flex flex-col gap-2.5">
        {results.map((m) => (
          <Link key={m.id} href={`/app/day/${m.entry_date}`}>
            <GlassCard className="transition hover:brightness-110">
              <div className="flex items-start justify-between gap-3">
                <p className="font-bold text-[color:var(--ink)]">{m.title}</p>
                <span className="shrink-0 text-xs text-[color:var(--muted-2)]">{formatLong(m.entry_date).replace(/,.*/, "")}</span>
              </div>
              {m.description && <p className="mt-0.5 text-sm text-[color:var(--muted)]">{m.description}</p>}
              {m.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {m.tags.map((k) => {
                    const t = TAG_MAP[k as TagKey];
                    return t ? <span key={k} className="chip text-xs" style={{ color: t.color }}>{t.emoji} {t.label}</span> : null;
                  })}
                </div>
              )}
            </GlassCard>
          </Link>
        ))}
        {results.length === 0 && (
          <p className="py-8 text-center text-sm text-[color:var(--muted-2)]">No moments match — try fewer filters.</p>
        )}
      </div>
    </div>
  );
}
