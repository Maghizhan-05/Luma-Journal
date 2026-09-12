# LUMA — Security & Data-Safety Review

_Phase 6. Last run: 2026-09-12 against the live Supabase project._

## Threat model
Personal journal: private text, photos, key moments, and finances. The core
requirement is **strict per-user isolation** — no user may read or modify
another user's data, directly or by forging identifiers.

## Verified by live pentest
A second account ("attacker") was created and signed in with the **publishable
key** (so Row-Level Security is enforced exactly as in the browser), then used
to attack the first user's ("victim") data.

| Attack | Result |
|---|---|
| Read all `journal_entries` / `key_moments` / `photos` / `transactions` / `todos` / `budgets` | **0 rows** (isolated) ✅ |
| Read victim's journal row by its exact id | **0 rows** ✅ |
| Read victim's `profiles` row / all profiles | 0 rows for victim; only the attacker's **own** row is visible ✅ |
| `UPDATE` victim's journal by id | **0 rows affected** ✅ |
| `DELETE` victim's moment by id | **0 rows affected** ✅ |
| `INSERT` a row with a forged `user_id` = victim | **Blocked** — Postgres `42501` (RLS violation) ✅ |
| `download` victim's photo by storage path | **Blocked** — "Object not found" ✅ |
| `createSignedUrl` for victim's photo | **Blocked** ✅ |
| Control: victim reads own data | Works (8 entries) ✅ |
| Forged future-dated row actually in DB afterwards | **No** ✅ |

**Conclusion: cross-user isolation holds on every table and on Storage.**

## Controls in place
- **RLS**: every user table has `enable row level security` with owner-only
  policies (`auth.uid() = user_id`); `profiles` is owner-only by `id`;
  `prompts` is read-only to authenticated users. Storage `photos` bucket is
  **private** with per-folder policies (`(storage.foldername(name))[1] =
  auth.uid()`). See `supabase/migrations/0001_init.sql`.
- **Server-action authorization**: every mutation calls `getUser()` and is
  additionally constrained by RLS as the backstop (proven above — deletes/
  updates by id affect 0 cross-user rows).
- **Input validation**: all writes validated with `zod` (amounts, dates, tag
  enums, currency/category enums, lengths).
- **No filter injection**: Moments search applies tag/date filters in
  parameterized PostgREST calls and matches free text in JS — user text is
  never concatenated into a PostgREST filter string.
- **Open-redirect safe**: post-login `next` is restricted to internal `/app`
  paths.
- **Route protection**: `src/proxy.ts` (Next 16 middleware) refreshes the
  session and redirects unauthenticated users away from `/app/*`.
- **Secrets**: `SUPABASE_SECRET_KEY` is server-only (never `NEXT_PUBLIC`, not
  imported by any client component); `.env*` is git-ignored.
- **XSS**: no `dangerouslySetInnerHTML` / `innerHTML` / `eval`; React escapes
  all output.
- **CSRF**: Next.js Server Actions enforce same-origin.
- **Photo upload**: storage path is validated server-side to sit under the
  user's own folder, in addition to Storage RLS.
- **SEO privacy**: `robots.ts` disallows `/app` and `/api`; sitemap lists only
  public pages.
- **HTTP hardening headers** (`next.config.ts`): `X-Frame-Options: DENY`,
  `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `Permissions-Policy`
  (camera=self for capture; mic/geo off), HSTS.

## Recommendations (not blocking)
1. **Content-Security-Policy**: add a strict CSP (with a nonce) before public
   launch — omitted here to avoid breaking Next's inline runtime during dev.
2. **Rate limiting**: rely on Supabase Auth's built-in limits; consider adding
   app-level limits on write actions if abuse appears.
3. **Email confirmation**: keep Supabase "confirm email" ON in production so
   accounts are verified.
4. **Storage MIME/size limits**: set an allowed-mime-types + size cap on the
   `photos` bucket in Supabase settings (client already compresses to WebP
   ≤0.5 MB, but enforce server-side too).
5. **Backups**: enable Supabase point-in-time recovery / scheduled backups.
6. Rotate the keys that were shared during development before go-live.
