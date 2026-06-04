import Stripe from 'stripe'
import { products as storeProducts } from '@/lib/products'
import type { CartItem } from '@/types'

export type StripeMode = 'test' | 'live'
export type StripeKeyKind = 'missing' | 'test' | 'live' | 'unknown'
export type StripeSiteUrlKind = 'missing' | 'local' | 'production' | 'non_https'
export type StripeLaunchStage = 'local_test' | 'mixed' | 'production_ready'
export type StripeLaunchTone = 'blue' | 'amber' | 'lime'
export type StripeLaunchDiagnostic = {
  label: string
  value: string
  status: string
  tone: StripeLaunchTone
}
export type StripeLaunchBlocker = {
  label: string
  detail: string
}
export type StripeLaunchCheck = readonly [label: string, ok: boolean, action: string]
export type StripeLaunchProfile = {
  stage: StripeLaunchStage
  stageLabel: string
  stageTone: StripeLaunchTone
  summary: string
  productionReady: boolean
  localTestingReady: boolean
  blockers: StripeLaunchBlocker[]
  notes: string[]
  diagnostics: StripeLaunchDiagnostic[]
  checks: StripeLaunchCheck[]
  finalFlipEnv: string[]
  finalFlipChecklist: string[]
  localWebhookTestEnabled: boolean
  siteUrlKind: StripeSiteUrlKind
  secretKeyKind: StripeKeyKind
  secretKeySource: string
}

function trimEnv(value?: string) {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function resolveSiteUrl(value?: string) {
  const trimmed = trimEnv(value)
  if (!trimmed) return 'http://localhost:3000'

  try {
    return new URL(trimmed).origin
  } catch {
    return 'http://localhost:3000'
  }
}

export function getStripeMode(): StripeMode {
  const explicit = process.env.STRIPE_MODE?.trim().toLowerCase()
  if (explicit === 'live' || explicit === 'test') return explicit
  return process.env.NODE_ENV === 'production' ? 'live' : 'test'
}

function getStripeSecretKeySource() {
  if (trimEnv(process.env.STRIPE_SECRET_KEY)) return 'STRIPE_SECRET_KEY'
  if (getStripeMode() === 'live' && trimEnv(process.env.STRIPE_SECRET_KEY_LIVE)) return 'STRIPE_SECRET_KEY_LIVE'
  if (getStripeMode() === 'test' && trimEnv(process.env.STRIPE_SECRET_KEY_TEST)) return 'STRIPE_SECRET_KEY_TEST'
  return 'missing'
}

function resolveStripeSecretKey(): string | undefined {
  const direct = trimEnv(process.env.STRIPE_SECRET_KEY)
  if (direct) return direct

  const mode = getStripeMode()
  if (mode === 'live') return trimEnv(process.env.STRIPE_SECRET_KEY_LIVE)
  return trimEnv(process.env.STRIPE_SECRET_KEY_TEST)
}

export function stripeKeyMatchesMode(key: string | undefined, mode: StripeMode = getStripeMode()): boolean {
  if (!key) return false
  return mode === 'live'
    ? key.startsWith('sk_live_') || key.startsWith('rk_live_')
    : key.startsWith('sk_test_') || key.startsWith('rk_test_')
}

export function getStripeKeyKind(key: string | undefined): StripeKeyKind {
  if (!key) return 'missing'
  if (key.startsWith('sk_live_') || key.startsWith('rk_live_')) return 'live'
  if (key.startsWith('sk_test_') || key.startsWith('rk_test_')) return 'test'
  return 'unknown'
}

export function getStripeSiteUrlKind(siteUrl: string | undefined): StripeSiteUrlKind {
  const value = trimEnv(siteUrl)
  if (!value) return 'missing'

  try {
    const parsed = new URL(value)
    const host = parsed.hostname.toLowerCase()
    if (host === 'localhost' || host === '127.0.0.1') return 'local'
    return parsed.protocol === 'https:' ? 'production' : 'non_https'
  } catch {
    if (value.includes('localhost') || value.includes('127.0.0.1')) return 'local'
    return value.startsWith('https://') ? 'production' : 'non_https'
  }
}

export const stripeConfig = {
  mode: getStripeMode(),
  secretKey: resolveStripeSecretKey(),
  webhookSecret: trimEnv(process.env.STRIPE_WEBHOOK_SECRET),
  productId: trimEnv(process.env.STRIPE_PRODUCT_PRO),
  monthlyPriceId: trimEnv(process.env.STRIPE_PRICE_PRO_MONTHLY),
  yearlyPriceId: trimEnv(process.env.STRIPE_PRICE_PRO_YEARLY),
  productAutomaticTaxEnabled: process.env.STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED === 'true',
  siteUrl: resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL),
  isProduction: process.env.NODE_ENV === 'production',
}

export const stripe = stripeConfig.secretKey
  ? new Stripe(stripeConfig.secretKey, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null

export const isLiveStripeKey = getStripeKeyKind(stripeConfig.secretKey) === 'live'

function isValidPriceId(priceId?: string) {
  return Boolean(priceId?.startsWith('price_'))
}

function isValidProductId(productId?: string) {
  return Boolean(productId?.startsWith('prod_'))
}

export const hasStripeCheckout = Boolean(
  stripe && isValidPriceId(stripeConfig.monthlyPriceId) && isValidPriceId(stripeConfig.yearlyPriceId)
)
export const hasStripeWebhook = Boolean(stripe && stripeConfig.webhookSecret)

function maskStripeValue(value?: string) {
  if (!value) return 'Not set'
  if (value.length <= 12) return `${value.slice(0, 4)}...`
  return `${value.slice(0, 7)}...${value.slice(-4)}`
}

function describeSiteUrl(kind: StripeSiteUrlKind, siteUrl: string) {
  if (kind === 'production') return `Using deployed HTTPS URL ${siteUrl}.`
  if (kind === 'local') return `Current NEXT_PUBLIC_SITE_URL is local (${siteUrl}).`
  if (kind === 'non_https') return `NEXT_PUBLIC_SITE_URL is not HTTPS (${siteUrl}).`
  return 'NEXT_PUBLIC_SITE_URL is missing.'
}

function buildStripeLaunchProfile(): StripeLaunchProfile {
  const siteUrlKind = getStripeSiteUrlKind(stripeConfig.siteUrl)
  const secretKeyKind = getStripeKeyKind(stripeConfig.secretKey)
  const secretKeySource = getStripeSecretKeySource()
  const localWebhookTestEnabled = process.env.STRIPE_WEBHOOK_TEST_ENABLED === 'true'
  const modeSecretAligned = stripeKeyMatchesMode(stripeConfig.secretKey, stripeConfig.mode)
  const productIdReady = isValidProductId(stripeConfig.productId)
  const monthlyPriceReady = isValidPriceId(stripeConfig.monthlyPriceId)
  const yearlyPriceReady = isValidPriceId(stripeConfig.yearlyPriceId)
  const webhookReady = Boolean(stripeConfig.webhookSecret)
  const productionReady =
    stripeConfig.mode === 'live' &&
    secretKeyKind === 'live' &&
    modeSecretAligned &&
    productIdReady &&
    monthlyPriceReady &&
    yearlyPriceReady &&
    webhookReady &&
    stripeConfig.productAutomaticTaxEnabled &&
    siteUrlKind === 'production' &&
    !localWebhookTestEnabled
  const localTestingReady =
    stripeConfig.mode === 'test' &&
    siteUrlKind === 'local' &&
    modeSecretAligned &&
    secretKeyKind === 'test' &&
    productIdReady &&
    monthlyPriceReady &&
    yearlyPriceReady &&
    webhookReady

  const blockers: StripeLaunchBlocker[] = []
  if (stripeConfig.mode !== 'live') {
    blockers.push({
      label: 'Deployment is still in Stripe test mode',
      detail: `Current STRIPE_MODE=${stripeConfig.mode}. Keep test mode locally, but set STRIPE_MODE=live in the deployed environment before taking payments.`,
    })
  }
  if (!stripeConfig.secretKey) {
    blockers.push({
      label: 'Live secret key is missing',
      detail: 'Set STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE to a live sk_live_... or rk_live_... key in the deployment environment.',
    })
  } else if (!modeSecretAligned) {
    blockers.push({
      label: 'Resolved Stripe secret key does not match STRIPE_MODE',
      detail: `The app resolved ${secretKeySource} as a ${secretKeyKind} key while STRIPE_MODE=${stripeConfig.mode}. Align the key and mode before launch.`,
    })
  } else if (secretKeyKind !== 'live') {
    blockers.push({
      label: 'Resolved Stripe secret key is not live',
      detail: `The app resolved ${secretKeySource} as a ${secretKeyKind} key. Replace it with a live key before enabling production checkout.`,
    })
  }
  if (siteUrlKind !== 'production') {
    blockers.push({
      label: 'Production site URL is not ready',
      detail:
        siteUrlKind === 'local'
          ? `NEXT_PUBLIC_SITE_URL still points at localhost (${stripeConfig.siteUrl}). Set it to the deployed HTTPS domain so Stripe returns land on production.`
          : siteUrlKind === 'non_https'
            ? `NEXT_PUBLIC_SITE_URL is not HTTPS (${stripeConfig.siteUrl}). Stripe production redirects should use the deployed HTTPS domain.`
            : 'Set NEXT_PUBLIC_SITE_URL to the deployed HTTPS domain before flipping Stripe live.',
    })
  }
  if (!productIdReady) {
    blockers.push({
      label: 'Catalyx Pro product ID is missing',
      detail: 'Set STRIPE_PRODUCT_PRO to the live Stripe Product ID for Catalyx Pro.',
    })
  }
  if (!monthlyPriceReady) {
    blockers.push({
      label: 'Monthly price ID is missing',
      detail: 'Set STRIPE_PRICE_PRO_MONTHLY to the live recurring monthly price for Catalyx Pro.',
    })
  }
  if (!yearlyPriceReady) {
    blockers.push({
      label: 'Yearly price ID is missing',
      detail: 'Set STRIPE_PRICE_PRO_YEARLY to the live recurring yearly price for Catalyx Pro.',
    })
  }
  if (!webhookReady) {
    blockers.push({
      label: 'Production webhook signing secret is missing',
      detail: 'Set STRIPE_WEBHOOK_SECRET to the signing secret from the production webhook endpoint.',
    })
  }
  if (!stripeConfig.productAutomaticTaxEnabled) {
    blockers.push({
      label: 'Product automatic tax is not enabled',
      detail: 'Enable Stripe Tax for the account, then set STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true before live product orders.',
    })
  }
  if (localWebhookTestEnabled) {
    blockers.push({
      label: 'Local webhook test flag is still enabled',
      detail: 'Remove STRIPE_WEBHOOK_TEST_ENABLED from deployment env. The webhook-test route is only for localhost test-mode persistence checks.',
    })
  }

  let stage: StripeLaunchStage = 'mixed'
  let stageLabel = 'Mixed Stripe config'
  let stageTone: StripeLaunchTone = 'amber'
  let summary =
    'Stripe is partially configured, but the current repo env mixes local/test signals with production launch requirements.'

  if (productionReady) {
    stage = 'production_ready'
    stageLabel = 'Deploy-ready live Stripe config'
    stageTone = 'lime'
    summary =
      'The repo env is aligned for a live Stripe deployment. Finish webhook registration and real payment QA before opening traffic.'
  } else if (stripeConfig.mode === 'test' && siteUrlKind === 'local') {
    stage = 'local_test'
    stageLabel = 'Local Stripe test config'
    stageTone = 'blue'
    summary =
      'This repo is set up for localhost Stripe diagnostics. That is safe for development, but it is not the final live handoff until the production blockers below are cleared.'
  }

  const notes = [
    'This page only syntax-checks Product and Price IDs. Stripe uses the same `prod_...` and `price_...` prefixes in test and live mode, so confirm the live IDs in Stripe Dashboard or with `npm run stripe:list-prices` using a live secret key.',
    secretKeySource === 'STRIPE_SECRET_KEY' && (trimEnv(process.env.STRIPE_SECRET_KEY_TEST) || trimEnv(process.env.STRIPE_SECRET_KEY_LIVE))
      ? 'STRIPE_SECRET_KEY overrides STRIPE_SECRET_KEY_TEST and STRIPE_SECRET_KEY_LIVE in this app. Remove duplicate key vars if you want the active key source to be unambiguous.'
      : '',
    localTestingReady
      ? 'Local test checkout, portal, and webhook-test persistence are wired for localhost. Keep live keys out of `.env.local` unless you are intentionally running a live smoke test.'
      : '',
  ].filter(Boolean)

  const checks: StripeLaunchCheck[] = [
    [
      'Stripe mode',
      stripeConfig.mode === 'live',
      stripeConfig.mode === 'live'
        ? 'STRIPE_MODE is already set to live.'
        : 'Current STRIPE_MODE=test. Keep that locally if you want localhost diagnostics, but switch the deployed runtime to STRIPE_MODE=live before launch.',
    ],
    [
      'Live secret key',
      secretKeyKind === 'live' && modeSecretAligned,
      !stripeConfig.secretKey
        ? 'Set STRIPE_SECRET_KEY or STRIPE_SECRET_KEY_LIVE to a live Stripe secret key.'
        : !modeSecretAligned
          ? `The app resolved ${secretKeySource} as a ${secretKeyKind} key while STRIPE_MODE=${stripeConfig.mode}.`
          : `The app resolved ${secretKeySource} as a ${secretKeyKind} key.`,
    ],
    [
      'Catalyx Pro product ID',
      productIdReady,
      productIdReady
        ? `STRIPE_PRODUCT_PRO is set to ${stripeConfig.productId}.`
        : 'Set STRIPE_PRODUCT_PRO to the live Catalyx Pro product ID.',
    ],
    [
      'Monthly price ID',
      monthlyPriceReady,
      monthlyPriceReady
        ? `STRIPE_PRICE_PRO_MONTHLY is set to ${stripeConfig.monthlyPriceId}. Confirm it belongs to the live Catalyx Pro product before launch.`
        : 'Set STRIPE_PRICE_PRO_MONTHLY to the live recurring monthly price for Catalyx Pro.',
    ],
    [
      'Yearly price ID',
      yearlyPriceReady,
      yearlyPriceReady
        ? `STRIPE_PRICE_PRO_YEARLY is set to ${stripeConfig.yearlyPriceId}. Confirm it belongs to the live Catalyx Pro product before launch.`
        : 'Set STRIPE_PRICE_PRO_YEARLY to the live recurring yearly price for Catalyx Pro.',
    ],
    [
      'Webhook secret',
      webhookReady,
      webhookReady
        ? 'STRIPE_WEBHOOK_SECRET is set. Register the production webhook endpoint with the required events before launch.'
        : 'Set STRIPE_WEBHOOK_SECRET from the production webhook endpoint.',
    ],
    [
      'Product automatic tax',
      stripeConfig.productAutomaticTaxEnabled,
      stripeConfig.productAutomaticTaxEnabled
        ? 'Product automatic tax is enabled for one-time order checkout.'
        : 'Enable Stripe Tax, then set STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true before live product orders.',
    ],
    [
      'Production site URL',
      siteUrlKind === 'production',
      describeSiteUrl(siteUrlKind, stripeConfig.siteUrl),
    ],
    [
      'Local webhook test flag cleared',
      !localWebhookTestEnabled,
      localWebhookTestEnabled
        ? 'Remove STRIPE_WEBHOOK_TEST_ENABLED from deployment env. It is only for localhost persistence testing.'
        : 'No local-only webhook test flag is active.',
    ],
  ]

  const diagnostics: StripeLaunchDiagnostic[] = [
    {
      label: 'Resolved secret key',
      value: maskStripeValue(stripeConfig.secretKey),
      status:
        secretKeyKind === 'missing'
          ? 'Missing'
          : !modeSecretAligned
            ? `${secretKeyKind} key / mode mismatch`
            : secretKeyKind === 'live'
              ? 'Live key active'
              : secretKeyKind === 'test'
                ? 'Test key active'
                : 'Unknown key format',
      tone:
        secretKeyKind === 'live' && modeSecretAligned
          ? 'lime'
          : secretKeyKind === 'test' && modeSecretAligned
            ? 'blue'
            : 'amber',
    },
    {
      label: 'Secret key source',
      value: secretKeySource,
      status: secretKeySource === 'missing' ? 'Missing' : 'Resolved',
      tone: secretKeySource === 'missing' ? 'amber' : 'blue',
    },
    {
      label: 'Webhook secret',
      value: maskStripeValue(stripeConfig.webhookSecret),
      status: webhookReady ? 'Set' : 'Missing',
      tone: webhookReady ? 'lime' : 'amber',
    },
    {
      label: 'Local webhook test',
      value: localWebhookTestEnabled ? 'Enabled' : 'Disabled',
      status: localWebhookTestEnabled ? 'Local-only flag is on' : 'Off',
      tone: localWebhookTestEnabled ? 'blue' : 'lime',
    },
    {
      label: 'Catalyx Pro product',
      value: stripeConfig.productId ?? 'Not set',
      status: productIdReady ? 'Configured' : 'Missing',
      tone: productIdReady ? 'lime' : 'amber',
    },
    {
      label: 'Monthly price',
      value: stripeConfig.monthlyPriceId ?? 'Not set',
      status: monthlyPriceReady ? 'Configured' : 'Missing',
      tone: monthlyPriceReady ? 'lime' : 'amber',
    },
    {
      label: 'Yearly price',
      value: stripeConfig.yearlyPriceId ?? 'Not set',
      status: yearlyPriceReady ? 'Configured' : 'Missing',
      tone: yearlyPriceReady ? 'lime' : 'amber',
    },
    {
      label: 'Product automatic tax',
      value: stripeConfig.productAutomaticTaxEnabled ? 'Enabled' : 'Disabled',
      status: stripeConfig.productAutomaticTaxEnabled ? 'Ready' : 'Needed',
      tone: stripeConfig.productAutomaticTaxEnabled ? 'lime' : 'amber',
    },
    {
      label: 'Site URL',
      value: stripeConfig.siteUrl,
      status:
        siteUrlKind === 'production'
          ? 'HTTPS production URL'
          : siteUrlKind === 'local'
            ? 'Localhost URL'
            : siteUrlKind === 'non_https'
              ? 'Non-HTTPS URL'
              : 'Missing',
      tone: siteUrlKind === 'production' ? 'lime' : siteUrlKind === 'local' ? 'blue' : 'amber',
    },
  ]

  const finalFlipEnv = [
    'NEXT_PUBLIC_SITE_URL=https://your-domain.com',
    'STRIPE_MODE=live',
    'STRIPE_SECRET_KEY=rk_live_...',
    'STRIPE_WEBHOOK_SECRET=whsec_...',
    'STRIPE_PRODUCT_PRO=prod_...',
    'STRIPE_PRICE_PRO_MONTHLY=price_...',
    'STRIPE_PRICE_PRO_YEARLY=price_...',
    'STRIPE_PRODUCT_AUTOMATIC_TAX_ENABLED=true',
  ]

  const finalFlipChecklist = [
    'Set the deployment env block below and remove STRIPE_WEBHOOK_TEST_ENABLED from the deployed runtime.',
    'Run npm run stripe:list-prices with the live secret key and confirm STRIPE_PRODUCT_PRO, STRIPE_PRICE_PRO_MONTHLY, and STRIPE_PRICE_PRO_YEARLY resolve in live mode.',
    'Register https://your-domain.com/api/stripe/webhook with checkout.session.completed, checkout.session.async_payment_succeeded, checkout.session.async_payment_failed, customer.subscription.*, and invoice.payment_failed.',
    'Confirm SUPABASE_SERVICE_ROLE_KEY exists in the deployed server runtime so webhook events can persist plan and product-order updates.',
    'Deploy, open /stripe-setup, and confirm the page shows Deploy-ready live Stripe config with no remaining production blockers.',
    'Complete a real subscription checkout from /pricing, confirm Pro unlocks, and confirm the billing portal opens from /account.',
    'Complete a real product checkout from /cart and confirm product_orders plus order_lines persist the purchased SKUs and quantities.',
    'Run delayed-payment success/failure plus invoice.payment_failed tests and confirm the webhook updates the stored status correctly.',
  ]

  return {
    stage,
    stageLabel,
    stageTone,
    summary,
    productionReady,
    localTestingReady,
    blockers,
    notes,
    diagnostics,
    checks,
    finalFlipEnv,
    finalFlipChecklist,
    localWebhookTestEnabled,
    siteUrlKind,
    secretKeyKind,
    secretKeySource,
  }
}

export const stripeLaunchProfile = buildStripeLaunchProfile()
export const stripeLaunchChecks = stripeLaunchProfile.checks

function stripeSetupError() {
  return new Error('Stripe checkout is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_PRO_MONTHLY, and STRIPE_PRICE_PRO_YEARLY.')
}

export function getStripeLaunchProfile() {
  return stripeLaunchProfile
}

export async function createStripeCheckout({
  plan,
  userId,
  email,
}: {
  plan: 'monthly' | 'yearly'
  userId?: string
  email?: string
}) {
  if (!hasStripeCheckout || !stripe) {
    if (stripeConfig.isProduction) throw stripeSetupError()
    return `${stripeConfig.siteUrl}/pricing?mockCheckout=1&plan=${plan}`
  }

  const price = plan === 'yearly' ? stripeConfig.yearlyPriceId : stripeConfig.monthlyPriceId
  if (!isValidPriceId(price)) {
    throw new Error(`Stripe ${plan} price is not configured.`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items: [{ price, quantity: 1 }],
    customer_email: email,
    allow_promotion_codes: true,
    client_reference_id: userId,
    metadata: {
      user_id: userId ?? '',
      plan,
    },
    subscription_data: {
      metadata: {
        user_id: userId ?? '',
        plan,
      },
    },
    success_url: `${stripeConfig.siteUrl}/dashboard?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${stripeConfig.siteUrl}/pricing?checkout=cancelled`,
  })

  return session.url ?? `${stripeConfig.siteUrl}/pricing?mockCheckout=1`
}

export async function createStripePortal(customerId?: string) {
  if (!stripe || !customerId) {
    if (stripeConfig.isProduction) throw stripeSetupError()
    return `${stripeConfig.siteUrl}/account?mockPortal=1`
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${stripeConfig.siteUrl}/account`,
  })

  return session.url
}

export async function createProductCheckout({
  items,
  email,
  userId,
  storeCreditCents = 0,
  allowPromotionCodes = true,
  rewardRedemptionId = '',
  rewardWalletUserId = '',
}: {
  items: CartItem[]
  email?: string
  userId?: string
  storeCreditCents?: number
  allowPromotionCodes?: boolean
  rewardRedemptionId?: string
  rewardWalletUserId?: string
}) {
  if (!items.length) throw new Error('Cart is empty.')
  if (!stripe) {
    if (stripeConfig.isProduction) throw new Error('Stripe product checkout is not configured. Set STRIPE_SECRET_KEY.')
    return `${stripeConfig.siteUrl}/cart?mockCheckout=1`
  }

  const validatedItems = items
    .map((item) => {
      const product = storeProducts.find((entry) => entry.id === item.productId && entry.inStock)
      if (!product) return null
      const quantity = Math.max(1, Math.min(12, Math.round(Number(item.quantity) || 1)))
      return { product, quantity }
    })
    .filter((item): item is { product: (typeof storeProducts)[number]; quantity: number } => Boolean(item))

  if (!validatedItems.length) throw new Error('Cart contains no current in-stock Catalyx products.')

  const subtotalCents = validatedItems.reduce((total, { product, quantity }) => total + Math.round(product.price * 100) * quantity, 0)
  const appliedStoreCreditCents = Math.max(0, Math.min(Math.round(storeCreditCents), subtotalCents))
  const creditDiscount =
    appliedStoreCreditCents > 0
      ? await stripe.coupons.create({
          amount_off: appliedStoreCreditCents,
          currency: 'nzd',
          duration: 'once',
          name: 'Catalyx CX Store Credit',
          metadata: {
            checkout_type: 'product_order',
            reward_redemption_id: rewardRedemptionId,
            reward_wallet_user_id: rewardWalletUserId || userId || '',
          },
        })
      : null

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: email,
    client_reference_id: userId,
    allow_promotion_codes: allowPromotionCodes,
    billing_address_collection: 'auto',
    shipping_address_collection: {
      allowed_countries: ['NZ', 'AU', 'US', 'GB', 'CA'],
    },
    shipping_options: [
      {
        shipping_rate_data: {
          type: 'fixed_amount',
          fixed_amount: {
            amount: 1000,
            currency: 'nzd',
          },
          display_name: 'Standard shipping',
        },
      },
    ],
    automatic_tax: {
      enabled: stripeConfig.productAutomaticTaxEnabled,
    },
    line_items: validatedItems.map(({ product, quantity }) => ({
      quantity,
      price_data: {
        currency: 'nzd',
        product_data: {
          name: product.name,
          description: product.description,
          metadata: {
            product_id: product.id,
            category: product.category,
          },
        },
        unit_amount: Math.round(product.price * 100),
      },
    })),
    discounts: creditDiscount ? [{ coupon: creditDiscount.id }] : undefined,
    metadata: {
      checkout_type: 'product_order',
      user_id: userId ?? '',
      reward_wallet_user_id: rewardWalletUserId || userId || '',
      reward_redemption_id: rewardRedemptionId,
      product_ids: validatedItems.map(({ product }) => product.id).join(','),
      order_lines: JSON.stringify(validatedItems.map(({ product, quantity }) => ({ product_id: product.id, quantity }))),
      subtotal_cents: String(subtotalCents),
      store_credit_applied_cents: String(appliedStoreCreditCents),
      reward_credit_status: appliedStoreCreditCents > 0 ? 'reserved' : 'none',
    },
    success_url: `${stripeConfig.siteUrl}/cart?checkout=success&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${stripeConfig.siteUrl}/cart?checkout=cancelled`,
  })

  return session.url ?? `${stripeConfig.siteUrl}/cart?checkout=unavailable`
}
