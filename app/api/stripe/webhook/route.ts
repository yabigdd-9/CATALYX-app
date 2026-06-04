import { NextResponse } from 'next/server'
import { stripe, stripeConfig } from '@/lib/stripe'
import { persistStripeWebhookEvent, type StripeWebhookEvent } from '@/lib/stripe-webhook'

export async function POST(request: Request) {
  const rawBody = await request.text()
  const signature = request.headers.get('stripe-signature')
  let event: StripeWebhookEvent

  try {
    if (!stripe || !stripeConfig.webhookSecret || !signature) {
      return NextResponse.json(
        { received: false, error: 'Stripe webhook signature verification is not configured.' },
        { status: 400 }
      )
    }

    event = stripe.webhooks.constructEvent(rawBody, signature, stripeConfig.webhookSecret) as unknown as StripeWebhookEvent
  } catch (error) {
    return NextResponse.json(
      { received: false, error: error instanceof Error ? error.message : 'Invalid Stripe event payload' },
      { status: 400 }
    )
  }

  try {
    const result = await persistStripeWebhookEvent(event)
    if (result.error) {
      return NextResponse.json({ received: false, error: result.error }, { status: result.status ?? 500 })
    }

    return NextResponse.json({
      received: true,
      handled: result.handled,
      type: result.type,
      persisted: result.persisted,
    })
  } catch (error) {
    return NextResponse.json(
      { received: false, error: error instanceof Error ? error.message : 'Webhook persistence failed.' },
      { status: 500 }
    )
  }
}
