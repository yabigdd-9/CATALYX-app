import { NextResponse } from 'next/server'
import { stripe, stripeConfig } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  let event: { type: string; data: { object: Record<string, unknown> } }

  try {
    if (stripe && stripeConfig.webhookSecret && signature) {
      event = stripe.webhooks.constructEvent(rawBody, signature, stripeConfig.webhookSecret) as unknown as typeof event
    } else {
      event = JSON.parse(rawBody)
    }
  } catch (error) {
    return NextResponse.json(
      { received: false, error: error instanceof Error ? error.message : 'Invalid Stripe event payload' },
      { status: 400 }
    )
  }

  const object = event.data.object
  const handled = [
    'checkout.session.completed',
    'customer.subscription.created',
    'customer.subscription.updated',
    'customer.subscription.deleted',
    'invoice.payment_failed',
  ].includes(event.type)

  if (handled && supabaseAdmin) {
    await persistSubscriptionEvent(event.type, object)
  }

  return NextResponse.json({
    received: true,
    handled,
    type: event.type,
    persisted: Boolean(handled && supabaseAdmin),
  })
}

async function persistSubscriptionEvent(type: string, object: Record<string, unknown>) {
  if (!supabaseAdmin) return

  const metadata = (object.metadata ?? {}) as Record<string, string>
  const userId = metadata.user_id || String(object.client_reference_id ?? '')
  const customerId = String(object.customer ?? '')
  const subscriptionId = String(object.subscription ?? object.id ?? '')
  const status = String(object.status ?? (type === 'invoice.payment_failed' ? 'past_due' : 'active'))
  const plan = metadata.plan === 'yearly' ? 'professional_yearly' : metadata.plan === 'monthly' ? 'professional_monthly' : 'free'

  if (!userId && !customerId) return

  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId || null,
      stripe_customer_id: customerId || null,
      stripe_subscription_id: subscriptionId || null,
      plan,
      status,
      current_period_end: object.current_period_end
        ? new Date(Number(object.current_period_end) * 1000).toISOString()
        : null,
    },
    { onConflict: 'stripe_subscription_id' }
  )

  if (userId) {
    await supabaseAdmin.from('user_plan').upsert({
      user_id: userId,
      plan: status === 'active' || status === 'trialing' ? 'professional' : 'free',
      feature_access: {
        intelligence: status === 'active' || status === 'trialing',
        weekly_reviews: status === 'active' || status === 'trialing',
        predictive_warnings: status === 'active' || status === 'trialing',
      },
      updated_at: new Date().toISOString(),
    })
  }
}

