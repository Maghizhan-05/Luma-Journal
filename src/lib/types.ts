import type { TagKey, TxDirection } from "@/lib/constants";

/** Row shapes matching supabase/migrations/0001_init.sql. */

export interface Profile {
  id: string;
  display_name: string | null;
  timezone: string;
  default_currency: string;
  avatar_url: string | null;
  last_seen_at: string | null;
  reminders_daily: boolean;
  reminders_weekly: boolean;
  created_at: string;
}

export interface JournalEntry {
  id: string;
  user_id: string;
  entry_date: string; // YYYY-MM-DD
  body: string;
  mood: number | null; // 1..5
  created_at: string;
  updated_at: string;
}

export interface Photo {
  id: string;
  user_id: string;
  entry_date: string;
  storage_path: string;
  alt_text: string;
  caption: string | null;
  width: number | null;
  height: number | null;
  size_bytes: number | null;
  created_at: string;
}

export interface KeyMoment {
  id: string;
  user_id: string;
  entry_date: string;
  title: string;
  description: string | null;
  tags: TagKey[];
  created_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  entry_date: string;
  direction: TxDirection;
  amount: number;
  currency: string;
  category: string;
  note: string | null;
  created_at: string;
}

export interface Todo {
  id: string;
  user_id: string;
  entry_date: string;
  text: string;
  is_done: boolean;
  position: number;
  created_at: string;
}

export interface Budget {
  id: string;
  user_id: string;
  category: string;
  monthly_limit: number;
  currency: string;
  created_at: string;
}

export interface Prompt {
  id: string;
  text: string;
  is_active: boolean;
}
