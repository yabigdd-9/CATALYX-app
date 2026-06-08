# Catalyx Labs Grow OS — Codex Build Prompt

Build a full-stack precision cultivation app (Next.js App Router, TypeScript, Tailwind, Supabase-ready, Stripe subscriptions, PWA). Preserve the original e-commerce template structure; only add or edit files — never delete or subtract from the template.

## Core product system

Official lineup in `lib/catalyx.ts`: A-X PRO, B-X PRO, MICRO-X, ROOT-X, VITAL-X, PK-X, RIPEN-X, TRACE-X, FLUSH-X.

Stage recommendations:

- Seedling: ROOT-X, VITAL-X
- Vegetative: A-X PRO, B-X PRO, MICRO-X, ROOT-X
- Early Flower: PK-X, TRACE-X
- Mid Flower: PK-X, VITAL-X
- Late Flower: RIPEN-X, TRACE-X
- Flush: FLUSH-X

## Phase 1 — Core app

Authentication, dashboard, onboarding, grow tracker, daily check-in, feed calculator, feed logging, basic product catalogue, basic reminders.

## Subscription / Pro Mode

Add a paid subscription system that unlocks Catalyx Pro Mode.

Use Stripe for payments.

Plans:

1. Free Plan
- Basic grow tracker
- Basic feed reminders
- Basic product info
- Limited photo uploads
- Basic feed calculator

2. Catalyx Pro Monthly
- Unlock advanced feed charts
- Full product education guides
- Advanced grow tips
- Plant photo timeline
- EC / pH / runoff analytics
- Product usage tracking
- Inventory tracking
- Stage-based recommendations
- Deficiency and troubleshooting guides
- Custom reminders
- Export grow journal as PDF

3. Catalyx Pro Yearly
- Same as monthly
- Discounted yearly pricing

Pro Mode Features:

- Detailed Catalyx Labs product guide
- Explain what each product does
- Explain when to use each product
- Explain what not to mix
- Explain beginner dose vs pro dose
- Explain signs of overuse
- Explain signs of deficiency
- Explain shelf life and storage notes
- Explain product compatibility
- Give weekly grow-stage tips
- Give feeding suggestions based on plant stage, medium, and previous logs
- Show warnings if pH, EC, or runoff values look wrong
- Give “what to do next” advice after each feed log
- Give product-specific tips for:
  - A-X / Grow Base A
  - B-X / Grow Base B
  - Root-X
  - Balance-X / Calmag
  - Struct-X / Silica
  - Bloom-X
  - PK-X / Ignite-X
  - Vital-X
  - Fade-X
  - Flush-X

Important:

The app must use locked Pro sections with upgrade prompts.
Free users should see previews of Pro features but not full access.
Admin should be able to edit which features are Free or Pro.
Include Stripe checkout, customer portal, subscription status, and webhook handling.
Add database tables for subscriptions and user_plan.

## Phase 2 — Pro intelligence

Locked Pro sections, adaptive feed charts, advanced analytics, weekly grow review, recovery playbooks, outcome forecasting, compare my grow, exports, inventory tracking, Catalyx Copilot depth.

## Phase 3 — Brand ecosystem

Catalyx University, Lab Notes, protocols, recipes, product education, My Shelf, store pages.

## Phase 4 — Polish

PWA, loading/empty states, admin polish, launch readiness.

## Database

Include: users, subscriptions, user_plan, grows, plants, daily_checkins, feed_logs, photos, products, product_inventory, feed_chart, protocols, recipes, tips, reminders, university_lessons, lab_notes, grow_scores, weekly_reviews, recommendations, warnings, feature_flags, admin_announcements, environment_logs, grow_exports.

## Stripe

Checkout at `/api/stripe/checkout`, portal at `/api/stripe/portal`, webhooks at `/api/stripe/webhook`. Env: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `STRIPE_PRICE_PRO_MONTHLY`, `STRIPE_PRICE_PRO_YEARLY`.

Make Catalyx Pro Mode feel genuinely valuable, like a premium grow assistant, not just a paywall.
