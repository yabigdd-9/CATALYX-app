'use client'

import { useState } from 'react'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

type TestResult = {
  ok?: boolean
  handled?: boolean
  persisted?: boolean
  type?: string
  error?: string
}

export default function StripeWebhookTester() {
  const [userId, setUserId] = useState('')
  const [email, setEmail] = useState('')
  const [eventType, setEventType] = useState<'subscription' | 'product_order'>('subscription')
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')
  const [subscriptionStatus, setSubscriptionStatus] = useState('active')
  const [productIds, setProductIds] = useState('ax-pro')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [result, setResult] = useState<TestResult | null>(null)

  async function runTest() {
    setStatus('saving')
    setMessage('Sending local webhook persistence test...')
    setResult(null)

    try {
      const response = await fetch('/api/stripe/webhook-test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userId.trim(),
          email: email.trim(),
          eventType,
          plan,
          status: subscriptionStatus.trim() || 'active',
          productIds: productIds
            .split(',')
            .map((product) => product.trim())
            .filter(Boolean),
          amountTotal: 4999,
        }),
      })
      const payload = (await response.json()) as TestResult
      setResult(payload)
      if (!response.ok || !payload.ok) {
        setStatus('error')
        setMessage(payload.error ?? 'Webhook test failed.')
        return
      }
      setStatus(payload.persisted ? 'saved' : 'error')
      setMessage(payload.persisted ? 'Webhook test persisted to Supabase.' : 'Webhook handled but did not persist. Check SUPABASE_SERVICE_ROLE_KEY and user matching.')
    } catch {
      setStatus('error')
      setMessage('Could not call the local webhook test endpoint.')
    }
  }

  return (
    <Panel className="mt-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <StatusPill tone="amber">Development only</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">Webhook persistence test</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Set `STRIPE_WEBHOOK_TEST_ENABLED=true`, then run local subscription or product-order events through the same persistence path as the real Stripe webhook.
          </p>
        </div>
        <StatusPill tone="violet">Pro unlock path</StatusPill>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2">
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Webhook test type</span>
          <select
            value={eventType}
            onChange={(event) => setEventType(event.target.value === 'product_order' ? 'product_order' : 'subscription')}
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
          >
            <option value="subscription">Subscription unlock</option>
            <option value="product_order">Product order</option>
          </select>
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">User ID or auth user ID</span>
          <input
            value={userId}
            onChange={(event) => setUserId(event.target.value)}
            placeholder="Supabase users.id or auth_user_id"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
          />
        </label>
        <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Customer email</span>
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="customer@example.com"
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
          />
        </label>
        {eventType === 'subscription' ? (
          <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Plan</span>
          <select
            value={plan}
            onChange={(event) => setPlan(event.target.value === 'yearly' ? 'yearly' : 'monthly')}
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
          </label>
        ) : (
          <label className="grid gap-2">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Product IDs</span>
            <input
              value={productIds}
              onChange={(event) => setProductIds(event.target.value)}
              placeholder="ax-pro,bx-pro"
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
            />
          </label>
        )}
        {eventType === 'subscription' ? (
          <label className="grid gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Subscription status</span>
          <select
            value={subscriptionStatus}
            onChange={(event) => setSubscriptionStatus(event.target.value)}
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none focus:border-[#c8f500]"
          >
            <option value="active">Active</option>
            <option value="trialing">Trialing</option>
            <option value="past_due">Past due</option>
            <option value="canceled">Canceled</option>
          </select>
          </label>
        ) : null}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={runTest}
          className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
        >
          Run webhook test
        </button>
        <p className="text-sm text-zinc-500">This endpoint returns 404 in production and 403 unless the local flag is enabled.</p>
      </div>

      <div className="mt-4">
        <SaveBanner status={status} message={message} />
      </div>

      {result ? (
        <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Endpoint response</p>
          <pre className="mt-3 overflow-x-auto text-xs leading-6 text-zinc-300">{JSON.stringify(result, null, 2)}</pre>
        </div>
      ) : null}
    </Panel>
  )
}
