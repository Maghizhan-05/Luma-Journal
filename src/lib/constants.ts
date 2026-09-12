/**
 * App-wide constants: the fixed Key Moment tag set, finance categories,
 * currencies, and mood scale. Kept in one place so UI + analytics + DB
 * validation stay consistent.
 */

export const APP_NAME = "LUMA";
export const APP_TAGLINE = "your day's diary";

/* ---------------- Key Moment tags (fixed set) ---------------- */

export type TagKey =
  | "work"
  | "family"
  | "friends"
  | "health"
  | "travel"
  | "money"
  | "learning"
  | "creative"
  | "milestone"
  | "fun"
  | "hard_day"
  | "grateful";

export interface TagMeta {
  key: TagKey;
  label: string;
  emoji: string;
  color: string; // CSS var reference
}

export const TAGS: TagMeta[] = [
  { key: "work", label: "Work", emoji: "💼", color: "var(--sky)" },
  { key: "family", label: "Family", emoji: "🏡", color: "var(--sunset)" },
  { key: "friends", label: "Friends", emoji: "🫂", color: "var(--candy)" },
  { key: "health", label: "Health", emoji: "💪", color: "var(--mint)" },
  { key: "travel", label: "Travel", emoji: "✈️", color: "var(--sky)" },
  { key: "money", label: "Money", emoji: "💸", color: "var(--mint)" },
  { key: "learning", label: "Learning", emoji: "📚", color: "var(--grape)" },
  { key: "creative", label: "Creative", emoji: "🎨", color: "var(--candy)" },
  { key: "milestone", label: "Milestone", emoji: "🏆", color: "var(--lemon)" },
  { key: "fun", label: "Fun", emoji: "🎉", color: "var(--grape)" },
  { key: "hard_day", label: "Hard day", emoji: "🌧️", color: "var(--coral)" },
  { key: "grateful", label: "Grateful", emoji: "🙏", color: "var(--sunset)" },
];

export const TAG_MAP: Record<TagKey, TagMeta> = Object.fromEntries(
  TAGS.map((t) => [t.key, t]),
) as Record<TagKey, TagMeta>;

/* ---------------- Finance ---------------- */

export type TxDirection = "spent" | "received";

export interface CategoryMeta {
  key: string;
  label: string;
  emoji: string;
  direction: TxDirection | "both";
}

export const CATEGORIES: CategoryMeta[] = [
  { key: "food", label: "Food & Drink", emoji: "🍜", direction: "spent" },
  { key: "groceries", label: "Groceries", emoji: "🛒", direction: "spent" },
  { key: "transport", label: "Transport", emoji: "🚕", direction: "spent" },
  { key: "rent", label: "Rent & Bills", emoji: "🏠", direction: "spent" },
  { key: "shopping", label: "Shopping", emoji: "🛍️", direction: "spent" },
  { key: "health", label: "Health", emoji: "💊", direction: "spent" },
  { key: "fun", label: "Fun & Leisure", emoji: "🎮", direction: "spent" },
  { key: "travel", label: "Travel", emoji: "🧳", direction: "spent" },
  { key: "salary", label: "Salary", emoji: "💼", direction: "received" },
  { key: "freelance", label: "Freelance", emoji: "🧑‍💻", direction: "received" },
  { key: "gift", label: "Gift", emoji: "🎁", direction: "received" },
  { key: "investment", label: "Investment", emoji: "📈", direction: "both" },
  { key: "other", label: "Other", emoji: "✨", direction: "both" },
];

export const CATEGORY_MAP: Record<string, CategoryMeta> = Object.fromEntries(
  CATEGORIES.map((c) => [c.key, c]),
);

/* ---------------- Currencies (multi-currency) ---------------- */

export interface CurrencyMeta {
  code: string; // ISO 4217
  symbol: string;
  label: string;
}

export const CURRENCIES: CurrencyMeta[] = [
  { code: "INR", symbol: "₹", label: "Indian Rupee" },
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
  { code: "SGD", symbol: "S$", label: "Singapore Dollar" },
  { code: "AED", symbol: "د.إ", label: "UAE Dirham" },
];

export const DEFAULT_CURRENCY = "INR";

export const CURRENCY_MAP: Record<string, CurrencyMeta> = Object.fromEntries(
  CURRENCIES.map((c) => [c.code, c]),
);

/* ---------------- Mood scale ---------------- */

export interface MoodMeta {
  value: number; // 1..5
  emoji: string;
  label: string;
  color: string;
}

export const MOODS: MoodMeta[] = [
  { value: 1, emoji: "😞", label: "Rough", color: "var(--coral)" },
  { value: 2, emoji: "😕", label: "Meh", color: "var(--sunset)" },
  { value: 3, emoji: "😐", label: "Okay", color: "var(--lemon)" },
  { value: 4, emoji: "🙂", label: "Good", color: "var(--sky)" },
  { value: 5, emoji: "🤩", label: "Amazing", color: "var(--mint)" },
];
