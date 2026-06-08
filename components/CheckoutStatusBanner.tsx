'use client'

import Link from 'next/link'
import { useMemo } from 'react'
import { Panel, StatusPill } from '@/components/catalyx-ui'

type CheckoutStatusBannerProps = {
  className?: string
}

const checkoutMessages = {
  cancelled: {
    tone: 'amber',
    label: 'Checkout cancelled',
    title: 'No subscription change was made.',
    body: 'Stripe Checkout was closed before payment completed. You can choose a plan again whenever you are ready.',
  },
  'configuration-error': {
    tone: 'red',
    label: 'Stripe setup needed',
    title: 'Checkout could not start.',
    body: 'Stripe keys, price IDs, or webhook settings still need to be completed before live subscription checkout can run.',
  },
  signin: {
    tone: 'blue',
    label: 'Sign in required',
    title: 'Create or sign in to your Catalyx account first.',
    body: 'Production checkout links the subscription to your Catalyx user record so Pro access can unlock after the webhook runs.',
  },
  mock: {
    tone: 'violet',
    label: 'Mock checkout',
    title: 'Stripe is not configured, so the app used a local checkout preview.',
    body: 'This is expected during setup. Add Stripe keys and price IDs to test real Checkout.',
  },
} as const

export default function CheckoutStatusBanner({ className = '' }: CheckoutStatusBannerProps) {
  const state = useMemo(() => {
    if (typeof window === 'undefined') return null
    const params = new URLSearchParams(window.location.search)
    if (params.get('billing') === 'signin-required') return checkoutMessages.signin
    if (params.get('mockCheckout')) return checkoutMessages.mock
    const checkout = params.get('checkout')
    if (checkout === 'cancelled') return checkoutMessages.cancelled
    if (checkout === 'configuration-error') return checkoutMessages['configuration-error']
    return null
  }, [])

  if (!state) return null

  return (
    <Panel className={`border-white/15 p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <StatusPill tone={state.tone}>{state.label}</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">{state.title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{state.body}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/stripe-setup" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            Stripe setup
          </Link>
          <Link href="/pricing" className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
            View plans
          </Link>
        </div>
      </div>
    </Panel>
  )
}
