/** Date helpers. All journal data is keyed by a local calendar date (YYYY-MM-DD). */

/** Today's calendar date in the given IANA timezone, as YYYY-MM-DD. */
export function todayInTz(tz: string | null | undefined): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: tz || "UTC",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/** True if the YYYY-MM-DD string is today in the given timezone. */
export function isToday(date: string, tz: string | null | undefined): boolean {
  return date === todayInTz(tz);
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

/** Parse a YYYY-MM-DD string into a timezone-safe local Date (noon, no DST drift). */
export function parseDate(date: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(y, m - 1, d, 12);
}

/** "Tuesday, 14 October 2026" */
export function formatLong(date: string): string {
  const dt = parseDate(date);
  return `${WEEKDAYS[dt.getDay()]}, ${dt.getDate()} ${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
}

/** "Tue · 14:32"-style short weekday label for a date. */
export function shortWeekday(date: string): string {
  return WEEKDAYS[parseDate(date).getDay()].slice(0, 3);
}

/** Current month as YYYY-MM in the given timezone. */
export function currentMonth(tz: string | null | undefined): string {
  return todayInTz(tz).slice(0, 7);
}

/** Add n months to a YYYY-MM string. */
export function addMonth(month: string, n: number): string {
  const [y, m] = month.split("-").map(Number);
  const dt = new Date(y, m - 1 + n, 1);
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`;
}

/** First and last calendar dates (YYYY-MM-DD) of a YYYY-MM month. */
export function monthRange(month: string): { start: string; end: string } {
  const [y, m] = month.split("-").map(Number);
  const last = new Date(y, m, 0).getDate();
  return { start: `${month}-01`, end: `${month}-${String(last).padStart(2, "0")}` };
}

/** "October 2026" */
export function monthLabel(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return `${MONTHS[m - 1]} ${y}`;
}

/** "Tue 14" short day label for a date. */
export function dayLabel(date: string): string {
  const dt = parseDate(date);
  return `${WEEKDAYS[dt.getDay()].slice(0, 3)} ${dt.getDate()}`;
}
