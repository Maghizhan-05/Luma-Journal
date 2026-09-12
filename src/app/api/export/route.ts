import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

/** Download all of the signed-in user's data as JSON (RLS-scoped to them). */
export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const [profile, entries, moments, transactions, todos, budgets, photos] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    supabase.from("journal_entries").select("*").order("entry_date"),
    supabase.from("key_moments").select("*").order("entry_date"),
    supabase.from("transactions").select("*").order("entry_date"),
    supabase.from("todos").select("*").order("entry_date"),
    supabase.from("budgets").select("*"),
    supabase.from("photos").select("*").order("entry_date"),
  ]);

  // Signed URLs so photos are retrievable for a short window after export.
  const photoRows = photos.data ?? [];
  let photosOut = photoRows;
  if (photoRows.length) {
    const { data: signed } = await supabase.storage
      .from("photos")
      .createSignedUrls(photoRows.map((p) => p.storage_path), 60 * 60);
    photosOut = photoRows.map((p, i) => ({ ...p, download_url: signed?.[i]?.signedUrl ?? null }));
  }

  const payload = {
    app: "LUMA",
    exported_at: new Date().toISOString(),
    account: { id: user.id, email: user.email },
    profile: profile.data ?? null,
    journal_entries: entries.data ?? [],
    key_moments: moments.data ?? [],
    transactions: transactions.data ?? [],
    todos: todos.data ?? [],
    budgets: budgets.data ?? [],
    photos: photosOut,
  };

  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="luma-export-${date}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
