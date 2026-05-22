# Catalyx Labs Grow OS

Catalyx Labs Grow OS is a full-stack Next.js first version for a precision cultivation ecosystem: dashboard, onboarding, grow tracker, daily check-in, feed calculator, adaptive feed charts, Catalyx Copilot, product education, protocols, inventory, subscriptions, analytics, exports, admin, and PWA install support.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase-ready REST helper, schema, and seed data
- Stripe Checkout, portal placeholder, and webhook route
- PWA manifest and service worker
- Capacitor mobile wrapper readiness for iOS and Android
- Mock data fallback when API keys are missing

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Environment

Copy `.env.example` to `.env.local` and fill the values you have. The app still runs without keys and uses mock Catalyx data.

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_PRO_MONTHLY=
STRIPE_PRICE_PRO_YEARLY=
```

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the SQL editor.
3. Run `supabase/seed.sql`.
4. Enable storage buckets for grow photos and exports.
5. Add Row Level Security policies appropriate for your auth model before production launch.

Detailed checklist: `docs/supabase-setup.md`.

The schema includes the requested tables: users, subscriptions, user_plan, grows, plants, daily_checkins, feed_logs, photos, products, product_inventory, feed_chart, protocols, recipes, tips, reminders, university_lessons, lab_notes, grow_scores, weekly_reviews, recommendations, warnings, feature_flags, admin_announcements, environment_logs, and grow_exports.

## Stripe Setup

1. Create two Stripe recurring prices: Professional Monthly and Professional Yearly.
2. Add the price IDs to `.env.local`.
3. Set the checkout success URL to `/dashboard?checkout=success`.
4. Configure a webhook endpoint at `/api/stripe/webhook`.
5. Listen for `checkout.session.completed`, subscription create/update/delete, and `invoice.payment_failed`.

Without Stripe keys, `/api/stripe/checkout` redirects back to the pricing page in mock checkout mode.

## PWA And Mobile App Path

The app already includes PWA basics through `public/manifest.json`, `public/sw.js`, and the service worker registration component. Capacitor is configured for the later iOS/Android wrapper.

For mobile packaging, deploy the Next.js app first, then point Capacitor at the production URL:

```bash
CAPACITOR_SERVER_URL=https://your-production-domain.com npm run cap:sync
npm run cap:open:android
npm run cap:open:ios
```

More detail: `docs/mobile-app-roadmap.md`.

## Key Routes

- `/dashboard` command dashboard
- `/onboarding` smart onboarding
- `/grows` grow tracker
- `/check-in` daily check-in
- `/feed-calculator` Catalyx feed calculator
- `/feed-charts` adaptive feed charts
- `/copilot` Catalyx Intelligence Engine
- `/journal` smart grow journal
- `/products` product catalogue and education
- `/protocols` Catalyx protocols and recipes
- `/inventory` My Shelf
- `/university` Catalyx University and Lab Notes
- `/analytics` grow analytics
- `/photos` photo tracking
- `/calendar` reminders
- `/export` Professional exports
- `/pricing` subscriptions
- `/admin` admin control centre

## Product System

The official Catalyx lineup is centralised in `lib/catalyx.ts` and used across the app:

A-X PRO, B-X PRO, MICRO-X, ROOT-X, VITAL-X, PK-X, RIPEN-X, TRACE-X, IRON-X, and FLUSH-X.

Stage recommendations are encoded exactly:

- Seedling: ROOT-X, VITAL-X
- Vegetative: A-X PRO, B-X PRO, MICRO-X, ROOT-X
- Early Flower: PK-X, TRACE-X
- Mid Flower: PK-X, VITAL-X
- Late Flower: RIPEN-X, TRACE-X
- Flush: FLUSH-X

## Verification

```bash
npm run typecheck
npm run build
```

Legal note: The app provides general cultivation and plant nutrition guidance only. Users are responsible for following all local laws and product label directions.
