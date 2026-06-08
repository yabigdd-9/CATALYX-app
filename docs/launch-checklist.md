# Catalyx Labs Launch Checklist

## Auth

- Sign up with email/password.
- Confirm the email verification redirect lands on `/auth/callback`.
- Confirm login restores the session after a browser refresh.
- Confirm logout clears the session.
- Request a password reset from `/forgot-password`.
- Open the reset link and set a new password at `/update-password`.
- Confirm `/account` shows the current plan.

## Stripe

- Match the deployment env block in `docs/stripe-setup.md`.
- Set `NEXT_PUBLIC_SITE_URL` to the deployed HTTPS domain.
- Set `STRIPE_MODE=live` in the deployment environment only.
- Set a live `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in the deployment environment.
- Use `STRIPE_PRODUCT_PRO=prod_UaYyE8amE77X7c`.
- Use live Stripe price IDs in `STRIPE_PRICE_PRO_MONTHLY` and `STRIPE_PRICE_PRO_YEARLY`.
- Set `STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true` only after Stripe Tax is enabled for the account.
- Remove `STRIPE_WEBHOOK_TEST_ENABLED` from the deployed runtime.
- Register the production webhook endpoint at `/api/stripe/webhook`.
- Subscribe the webhook to `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.*`, and `invoice.payment_failed`.
- Run `npm run stripe:list-prices` against the live key and confirm the configured product plus monthly/yearly prices resolve in live mode.
- Test Checkout success and cancellation.
- Test product cart checkout from `/cart` with a real one-time Stripe payment.
- Test a delayed-payment success path and confirm `product_orders.status` moves to `paid`.
- Test a delayed-payment failure path and confirm `product_orders.status` moves to `failed`.
- Test billing portal access.
- Test subscription create, update, cancel, and invoice failure webhooks.
- Confirm Pro gates unlock immediately after a successful payment.
- Confirm product orders are captured in `product_orders` after `checkout.session.completed`.
- Confirm `product_orders.order_lines` persists the purchased SKUs and quantities.
- Confirm `/cart` rejects unavailable items instead of silently dropping them.
- Confirm the Stripe return flow is usable on a mobile-sized browser.

## Supabase

- Apply `supabase/schema.sql`.
- Apply `supabase/seed.sql`.
- Review and apply `supabase/rls-policies.sql`.
- Apply `supabase/indexes.sql`.
- Apply `supabase/production-patch.sql` before live product-order verification.
- Confirm the `grow-photos` storage bucket exists.
- Confirm anon can read catalogue tables but cannot read private user/grow tables.
- Enable Supabase leaked-password protection in Auth password security.
- Confirm saves work for grows, rooms, tents, plants, feed logs, reminders, photos, inventory, journal entries, daily check-ins, environment logs, and exports.
- Confirm admin routes require an admin session and `CATALYX_ADMIN_EMAILS` or `app_metadata.role = admin`.
- Re-run Supabase security and performance advisors.

## AI

- Confirm Copilot works without `OPENAI_API_KEY` using the rule engine.
- Set `OPENAI_API_KEY` server-side and confirm Copilot shows Live AI when the model responds.
- Confirm AI output references available evidence and does not invent missing photos or logs.

## Pro Intelligence

- Confirm Weekly Review reads saved logs.
- Confirm Forecast changes when logs/check-ins change.
- Confirm Compare My Grow reads saved grows.
- Confirm Recovery Mode activates from high stress, pH drift, or rising runoff EC.

## PWA And Mobile

- Open `/install` on a real phone and follow the install steps.
- Install the PWA on iPhone Safari.
- Install the PWA on Android Chrome.
- Check mobile nav, forms, tables, sticky actions, and photo upload.
- Confirm icons and splash screens render cleanly.
- Enable notifications, send a test reminder, and create a due reminder.
- For true background push, configure Web Push keys and a scheduled sender before relying on server-triggered reminders.

## Exports

- Download `/api/export/grow-report`.
- Download `/api/export/timeline-report`.
- Confirm both files open as branded Catalyx PDFs and include the safety disclaimer.

## Final QA

- Click every route.
- Submit every form.
- Check empty states.
- Check error states.
- Run `npm run build`.
- Run `npx tsc --noEmit`.
