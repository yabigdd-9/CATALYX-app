import 'server-only'

import type Stripe from 'stripe'
import {
  finalizeBackendStoreCreditCheckout,
  releaseBackendStoreCreditCheckout,
  restoreBackendStoreCreditFromRefund,
  syncBackendRewardBalance,
} from '@/lib/rewards-backend'
import { getSupabaseAdmin, resolveAppUserId } from '@/lib/supabase-admin'
import { stripe, stripeConfig } from '@/lib/stripe'

export type StripeWebhookEvent = {
  type: string
  data: { object: Record<string, unknown> }
}

export async function persistStripeWebhookEvent(event: StripeWebhookEvent) {
  const handled = [
    'checkout.session.completed',
    'checkout.session.async_payment_succeeded',
    'checkout.session.async_payment_failed',
    'checkout.session.expired',
    'charge.refunded',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed',
  ].includes(event.type)

  const supabaseAdmin = getSupabaseAdmin()
  if (handled && !supabaseAdmin && stripeConfig.isProduction) {
    return {
      handled,
      persisted: false,
      error: 'SUPABASE_SERVICE_ROLE_KEY must be set for Stripe webhook persistence in production.',
      status: 503,
    }
  }

  if (handled && supabaseAdmin) {
    const metadata = readMetadata(event.data.object)
    if (event.type === 'charge.refunded') {
      await persistRefundEvent(supabaseAdmin, event.data.object)
    } else if (event.type.startsWith('checkout.session.') && metadata.checkout_type === 'product_order') {
      await persistProductOrder(supabaseAdmin, event.type, event.data.object)
    } else {
      await persistSubscriptionEvent(supabaseAdmin, event.type, event.data.object)
    }
  }

  return {
    handled,
    persisted: Boolean(handled && supabaseAdmin),
    type: event.type,
  }
}

async function persistProductOrder(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  type: string,
  object: Record<string, unknown>
) {
  const metadata = readMetadata(object)
  const email = readCheckoutEmail(object)
  const appUserId = await resolveAppUserId(supabaseAdmin, String(object.client_reference_id ?? metadata.user_id ?? ''), email)

  const { error } = await supabaseAdmin.from('product_orders').upsert(
    {
      user_id: appUserId || null,
      stripe_checkout_session_id: readStripeId(object.id),
      stripe_payment_intent_id: readStripeId(object.payment_intent),
      stripe_customer_id: readStripeId(object.customer),
      customer_email: email || null,
      product_ids: metadata.product_ids ?? '',
      order_lines: readOrderLines(metadata.order_lines),
      amount_total: Number(object.amount_total ?? 0) / 100,
      subtotal_cents: Number(metadata.subtotal_cents ?? object.amount_subtotal ?? 0),
      shipping_cents: Number(object.total_details ? (object.total_details as Record<string, unknown>).amount_shipping ?? 0 : 0),
      automatic_tax_cents: Number(object.total_details ? (object.total_details as Record<string, unknown>).amount_tax ?? 0 : 0),
      store_credit_applied_cents: Number(metadata.store_credit_applied_cents ?? 0),
      refunded_amount_cents: 0,
      adjusted_amount_cents: 0,
      reward_credit_status: metadata.reward_credit_status ?? (Number(metadata.store_credit_applied_cents ?? 0) > 0 ? 'reserved' : 'none'),
      reward_checkout_state: {
        reward_redemption_id: metadata.reward_redemption_id ?? '',
        reward_wallet_user_id: metadata.reward_wallet_user_id ?? '',
      },
      currency: String(object.currency ?? 'nzd'),
      status: productOrderStatus(type, object),
    },
    { onConflict: 'stripe_checkout_session_id' }
  )
  if (error) throw error

  const rewardRedemptionId = metadata.reward_redemption_id ?? ''
  if (type === 'checkout.session.completed' || type === 'checkout.session.async_payment_succeeded') {
    const { data: orderRow } = await supabaseAdmin
      .from('product_orders')
      .select('id')
      .eq('stripe_checkout_session_id', readStripeId(object.id))
      .maybeSingle()

    await finalizeBackendStoreCreditCheckout({
      rewardRedemptionId,
      stripeCheckoutSessionId: readStripeId(object.id),
      stripePaymentIntentId: readStripeId(object.payment_intent),
      productOrderId: orderRow?.id ? String(orderRow.id) : undefined,
    })

    await supabaseAdmin
      .from('product_orders')
      .update({
        reward_credit_status: Number(metadata.store_credit_applied_cents ?? 0) > 0 ? 'applied' : 'none',
      })
      .eq('stripe_checkout_session_id', readStripeId(object.id))

    if (appUserId) {
      await syncBackendRewardBalance({
        userCandidate: appUserId,
        email,
      })
    }
  }

  if (type === 'checkout.session.async_payment_failed' || type === 'checkout.session.expired') {
    await releaseBackendStoreCreditCheckout({
      rewardRedemptionId,
      stripeCheckoutSessionId: readStripeId(object.id),
      stripePaymentIntentId: readStripeId(object.payment_intent),
    })

    await supabaseAdmin
      .from('product_orders')
      .update({
        reward_credit_status: Number(metadata.store_credit_applied_cents ?? 0) > 0 ? 'released' : 'none',
      })
      .eq('stripe_checkout_session_id', readStripeId(object.id))
  }
}

function productOrderStatus(type: string, object: Record<string, unknown>) {
  if (type === 'checkout.session.async_payment_succeeded') return 'paid'
  if (type === 'checkout.session.async_payment_failed') return 'failed'
  return String(object.payment_status ?? object.status ?? 'pending')
}

function readOrderLines(value?: string) {
  if (!value) return []
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

async function persistSubscriptionEvent(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  type: string,
  object: Record<string, unknown>
) {
  const snapshot = await getSubscriptionSnapshot(type, object)
  const appUserId = await resolveAppUserId(supabaseAdmin, snapshot.userCandidate, snapshot.email)

  if (!appUserId && !snapshot.customerId) return

  const { error: subscriptionError } = await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: appUserId || null,
      stripe_customer_id: snapshot.customerId || null,
      stripe_subscription_id: snapshot.subscriptionId || null,
      plan: snapshot.plan,
      status: snapshot.status,
      current_period_end: snapshot.currentPeriodEnd
        ? new Date(snapshot.currentPeriodEnd * 1000).toISOString()
        : null,
    },
    { onConflict: 'stripe_subscription_id' }
  )
  if (subscriptionError) throw subscriptionError

  if (appUserId) {
    const isActive = snapshot.status === 'active' || snapshot.status === 'trialing'
    const { error: planError } = await supabaseAdmin.from('user_plan').upsert(
      {
        user_id: appUserId,
        plan: isActive ? 'professional' : 'free',
        feature_access: {
          ai_copilot: true,
          intelligence_depth: isActive,
          weekly_reviews: isActive,
          predictive_warnings: isActive,
          recovery_playbooks: isActive,
          outcome_forecasting: isActive,
          compare_my_grow: isActive,
        },
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id' }
    )
    if (planError) throw planError
  }
}

async function getSubscriptionSnapshot(type: string, object: Record<string, unknown>) {
  const metadata = readMetadata(object)
  let userCandidate = metadata.user_id || String(object.client_reference_id ?? '')
  let email = readCheckoutEmail(object)
  let customerId = readStripeId(object.customer)
  const objectSubscriptionId = readStripeId(object.subscription)
  let subscriptionId = objectSubscriptionId || readStripeId(object.id)
  let status = readSubscriptionStatus(type, object)
  let priceId = readSubscriptionPriceId(object)
  let currentPeriodEnd = readUnixTimestamp(object.current_period_end)

  const shouldRetrieveSubscription =
    Boolean(stripe && subscriptionId) &&
    (type === 'checkout.session.completed' || type === 'invoice.payment_failed') &&
    Boolean(objectSubscriptionId) &&
    !String(subscriptionId).startsWith('sub_test_local_')

  if (shouldRetrieveSubscription && stripe) {
    const subscription = await stripe.subscriptions.retrieve(subscriptionId)
    const subscriptionRecord = subscription as unknown as Record<string, unknown>
    const subscriptionMetadata = readMetadata(subscriptionRecord)
    userCandidate = subscriptionMetadata.user_id || userCandidate
    customerId = readStripeId(subscription.customer) || customerId
    subscriptionId = subscription.id || subscriptionId
    status = type === 'invoice.payment_failed' ? 'past_due' : subscription.status
    priceId = readSubscriptionPriceId(subscriptionRecord) || priceId
    currentPeriodEnd = readUnixTimestamp(subscriptionRecord.current_period_end) ?? currentPeriodEnd
  }

  const plan = planFromMetadataOrPrice(metadata.plan, priceId)
  return {
    userCandidate,
    email,
    customerId,
    subscriptionId,
    status,
    plan,
    currentPeriodEnd,
  }
}

function readSubscriptionStatus(type: string, object: Record<string, unknown>) {
  if (type === 'invoice.payment_failed') return 'past_due'
  const paymentStatus = String(object.payment_status ?? '')
  const objectStatus = String(object.status ?? '')
  if (paymentStatus === 'paid' || objectStatus === 'complete') return 'active'
  return objectStatus || 'active'
}

function readMetadata(object: Record<string, unknown>) {
  return (object.metadata ?? {}) as Record<string, string>
}

function readCheckoutEmail(object: Record<string, unknown>) {
  const customerDetails = object.customer_details as Record<string, unknown> | undefined
  return String(customerDetails?.email ?? object.customer_email ?? '')
}

function readStripeId(value: unknown) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return String((value as { id?: string }).id ?? '')
}

function readUnixTimestamp(value: unknown) {
  const timestamp = Number(value ?? 0)
  return Number.isFinite(timestamp) && timestamp > 0 ? timestamp : null
}

function readSubscriptionPriceId(object: Record<string, unknown>) {
  const items = object.items as Stripe.ApiList<Stripe.SubscriptionItem> | undefined
  return items?.data?.[0]?.price?.id ?? ''
}

async function persistRefundEvent(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  object: Record<string, unknown>
) {
  const paymentIntentId = readStripeId(object.payment_intent)
  const refundAmountCents = Number(object.amount_refunded ?? object.amount ?? 0)
  if (!paymentIntentId || refundAmountCents <= 0) return

  const { data: order } = await supabaseAdmin
    .from('product_orders')
    .select('id, refunded_amount_cents, user_id, customer_email')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .maybeSingle()

  if (order?.id) {
    await supabaseAdmin
      .from('product_orders')
      .update({
        refunded_amount_cents: refundAmountCents,
        adjusted_amount_cents: refundAmountCents,
        reward_credit_status: 'refunded',
        status: 'refunded',
      })
      .eq('id', order.id)
  }

  await restoreBackendStoreCreditFromRefund({
    stripePaymentIntentId: paymentIntentId,
    refundAmountCents,
  })

  if (order?.user_id) {
    await syncBackendRewardBalance({
      userCandidate: String(order.user_id),
      email: String(order.customer_email ?? ''),
    })
  }
}

function planFromMetadataOrPrice(metadataPlan: string | undefined, priceId: string) {
  if (metadataPlan === 'yearly' || priceId === stripeConfig.yearlyPriceId) return 'professional_yearly'
  if (metadataPlan === 'monthly' || priceId === stripeConfig.monthlyPriceId) return 'professional_monthly'
  return 'free'
}
