import "server-only";
import { Resend } from "resend";

let client: Resend | null = null;
function resend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!client) client = new Resend(process.env.RESEND_API_KEY);
  return client;
}

export interface SendResult {
  ok: boolean;
  id?: string;
  error?: string;
}

/** Send one email via Resend. Returns ok:false (not throwing) on failure. */
export async function sendEmail(to: string, subject: string, html: string): Promise<SendResult> {
  const r = resend();
  if (!r) return { ok: false, error: "RESEND_API_KEY not configured" };
  const from = process.env.RESEND_FROM_EMAIL || "LUMA <onboarding@resend.dev>";
  try {
    const { data, error } = await r.emails.send({ from, to, subject, html });
    if (error) return { ok: false, error: error.message };
    return { ok: true, id: data?.id };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : "send failed" };
  }
}
