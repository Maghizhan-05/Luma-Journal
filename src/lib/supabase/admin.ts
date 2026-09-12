import { createClient } from "@supabase/supabase-js";

/**
 * Privileged server-only client for background jobs (e.g. the reminder cron).
 * Uses the new SECRET key format (`sb_secret_...`) — NEVER expose to the browser.
 * Bypasses RLS, so only use in trusted server contexts (cron route handlers,
 * server-only utilities). Do not import this from any Client Component.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secret) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY for admin client.",
    );
  }

  return createClient(url, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
