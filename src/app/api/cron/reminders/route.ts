import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { dateInTz, hourInTz, weekdayInTz } from "@/lib/date";
import { sendEmail } from "@/lib/email/send";
import { dailyReminder, weeklyReminder } from "@/lib/email/templates";

export const dynamic = "force-dynamic";

// Hour (local to each user) at which nudges go out. The cron runs hourly and
// only the users whose local time is this hour are considered each run.
const REMINDER_HOUR = 20;

function authorized(req: NextRequest): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${secret}`) return true; // Vercel Cron
  return req.nextUrl.searchParams.get("secret") === secret; // manual trigger
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const dry = req.nextUrl.searchParams.get("dry") === "1";
  const force = req.nextUrl.searchParams.get("force") === "1"; // ignore the hour gate (testing)
  const now = new Date();
  const admin = createAdminClient();

  // Emails (+ confirmation status) live on auth.users.
  const { data: userList } = await admin.auth.admin.listUsers({ perPage: 1000 });
  const emailById = new Map(userList.users.map((u) => [u.id, { email: u.email, confirmed: Boolean(u.email_confirmed_at) }]));

  const { data: profiles } = await admin
    .from("profiles")
    .select("id, display_name, timezone, reminders_daily, reminders_weekly, last_seen_at");

  const results: { email: string; kind: string; sent: boolean; error?: string }[] = [];
  let checked = 0;

  for (const p of profiles ?? []) {
    checked += 1;
    const tz = p.timezone || "UTC";
    if (!force && hourInTz(now, tz) !== REMINDER_HOUR) continue;

    const localDate = dateInTz(now, tz);
    const seenToday = p.last_seen_at && dateInTz(new Date(p.last_seen_at), tz) === localDate;
    if (seenToday) continue; // already active today → no nudge

    const acct = emailById.get(p.id);
    if (!acct?.email || !acct.confirmed) continue;

    const isSunday = weekdayInTz(now, tz) === 0;
    const kind: "daily" | "weekly" | null =
      isSunday && p.reminders_weekly ? "weekly" : p.reminders_daily ? "daily" : null;
    if (!kind) continue;

    // Dedupe: at most one reminder of this kind per local day.
    const { data: existing } = await admin
      .from("reminder_log")
      .select("id")
      .eq("user_id", p.id)
      .eq("sent_for_date", localDate)
      .eq("kind", kind)
      .maybeSingle();
    if (existing) continue;

    if (dry) {
      results.push({ email: acct.email, kind, sent: false });
      continue;
    }

    const tpl = kind === "weekly" ? weeklyReminder(p.display_name) : dailyReminder(p.display_name);
    const res = await sendEmail(acct.email, tpl.subject, tpl.html);
    if (res.ok) {
      await admin.from("reminder_log").insert({ user_id: p.id, sent_for_date: localDate, kind });
    }
    results.push({ email: acct.email, kind, sent: res.ok, error: res.error });
  }

  return NextResponse.json({
    ok: true,
    dryRun: dry,
    hourGate: force ? "ignored" : REMINDER_HOUR,
    checked,
    eligible: results.length,
    sent: results.filter((r) => r.sent).length,
    results,
  });
}
