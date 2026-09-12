-- ============================================================
-- Daylog — initial schema
-- Run in Supabase SQL editor (or `supabase db push`).
-- Every user table is owner-only via RLS (auth.uid() = user_id).
-- ============================================================

-- Extensions ------------------------------------------------
create extension if not exists "pgcrypto";

-- Enums -----------------------------------------------------
do $$ begin
  create type tx_direction as enum ('spent', 'received');
exception when duplicate_object then null; end $$;

do $$ begin
  create type reminder_kind as enum ('daily', 'weekly');
exception when duplicate_object then null; end $$;

-- ============================================================
-- profiles (1:1 with auth.users)
-- ============================================================
create table if not exists public.profiles (
  id               uuid primary key references auth.users(id) on delete cascade,
  display_name     text,
  timezone         text not null default 'UTC',
  default_currency text not null default 'INR',
  avatar_url       text,
  last_seen_at     timestamptz,
  reminders_daily  boolean not null default true,
  reminders_weekly boolean not null default true,
  created_at       timestamptz not null default now()
);

-- ============================================================
-- journal_entries (one per day per user)
-- ============================================================
create table if not exists public.journal_entries (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  body       text not null default '',
  mood       smallint check (mood between 1 and 5),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, entry_date)
);
create index if not exists journal_entries_user_date_idx
  on public.journal_entries (user_id, entry_date desc);

-- ============================================================
-- photos (photo wall) — optional per-photo caption + alt text
-- ============================================================
create table if not exists public.photos (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  entry_date   date not null,
  storage_path text not null,
  alt_text     text not null,
  caption      text,
  width        int,
  height       int,
  size_bytes   int,
  created_at   timestamptz not null default now()
);
create index if not exists photos_user_date_idx
  on public.photos (user_id, entry_date desc);

-- ============================================================
-- key_moments (fixed-set tags stored as text[])
-- ============================================================
create table if not exists public.key_moments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  entry_date  date not null,
  title       text not null,
  description text,
  tags        text[] not null default '{}',
  created_at  timestamptz not null default now()
);
create index if not exists key_moments_user_date_idx
  on public.key_moments (user_id, entry_date desc);
-- fast tag filtering + full-text-ish search
create index if not exists key_moments_tags_idx
  on public.key_moments using gin (tags);
create index if not exists key_moments_search_idx
  on public.key_moments using gin (
    to_tsvector('simple', coalesce(title,'') || ' ' || coalesce(description,''))
  );

-- ============================================================
-- transactions (financial tracker, multi-currency)
-- ============================================================
create table if not exists public.transactions (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  direction  tx_direction not null,
  amount     numeric(14,2) not null check (amount >= 0),
  currency   text not null default 'INR',
  category   text not null default 'other',
  note       text,
  created_at timestamptz not null default now()
);
create index if not exists transactions_user_date_idx
  on public.transactions (user_id, entry_date desc);

-- ============================================================
-- todos (daily checklist)
-- ============================================================
create table if not exists public.todos (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  entry_date date not null,
  text       text not null,
  is_done    boolean not null default false,
  position   int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists todos_user_date_idx
  on public.todos (user_id, entry_date desc);

-- ============================================================
-- budgets (monthly limit per category) — feature #5
-- ============================================================
create table if not exists public.budgets (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  category      text not null,
  monthly_limit numeric(14,2) not null check (monthly_limit >= 0),
  currency      text not null default 'INR',
  created_at    timestamptz not null default now(),
  unique (user_id, category)
);

-- ============================================================
-- reminder_log (dedupe email nudges)
-- ============================================================
create table if not exists public.reminder_log (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references auth.users(id) on delete cascade,
  sent_for_date date not null,
  kind          reminder_kind not null,
  sent_at       timestamptz not null default now(),
  unique (user_id, sent_for_date, kind)
);

-- ============================================================
-- prompts (daily writing prompt pool) — feature #3, shared read-only
-- ============================================================
create table if not exists public.prompts (
  id        uuid primary key default gen_random_uuid(),
  text      text not null,
  is_active boolean not null default true
);

-- ============================================================
-- updated_at trigger for journal_entries
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

drop trigger if exists journal_entries_set_updated_at on public.journal_entries;
create trigger journal_entries_set_updated_at
  before update on public.journal_entries
  for each row execute function public.set_updated_at();

-- ============================================================
-- Auto-create a profile row when a user signs up
-- ============================================================
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, display_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- Row Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.journal_entries enable row level security;
alter table public.photos          enable row level security;
alter table public.key_moments     enable row level security;
alter table public.transactions    enable row level security;
alter table public.todos           enable row level security;
alter table public.budgets         enable row level security;
alter table public.reminder_log    enable row level security;
alter table public.prompts         enable row level security;

-- profiles: owner can read/update own row (insert handled by trigger)
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

-- Generic owner-only policy for the daily tables
do $$
declare t text;
begin
  foreach t in array array[
    'journal_entries','photos','key_moments','transactions',
    'todos','budgets','reminder_log'
  ]
  loop
    execute format('drop policy if exists "%1$s_all_own" on public.%1$s;', t);
    execute format(
      'create policy "%1$s_all_own" on public.%1$s
         for all using (auth.uid() = user_id) with check (auth.uid() = user_id);', t);
  end loop;
end $$;

-- prompts: any authenticated user can read the shared pool
drop policy if exists "prompts_select_all" on public.prompts;
create policy "prompts_select_all" on public.prompts
  for select using (auth.role() = 'authenticated');

-- ============================================================
-- Storage bucket for photos (private) + per-user folder policies
-- ============================================================
insert into storage.buckets (id, name, public)
values ('photos', 'photos', false)
on conflict (id) do nothing;

drop policy if exists "photos_read_own" on storage.objects;
create policy "photos_read_own" on storage.objects
  for select using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_insert_own" on storage.objects;
create policy "photos_insert_own" on storage.objects
  for insert with check (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

drop policy if exists "photos_delete_own" on storage.objects;
create policy "photos_delete_own" on storage.objects
  for delete using (
    bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================
-- Seed a few writing prompts (feature #3)
-- ============================================================
insert into public.prompts (text) values
  ('What made you smile today?'),
  ('What is one thing you learned?'),
  ('Who are you grateful for right now?'),
  ('What drained your energy today?'),
  ('Describe today in three words.'),
  ('What is something you want to remember about today?'),
  ('What would make tomorrow great?')
on conflict do nothing;
