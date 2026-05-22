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
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

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

Before public launch, enable RLS and add policies. For early local testing, you can keep RLS off while validating flows.

Suggested production direction:

- Users can read/update their own `users` row where `auth.uid() = auth_user_id`.
- Users can CRUD `grows` where the grow belongs to their `users.id`.
- Users can CRUD feed logs, check-ins, reminders, photos, inventory, scores, and reviews through their owned grow/user.
- Products, feed charts, protocols, lessons, and lab notes are readable by all signed-in users.
- Admin-only tables require an admin role claim or an `is_admin` field.

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

