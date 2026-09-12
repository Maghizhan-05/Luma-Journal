import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (Client Components).
 * Uses the new publishable key format (`sb_publishable_...`).
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
  );
}
