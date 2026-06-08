# Stripe setup — Catalyx Pro

## 1. Create live recurring prices

In [Stripe Dashboard](https://dashboard.stripe.com) ( **Live mode** toggle on):

1. **Products** -> **Add product** -> `Catalyx Professional`
2. Add a **Recurring** price of `NZD 19.99` every month -> save
3. Add a second **Recurring** price of `NZD 199.00` every year -> save

Copy the **Product ID** (`prod_...`) and each **Price ID** (`price_...`).

Stripe uses the same `prod_...` and `price_...` prefixes in both test and live mode.  
Confirm you are copying IDs from the **Live mode** dashboard before using them in production.

## 2. Add keys to `.env.local`

```bash
STRIPE_MODE=live
STRIPE_SECRET_KEY=sk_live_...          # restricted rk_live_... preferred when scoped correctly
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRO=prod_...            # live Catalyx Professional Product ID
STRIPE_PRICE_PRO_MONTHLY=price_...     # live monthly Price ID
STRIPE_PRICE_PRO_YEARLY=price_...      # live yearly Price ID
STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true # enable after configuring Stripe Tax for product orders
```

Restart the dev server after saving.

## 2b. Production deployment env

Set these in your deployment platform before switching product checkout to live:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com

NEXT_PUBLIC_SUPABASE_URL=https://lqoqxalmimpmrmlqcaft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

STRIPE_MODE=live
STRIPE_SECRET_KEY=rk_live_...          # preferred; use sk_live_... only if needed
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRO=prod_...
STRIPE_PRICE_PRO_MONTHLY=price_...
STRIPE_PRICE_PRO_YEARLY=price_...
STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true
```

Notes:
- Keep `STRIPE_MODE=test` locally unless you are intentionally testing live-mode redirects and keys.
- `STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true` should only be set after Stripe Tax is enabled for the account.
- `SUPABASE_SERVICE_ROLE_KEY` is required in the deployed server runtime so `/api/stripe/webhook` and `/api/stripe/checkout-status` can persist paid orders.

## 2c. Current production env block for this repo

As of June 1, 2026, the repo is wired around the Supabase project below and the current Catalyx Pro Stripe product/price IDs below. Secrets stay redacted here on purpose.

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com

NEXT_PUBLIC_SUPABASE_URL=https://lqoqxalmimpmrmlqcaft.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...

SUPABASE_INDEXES_APPLIED=true
SUPABASE_LEAKED_PASSWORD_PROTECTION_ENABLED=true
CATALYX_ADMIN_EMAILS=admin@your-domain.com

STRIPE_MODE=live
STRIPE_SECRET_KEY=rk_live_...          # or sk_live_... if required by your Stripe setup
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRODUCT_PRO=prod_UaYyE8amE77X7c
STRIPE_PRICE_PRO_MONTHLY=price_1TbNrk9cJdFerAa5D3cJlpFH
STRIPE_PRICE_PRO_YEARLY=price_1TbNxx9cJdFerAa5DOaTXVwg
STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true

OPENAI_API_KEY=...
OPENAI_MODEL=gpt-5.2

WEB_PUSH_PUBLIC_KEY=...
WEB_PUSH_PRIVATE_KEY=...
```

Do not set these in the deployed runtime:

```bash
STRIPE_WEBHOOK_TEST_ENABLED=true
```

Current local-only state that still needs to change before launch:

- `NEXT_PUBLIC_SITE_URL` is still `http://127.0.0.1:3029`.
- `STRIPE_MODE` is still `test`.
- The resolved Stripe key is still a test key.
- `STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED` is still `false`.
- `STRIPE_WEBHOOK_TEST_ENABLED` is still `true`.

## 3. Validate prices from the CLI

After `STRIPE_SECRET_KEY` is set:

```bash
npm run stripe:list-prices
```

The script prints all recurring prices, checks whether the configured monthly/yearly prices resolve to `Catalyx Professional`, and suggests Catalyx-matched IDs when available. Copy the **Product ID** plus the **monthly** and **yearly** `price_...` IDs into `.env.local`.

## 4. Webhook (production)

- Endpoint: `https://your-domain.com/api/stripe/webhook`
- Events: `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.*`, `invoice.payment_failed`
- Put the signing secret in `STRIPE_WEBHOOK_SECRET`
- Do not use the local-only `/api/stripe/webhook-test` route for production verification.

## 5. Product orders

- Apply `supabase/production-patch.sql` so `product_orders.order_lines` exists for fulfilment quantities.
- Configure Stripe Tax, then set `STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true`.
- Product Checkout charges the `/cart` standard shipping estimate as a fixed `NZD 10.00` shipping option.
- Complete a test product purchase and confirm the paid Checkout Session persists to `product_orders`.

## 6. Verify

Open `/stripe-setup` and `/launch-readiness` — Stripe rows should show green when mode, secret key, Product ID, monthly/yearly Price IDs, site URL, and webhook secret are set.
Run `npm run stripe:list-prices` again after editing `.env.local`; do not rely on the first monthly price returned by Stripe if multiple products exist.

## 7. Product checkout QA

Run these against a real deployed URL after webhook + live env setup:

1. Paid purchase: add one SKU to `/cart`, complete Stripe Checkout, return to `/cart`, confirm order verification succeeds, and confirm `product_orders.order_lines` contains the purchased SKU and quantity.
2. Multi-SKU purchase: add multiple products with different quantities, complete checkout, and confirm `order_lines` persists every SKU with the correct quantity.
3. Cancel flow: start Checkout, cancel, return to `/cart`, confirm the cart is preserved and no order row is created.
4. Async payment success: pay with a delayed method, confirm `/cart` shows pending first, then confirm webhook updates `product_orders.status` to `paid`.
5. Async payment failure: repeat with a failing delayed method and confirm `product_orders.status` becomes `failed`.
6. Stock rejection: force an unavailable item in the cart and confirm `/api/stripe/product-checkout` rejects it instead of silently dropping it.
7. Mobile return: complete the return flow on a mobile-sized browser and confirm the verification banner remains readable and actionable.

## 8. Exact cutover order

Use this order for the final live flip:

1. Apply `supabase/production-patch.sql` if `product_orders.order_lines` is not already present in production.
2. Enable Stripe Tax for the account, then set `STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true` in the deployed runtime.
3. Set the production env block above in the deployment platform, using the live domain, live Stripe secret, and production webhook secret.
4. Remove `STRIPE_WEBHOOK_TEST_ENABLED` from the deployed runtime entirely.
5. Register `https://your-domain.com/api/stripe/webhook` for `checkout.session.completed`, `checkout.session.async_payment_succeeded`, `checkout.session.async_payment_failed`, `customer.subscription.*`, and `invoice.payment_failed`.
6. Run `npm run stripe:list-prices` against the live secret key and confirm the configured product and both recurring prices resolve in live mode.
7. Deploy and open `/stripe-setup` and `/launch-readiness`; both should clear the current Stripe env blockers.
8. Complete one real subscription checkout from `/pricing`, confirm Pro unlocks, and confirm billing portal access from `/account`.
9. Complete one real product checkout from `/cart`, then confirm `product_orders` and `product_orders.order_lines` persist the purchased SKUs and quantities.
10. Run delayed-payment success/failure plus mobile return-flow QA before opening traffic.
