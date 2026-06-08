import { NextResponse } from 'next/server'
import { getSupabaseAdmin, hasSupabaseAdmin } from '@/lib/supabase-admin'
import { persistStripeWebhookEvent, type StripeWebhookEvent } from '@/lib/stripe-webhook'
import { stripe, stripeConfig } from '@/lib/stripe'

export async function GET(request: Request) {
  const sessionId = new URL(request.url).searchParams.get('session_id') ?? ''
  if (!sessionId.startsWith('cs_')) {
    return NextResponse.json({ ok: false, error: 'Missing Stripe checkout session.' }, { status: 400 })
  }

  if (!stripe) {
    return NextResponse.json({ ok: false, error: 'Stripe is not configured.' }, { status: 503 })
  }

  try {
    const session = await stripe.checkout.sessions.retrieve(sessionId)
    const complete = session.status === 'complete'
    const paid = session.payment_status === 'paid' || session.payment_status === 'no_payment_required'
    const checkoutType = session.metadata?.checkout_type ?? null
    const expectedOrderLineCount = readOrderLineCount(session.metadata?.order_lines)
    const diagnostics = {
      webhookConfigured: Boolean(stripeConfig.webhookSecret),
      serviceRoleConfigured: hasSupabaseAdmin,
      productOrderExpected: checkoutType === 'product_order',
      expectedOrderLineCount,
    }

    if (complete && paid) {
      const event: StripeWebhookEvent = {
        type: 'checkout.session.completed',
        data: { object: session as unknown as Record<string, unknown> },
      }
      const result = await persistStripeWebhookEvent(event)
      if (result.error || !result.persisted) {
        return NextResponse.json(
          {
            ok: false,
            error:
              result.error ??
              (checkoutType === 'product_order'
                ? 'Stripe confirmed the payment, but product-order persistence is not ready because the webhook cannot write to Supabase.'
                : 'Stripe confirmed the payment, but webhook persistence is not ready because the server cannot write to Supabase.'),
            persisted: false,
            ...diagnostics,
          },
          { status: result.status ?? 503 }
        )
      }

      const productOrder = await readProductOrderSummary(sessionId, checkoutType)
      if (checkoutType === 'product_order' && !productOrder) {
        return NextResponse.json(
          {
            ok: false,
            error:
              'Stripe confirmed the payment, but the product order row could not be read back from Supabase after webhook processing.',
            persisted: false,
            ...diagnostics,
          },
          { status: 503 }
        )
      }

      return NextResponse.json({
        ok: true,
        complete,
        paid,
        mode: session.mode,
        checkoutType,
        plan: session.metadata?.plan ?? null,
        customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
        persisted: true,
        ...diagnostics,
        ...(productOrder ? { productOrder } : {}),
      })
    }

    return NextResponse.json({
      ok: true,
      complete,
      paid,
      mode: session.mode,
      checkoutType,
      plan: session.metadata?.plan ?? null,
      customerId: typeof session.customer === 'string' ? session.customer : session.customer?.id ?? null,
      persisted: false,
      ...diagnostics,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Could not verify checkout session.' },
      { status: 500 }
    )
  }
}

export const runtime = 'nodejs'

function readOrderLineCount(value?: string) {
  if (!value) return 0
  try {
    const parsed = JSON.parse(value)
    return Array.isArray(parsed) ? parsed.length : 0
  } catch {
    return 0
  }
}

async function readProductOrderSummary(sessionId: string, checkoutType: string | null) {
  if (checkoutType !== 'product_order' || !hasSupabaseAdmin) return null

  const admin = getSupabaseAdmin()
  if (!admin) return null

  const { data, error } = await admin
    .from('product_orders')
    .select('id, status, order_lines, amount_total, currency')
    .eq('stripe_checkout_session_id', sessionId)
    .maybeSingle()

  if (error || !data) return null

  return {
    id: String(data.id ?? ''),
    status: data.status ? String(data.status) : null,
    orderLineCount: Array.isArray(data.order_lines) ? data.order_lines.length : 0,
    amountTotal: typeof data.amount_total === 'number' ? data.amount_total : Number(data.amount_total ?? 0),
    currency: data.currency ? String(data.currency) : null,
  }
}
