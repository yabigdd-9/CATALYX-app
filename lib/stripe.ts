import Stripe from 'stripe'

export const stripeConfig = {
  secretKey: process.env.STRIPE_SECRET_KEY,
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  monthlyPriceId: process.env.STRIPE_PRICE_PRO_MONTHLY,
  yearlyPriceId: process.env.STRIPE_PRICE_PRO_YEARLY,
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
  isProduction: process.env.NODE_ENV === 'production',
}

export const stripe = stripeConfig.secretKey
  ? new Stripe(stripeConfig.secretKey, {
      apiVersion: '2026-04-22.dahlia',
    })
  : null

export const hasStripeCheckout = Boolean(stripe && stripeConfig.monthlyPriceId && stripeConfig.yearlyPriceId)
export const hasStripeWebhook = Boolean(stripe && stripeConfig.webhookSecret)

function stripeSetupError() {
  return new Error('Stripe checkout is not configured. Set STRIPE_SECRET_KEY, STRIPE_PRICE_PRO_MONTHLY, and STRIPE_PRICE_PRO_YEARLY.')
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
    success_url: `${stripeConfig.siteUrl}/dashboard?checkout=success`,
    cancel_url: `${stripeConfig.siteUrl}/pricing?checkout=cancelled`,
  })

  return session.url ?? `${stripeConfig.siteUrl}/pricing?mockCheckout=1`
}

export async function createStripePortal(customerId?: string) {
  if (!stripe || !customerId) {
    if (stripeConfig.isProduction) throw stripeSetupError()
    return `${stripeConfig.siteUrl}/profile?mockPortal=1`
  }

  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${stripeConfig.siteUrl}/profile`,
  })

  return session.url
}
