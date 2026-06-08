# Supabase Setup

Use this checklist to switch Catalyx Labs from mock/local mode to real accounts and saved grow data.

## 1. Create Project

Create a Supabase project, then copy:

- Project URL
- anon public key
- service role key

Add them to `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Server only (no NEXT_PUBLIC_ prefix) — never ship to the browser
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

| Key | Where it runs | Purpose |
|-----|----------------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Client + server | Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client + server | Auth and user-scoped reads (RLS) |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server only** | Stripe webhooks (`/api/stripe/webhook`), billing portal lookup (`/api/stripe/portal`), admin writes (`/api/admin/feature-flags`) |

Import `@/lib/supabase-admin` only from Route Handlers or other server code. Use `@/lib/supabase` or `@/lib/auth` for browser-safe anon access.

Restart the dev server after editing env vars.

## 2. Run Database SQL

In Supabase SQL Editor:

1. Run `supabase/schema.sql`
2. Run `supabase/seed.sql`

This creates the full planned ecosystem schema while Phase 1 uses:

- `users`
- `grows`
- `feed_logs`
- `reminders`
- `products`
- `product_inventory`

## 3. Enable Auth

In Supabase Auth:

- Enable email/password signups.
- For local testing, set Site URL to `http://127.0.0.1:3004` or your active dev port.
- Add deployed production URL later.

## 4. Storage Buckets

Create buckets:

- `grow-photos`
- `grow-exports`

Photo upload is still a later polish step, but the buckets should exist now.

## 5. Row Level Security

Before public launch, run the full script in the SQL Editor:

1. Open **SQL Editor** in the Supabase dashboard.
2. Paste and run `supabase/rls-policies.sql` (idempotent — safe to re-run).
3. Confirm `/launch-readiness` shows **RLS hardening ready**, or set `SUPABASE_RLS_APPLIED=true` in `.env.local` after manual verification.
4. Re-run **Database → Advisors** (security + performance).
5. Enable **Auth → Password security → Leaked password protection** in the Supabase dashboard before launch, then set `SUPABASE_LEAKED_PASSWORD_PROTECTION_ENABLED=true`.

What the script enforces:

- Authenticated users own `users`, `grows`, grow-scoped logs, reminders, and inventory.
- `subscriptions` and `user_plan` are read-only from the client; Stripe webhooks write via `SUPABASE_SERVICE_ROLE_KEY`.
- Anonymous users can read only public catalogue/education tables (`products`, `feed_chart`, `protocols`, `recipes`, `tips`, `university_lessons`, `lab_notes`, `feature_flags`, and published `admin_announcements`).
- Authenticated users can mutate only owned app data; subscriptions, orders, and plan rows are client read-only.
- `tips` and `university_lessons` hide `pro_only` rows from anon; signed-in users see all rows (Pro UI still gates features).
- Stripe webhooks and admin writes use the service role from server-only routes.

For early local testing you can keep RLS off; do not ship without applying this script.

## 6. Test Phase 1 Flow

After env vars are added and the server restarts:

1. Go to `/signup`.
2. Create an account.
3. Complete `/onboarding`.
4. Open `/feed-log` and save a feed.
5. Open `/reminders` and create a reminder.
6. Open `/products/ax-pro` and add it to My Shelf.
7. Check Supabase tables for new rows.
8. Return to `/dashboard`; it should use saved feed logs for trend evidence.
