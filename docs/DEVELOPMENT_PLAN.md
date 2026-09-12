# Journal Productivity App — Development Plan (v1, for review)

**Source of truth for this plan:** `Journal App Sketch_260912_151705.pdf` (4 pages: p1 Main Screen, p2 Calendar View + Analytics, p3–4 blank/overflow).

**Stack:** Next.js (App Router, TypeScript) + Supabase (Postgres, Auth, Storage, Edge Functions) + Vercel (hosting + Cron) + Resend (transactional email). Reasons noted in §4.

---

## 1. What the sketch specifies

| Sketch element | Feature |
|---|---|
| Header bar, "App Name" | Global nav/branding, present on every authenticated screen |
| "To-Do List" card | Simple daily checklist (implied, not in your written brief — flagged in Open Questions) |
| "Photo Wall" card | Per-day photo strip, mobile-uploaded |
| "Key Moments" card | Short tagged entries for the day |
| "Journal of the Day" (large panel) | Free-text daily journal entry |
| "Money Spent" / "Money Received" | Financial tracker, split by direction |
| Calendar View (month grid + date picker) | Monthly view, click a day → see that day's Photo Wall + Key Moments |
| Analytics screen, donut charts by category | Financial analytics (spend/income by category) |

Your written brief adds: Current (today) / Weekly / Monthly / Yearly views, Key Moments search, Key Moments analytics, login/signup/logout, daily+weekly email nudges, image compression + alt text, robots.txt + sitemap. All folded in below.

---

## 2. Information architecture

```
/                    → marketing/landing (public) — needed for robots.txt/sitemap to mean anything
/login               → sign in
/signup              → sign up
/app                 → Today (Current view) — default after login
/app/week            → Weekly view
/app/month           → Monthly view (calendar grid, from sketch p2)
/app/year            → Yearly view (heatmap-style overview)
/app/moments         → Key Moments search + full list
/app/finance         → Financial tracker entry + history
/app/analytics       → Financial + Key Moments analytics
/app/settings        → profile, reminder email prefs, logout
```

Logout is an action (button in Settings/nav), not a route users land on — confirm that's what you meant rather than a literal "logout page."

---

## 3. Data model (Supabase/Postgres)

All tables have `user_id uuid references auth.users` + RLS: **owner-only read/write**.

- **profiles** — `id, display_name, timezone, default_currency, avatar_url, last_seen_at, created_at`
- **journal_entries** — `id, user_id, entry_date (date, unique per user), body (text), mood (enum, optional), created_at, updated_at`
- **photos** — `id, user_id, entry_date, storage_path, alt_text, caption (text, optional), width, height, size_bytes, created_at` — `caption` = the optional "write about this photo/moment" box below each photo
- **key_moments** — `id, user_id, entry_date, title, description, tags (fixed-set enum[]), created_at`
- **transactions** — `id, user_id, entry_date, direction (enum: spent|received), amount (numeric), currency (ISO 4217), category, note, created_at` — multi-currency; `profiles.default_currency` prefills new entries
- **todos** — `id, user_id, entry_date, text, is_done, created_at` — **kept in scope** (Phase 2)
- **reminder_log** — `id, user_id, sent_for_date, kind (daily|weekly), sent_at` — prevents double-sends
- **categories** — seeded lookup table (Food, Salary, Rent, Travel, …) editable per user

Indexes: `(user_id, entry_date)` on every daily table for fast range queries (week/month/year views).

---

## 4. Architecture decisions & why

- **Next.js App Router**, Supabase SSR client (`@supabase/ssr`) for cookie-based auth — server components fetch data directly, no client waterfall.
- **Supabase Storage** bucket `photos`, path `{user_id}/{entry_date}/{filename}`, private bucket + signed URLs — never public, since these are personal photos.
- **Client-side image compression** before upload (`browser-image-compression`, targeting ~1600px longest edge, WebP, <500KB) — cuts upload time on mobile data and Storage cost. Alt text is a **required field** in the upload UI (not auto-generated, so it stays accurate).
- **Email reminders**: Supabase/Postgres has no built-in scheduler for arbitrary business logic, so a **Vercel Cron job** (or Supabase Edge Function + `pg_cron`) runs twice daily (e.g. 9am and 8pm user-local buckets) and once weekly, queries `profiles` for users whose `last_seen_at` (or a `journal_entries` row) doesn't cover "today," checks `reminder_log` to avoid duplicates, sends via **Resend**, and logs the send. Time-zone handling: reminders batched by `profiles.timezone`, not a single global time.
- **SEO**: `/app/robots.ts` and `/app/sitemap.ts` (Next.js native, generate at build) cover the public marketing/login pages only — authenticated `/app/*` routes are disallowed in robots.txt (personal data shouldn't be indexed).
- **PWA-lite**: manifest.json + "Add to Home Screen" so mobile photo capture feels native (`<input type="file" capture>` for direct camera access) — full offline PWA is out of scope unless you want it (flagged below).

---

## 5. Design direction — Apple glassmorphism × Gen-Z pop

- **Structure = Apple:** clean off-white/deep-charcoal canvas, frosted-glass cards (`backdrop-filter: blur`, translucent fill, hairline border, soft shadow), iOS card geometry (16–24px radii), generous whitespace. This keeps it minimal and calm at rest.
- **Energy = Gen-Z pop:** vivid gradient headings (candy/electric palette — think sunset, mint, grape), oversized rounded display type, playful micro-interactions (springy card taps, confetti/emoji reactions on saving an entry, animated streak flames), sticker-like tag chips, subtle grain/noise, and per-section accent hues (Photo Wall ≠ Key Moments ≠ Finance each get their own gradient). The *pop* lives in color, motion, and headings; the *content* stays legible and uncluttered.
- Typography: SF Pro-like system stack for body; a rounded expressive display face for headings (e.g. a variable rounded font) to carry the pop.
- Fully responsive, **mobile-first** (this is where you'll shoot and upload photos) → single-column stacked glass cards on phone, multi-column on desktop per the sketch.
- Dark mode from day one (glassmorphism makes it nearly free, and it reads great with neon accents).

## 5b. Voice-typing / dictation compatibility (Wispr Flow, etc.)

Every text surface (journal body, photo caption, key-moment description, todo text) will use **native `<textarea>` / single-line `<input>` controls**, not a custom rich-text/canvas editor. Native fields are what dictation tools like Wispr Flow, macOS/iOS Dictation, and Android voice input target and insert into reliably. Rules we'll follow:
- No keystroke interception, IME blocking, or forced formatting on the text fields.
- Autosave on blur + debounced while typing, so a long dictated passage is never lost.
- Large tap targets and a clear active-focus state so it's obvious which field dictation is flowing into.
- Punctuation/newlines from dictation pass through untouched (no aggressive input sanitizing).

---

## 6. Phased delivery

**Phase 0 — Foundations**
Repo scaffold, Next.js + TS + Tailwind, Supabase project, env/config, design tokens (colors, blur, radii), CI lint/build.

**Phase 1 — Auth**
Login, Signup, session middleware, protected `/app` routes, logout action, profile row auto-created on signup.

**Phase 2 — Core daily journal**
Today view: journal text entry, Key Moments card (add/edit/delete), Photo Wall card (upload + compression + alt text), To-Do card (pending confirmation).

**Phase 3 — Financial tracker**
Add/edit/delete transactions (spent/received + category), Today card totals.

**Phase 4 — Time views**
Weekly, Monthly (calendar grid per sketch p2), Yearly overview; date-scoped queries reused across all.

**Phase 5 — Search + Analytics**
Key Moments search (by text/tag/date range), Financial analytics (donut by category, spent vs received trend), Key Moments analytics (frequency over time, top tags).

**Phase 6 — Email reminders**
Cron job, timezone-aware batching, Resend templates (daily nudge, weekly digest), `reminder_log` dedupe, unsubscribe/preferences in Settings.

**Phase 7 — Polish & infra**
robots.txt, sitemap.xml, manifest.json + camera-capture input, responsive QA across breakpoints, dark mode, accessibility pass (alt text already in place, keyboard nav, contrast), performance pass (image lazy-load, `next/image`).

**Phase 8 — QA & launch**
Cross-device test (specifically your phone, for the photo flow), RLS policy audit, backup/export consideration, deploy to Vercel + Supabase production project.

---

## 7. Locked decisions (v2)

| Item | Decision |
|---|---|
| To-Do List card | **In scope** (Phase 2) |
| Email provider | **Resend** |
| Currency | **Multi-currency** (ISO 4217; profile default prefills) |
| Key Moments tags | **Fixed set** (see §7a) |
| Yearly view | **Heatmap** (GitHub-contributions style) |
| Hosting | **Vercel** (+ Vercel Cron for reminders) |
| Aesthetic | Apple glassmorphism × **Gen-Z pop** |
| Photo caption box | **Optional** field under each photo |
| Voice typing | **Native fields**, dictation-friendly (§5b) |

### 7a. Proposed fixed tag set (edit freely)
`Work · Family · Friends · Health · Travel · Money · Learning · Creative · Milestone · Fun · Hard-day · Grateful`
Each tag gets a color + emoji for the sticker-chip look.

## 8. Suggested additional features (pick what you want)

Strong fits for a Gen-Z journaling + productivity app — none are required, tell me which to include:

1. **Streaks & consistency flame** 🔥 — "N days in a row." Pairs perfectly with the reminder emails and the yearly heatmap; big Gen-Z motivator. *(Recommend: yes)*
2. **"On this day" memories** — resurfaces last month's / last year's entry for the same date on the Today view. *(Recommend: yes — high delight, low cost)*
3. **Daily prompt / question of the day** — a rotating prompt to beat blank-page paralysis (great with voice typing). *(Recommend: yes)*
4. **Mood tracking + mood analytics** — one-tap mood on each entry, charted over time alongside the moments analytics. `journal_entries.mood` already reserved for this. *(Recommend: yes)*
5. **Budgets & recurring transactions** — set a monthly budget per category with a progress ring; auto-suggest recurring items (salary, rent). Makes the finance side genuinely useful, not just a log.
6. **Weekly/monthly auto-recap** — an auto-generated "your week in review" card (top moments, spend summary, mood trend). Could double as the weekly reminder email's body.
7. **Data export / backup** — export entries + photos as a zip / JSON. It's your personal journal; owning your data matters, and it's a trust feature.
8. **App lock (PIN / biometric)** — optional lock screen on mobile for a private journal.
9. **Share-as-image** — export a key moment or a day as a pretty gradient card to share (very Gen-Z / social).

My recommended v1 additions: **1, 2, 3, 4** (low cost, high delight), with **5** if you want the finance side to feel complete. The rest are great Phase-9+ candidates.

## 9. Next step

Tell me which of §8 (1–9) to include and confirm the §7a tag set, and I'll start **Phase 0 — Foundations**.
