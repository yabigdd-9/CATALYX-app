import { NextResponse } from 'next/server'
import { requirePortalUser } from '@/lib/portal-server'

type ProductOrderLine = {
  product_id: string
  quantity: number
}

function normalizeOrderLines(value: unknown): ProductOrderLine[] {
  if (!Array.isArray(value)) return []

  return value
    .map((line) => {
      const record = typeof line === 'object' && line ? line as Record<string, unknown> : null
      const productId = record?.product_id ? String(record.product_id) : ''
      const quantity = Number(record?.quantity ?? 1)
      return productId ? { product_id: productId, quantity: Number.isFinite(quantity) ? quantity : 1 } : null
    })
    .filter((line): line is ProductOrderLine => Boolean(line))
}

export async function GET(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  if (guard.appUser.email) {
    await guard.admin
      .from('product_orders')
      .update({ user_id: guard.appUser.id })
      .is('user_id', null)
      .eq('customer_email', guard.appUser.email)
  }

  const { data, error } = await guard.admin
    .from('product_orders')
    .select('id, stripe_checkout_session_id, stripe_payment_intent_id, customer_email, order_lines, amount_total, subtotal_cents, store_credit_applied_cents, refunded_amount_cents, currency, status, created_at')
    .eq('user_id', guard.appUser.id)
    .order('created_at', { ascending: false })
    .limit(24)

  if (error) return NextResponse.json({ ok: false, error: error.message, orders: [] }, { status: 500 })

  const orders = (data ?? []).map((row) => ({
    ...row,
    order_lines: normalizeOrderLines(row.order_lines),
    amount_total: typeof row.amount_total === 'number' ? row.amount_total : Number(row.amount_total ?? 0),
    subtotal_cents: Number(row.subtotal_cents ?? 0),
    store_credit_applied_cents: Number(row.store_credit_applied_cents ?? 0),
    refunded_amount_cents: Number(row.refunded_amount_cents ?? 0),
  }))

  return NextResponse.json({ ok: true, orders })
}

export const runtime = 'nodejs'
