/** Client-side day-lock helpers (device-local privacy gate; data is already
 *  protected server-side by auth + RLS). */

export const PIN_KEY = "luma:pin";
export const UNLOCK_KEY = "luma:unlock-day";

/** Today's local calendar date, YYYY-MM-DD. */
export function todayLocal(): string {
  return new Date().toLocaleDateString("en-CA");
}

/** SHA-256 hash of a PIN with a fixed app tag (device-local obfuscation). */
export async function hashPin(pin: string): Promise<string> {
  const data = new TextEncoder().encode(`luma-lock-v1:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export function getStoredPin(): string | null {
  try {
    return localStorage.getItem(PIN_KEY);
  } catch {
    return null;
  }
}

export function isUnlockedToday(): boolean {
  try {
    return localStorage.getItem(UNLOCK_KEY) === todayLocal();
  } catch {
    return false;
  }
}

export function markUnlocked() {
  try {
    localStorage.setItem(UNLOCK_KEY, todayLocal());
  } catch {
    /* ignore */
  }
}
