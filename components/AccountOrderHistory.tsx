'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { EmptyState, Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { loadPortalOrders, type ProductOrderRow } from '@/lib/portal'
import { getProductById } from '@/lib/products'

function formatCurrency(amount: number | null, currency: string | null) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'Amount unavailable'

  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: (currency ?? 'NZD').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

function formatDate(value: string) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-NZ', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(parsed)
}

function statusTone(status: string | null) {
  if (status === 'paid') return 'lime' as const
  if (status === 'pending' || status === 'open') return 'amber' as const
  if (status === 'failed' || status === 'cancelled') return 'red' as const
  return 'blue' as const
}

export default function AccountOrderHistory() {
  const [orders, setOrders] = useState<ProductOrderRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copiedRef, setCopiedRef] = useState('')

  useEffect(() => {
    let active = true

    async function loadOrders() {
      try {
        const nextOrders = await loadPortalOrders()
        if (!active) return
        setOrders(nextOrders)
        setError(null)
      } catch (nextError) {
        if (!active) return
        setError(nextError instanceof Error ? nextError.message : 'Could not load order history.')
      } finally {
        if (active) setLoading(false)
      }
    }

    loadOrders()
    return () => {
      active = false
    }
  }, [])

  async function copyReference(reference: string) {
    try {
      await navigator.clipboard.writeText(reference)
      setCopiedRef(reference)
      window.setTimeout(() => setCopiedRef(''), 1600)
    } catch {
      setCopiedRef('')
    }
  }

  const orderCountLabel = useMemo(() => `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`, [orders.length])

  return (
    <Panel className="p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Orders and receipts</p>
          <h2 className="mt-2 text-2xl font-black text-white">Recent product orders</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Signed-in product orders now live here with line items, totals, and receipt references you can use with support.
          </p>
        </div>
        <StatusPill tone="blue">{loading ? 'Loading' : orderCountLabel}</StatusPill>
      </div>

      {error ? (
        <div className="mt-5">
          <SaveBanner status="error" message={error} />
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 grid gap-3">
          {[0, 1].map((item) => (
            <div key={item} className="animate-pulse rounded-md border border-white/10 bg-black/30 p-5">
              <div className="h-4 w-28 rounded bg-white/10" />
              <div className="mt-3 h-8 w-48 rounded bg-white/10" />
              <div className="mt-4 h-3 w-72 rounded bg-white/10" />
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            title="No product orders yet"
            body="Once you complete a signed-in Catalyx checkout, your order history and receipt references will appear here."
            action={
              <Link
                href="/products"
                className="inline-flex rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
              >
                Shop products
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-5 grid gap-4">
          {orders.map((order) => {
            const reference = order.stripe_checkout_session_id ?? order.id
            const supportHref = `mailto:daena@catalyxlabs.co.nz?subject=${encodeURIComponent(`Receipt request ${reference}`)}&body=${encodeURIComponent(`Please send a receipt or order update for reference ${reference}.`)}`
            return (
              <div key={order.id} className="rounded-md border border-white/10 bg-black/30 p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Order placed</p>
                    <h3 className="mt-2 text-xl font-black text-white">{formatDate(order.created_at)}</h3>
                    <p className="mt-2 text-sm text-zinc-400">{order.customer_email ?? 'Email unavailable'}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <StatusPill tone={statusTone(order.status)}>{order.status ?? 'processing'}</StatusPill>
                    <StatusPill tone="blue">{formatCurrency(order.amount_total, order.currency)}</StatusPill>
                  </div>
                </div>

                <div className="mt-5 rounded-md border border-white/10 bg-black/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Receipt reference</p>
                  <p className="mt-2 break-all font-mono text-sm text-zinc-200">{reference}</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => copyReference(reference)}
                      className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      {copiedRef === reference ? 'Copied' : 'Copy reference'}
                    </button>
                    <a
                      href={supportHref}
                      className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white"
                    >
                      Request receipt
                    </a>
                  </div>
                </div>

                <div className="mt-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Included items</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {order.order_lines.length
                      ? order.order_lines.map((line) => {
                          const product = getProductById(line.product_id)
                          return (
                            <span
                              key={`${reference}:${line.product_id}`}
                              className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-200"
                            >
                              {line.quantity} x {product?.name ?? line.product_id}
                            </span>
                          )
                        })
                      : (
                        <span className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400">
                          Line items unavailable
                        </span>
                        )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </Panel>
  )
}
