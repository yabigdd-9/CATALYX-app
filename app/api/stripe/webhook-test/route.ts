import { NextResponse } from 'next/server'
import { stripeConfig } from '@/lib/stripe'
import { persistStripeWebhookEvent, type StripeWebhookEvent } from '@/lib/stripe-webhook'

export async function POST(request: Request) {
  const localSite = stripeConfig.siteUrl.includes('localhost') || stripeConfig.siteUrl.includes('127.0.0.1')
  const enabled = process.env.STRIPE_WEBHOOK_TEST_ENABLED === 'true' && stripeConfig.mode === 'test' && localSite
  if (!enabled) {
    return NextResponse.json(
      { ok: false, error: 'Local webhook tests require STRIPE_WEBHOOK_TEST_ENABLED=true, Stripe test mode, and a localhost site URL.' },
      { status: process.env.NODE_ENV === 'production' ? 404 : 403 }
    )
  }

  let body: {
    userId?: string
    email?: string
    plan?: 'monthly' | 'yearly'
    status?: string
    eventType?: 'subscription' | 'product_order'
    productIds?: string[]
    amountTotal?: number
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON payload.' }, { status: 400 })
  }

  const now = Math.floor(Date.now() / 1000)
  const plan = body.plan === 'yearly' ? 'yearly' : 'monthly'
  const event: StripeWebhookEvent =
    body.eventType === 'product_order'
      ? {
          type: 'checkout.session.completed',
          data: {
            object: {
              id: `cs_test_local_product_${Date.now()}`,
              customer: `cus_test_local_${Date.now()}`,
              payment_status: 'paid',
              status: 'complete',
              amount_total: Math.round(Number(body.amountTotal ?? 4999)),
              currency: 'nzd',
              customer_email: body.email ?? '',
              customer_details: {
                email: body.email ?? '',
              },
              client_reference_id: body.userId ?? '',
              metadata: {
                checkout_type: 'product_order',
                user_id: body.userId ?? '',
                product_ids: (body.productIds?.length ? body.productIds : ['ax-pro']).join(','),
                order_lines: JSON.stringify((body.productIds?.length ? body.productIds : ['ax-pro']).map((productId) => ({ product_id: productId, quantity: 1 }))),
              },
            },
          },
        }
      : {
          type: 'customer.subscription.updated',
          data: {
            object: {
              id: `sub_test_local_${Date.now()}`,
              customer: `cus_test_local_${Date.now()}`,
              status: body.status ?? 'active',
              current_period_end: now + 30 * 24 * 60 * 60,
              customer_email: body.email ?? '',
              client_reference_id: body.userId ?? '',
              metadata: {
                user_id: body.userId ?? '',
                plan,
              },
            },
          },
        }

  const result = await persistStripeWebhookEvent(event)
  if (result.error) {
    return NextResponse.json({ ok: false, error: result.error }, { status: result.status ?? 500 })
  }

  return NextResponse.json({ ok: true, ...result })
}

export const runtime = 'nodejs'
