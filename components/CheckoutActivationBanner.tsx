'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

type CheckoutState = 'verifying' | 'active' | 'pending' | 'error'

type CheckoutStatusResponse = {
  ok?: boolean
  complete?: boolean
  paid?: boolean
  plan?: string | null
  error?: string
}

function initialState(checkoutSuccess: boolean, sessionId: string | null): CheckoutState {
  if (!checkoutSuccess || !sessionId) return 'pending'
  return 'verifying'
}

function initialMessage(sessionId: string | null) {
  if (!sessionId) return 'Checkout returned successfully. Waiting for Stripe webhook confirmation.'
  return 'Confirming Stripe checkout and refreshing your Catalyx plan.'
}

export default function CheckoutActivationBanner({
  checkoutSuccess,
  sessionId,
}: {
  checkoutSuccess: boolean
  sessionId: string | null
}) {
  const { refreshUser } = useAuth()
  const [state, setState] = useState<CheckoutState>(() => initialState(checkoutSuccess, sessionId))
  const [message, setMessage] = useState(() => initialMessage(sessionId))

  useEffect(() => {
    if (!checkoutSuccess) return
    if (!sessionId) {
      refreshUser().catch(() => undefined)
      return
    }

    const checkoutSessionId = sessionId
    let active = true
    async function verifyCheckout() {
      try {
        const response = await fetch(`/api/stripe/checkout-status?session_id=${encodeURIComponent(checkoutSessionId)}`)
        const payload = (await response.json()) as CheckoutStatusResponse
        if (!active) return

        if (!response.ok || !payload.ok) {
          setState('error')
          setMessage(payload.error ?? 'Checkout returned, but the app could not verify Stripe status.')
          return
        }

        if (payload.complete && payload.paid) {
          await refreshUser().catch(() => undefined)
          setState('active')
          setMessage('Professional access is active. Your Pro tools are ready for this account.')
          return
        }

        setState('pending')
        setMessage('Checkout was received. Pro access will unlock when Stripe confirms payment and the webhook finishes.')
      } catch {
        if (!active) return
        setState('error')
        setMessage('Checkout returned, but the app could not verify Stripe status. Check Stripe setup or webhook logs.')
      }
    }

    verifyCheckout()
    return () => {
      active = false
    }
  }, [checkoutSuccess, refreshUser, sessionId])

  if (!checkoutSuccess) return null

  const tone = state === 'active' ? 'lime' : state === 'error' ? 'red' : state === 'verifying' ? 'blue' : 'amber'
  const label = state === 'active' ? 'Professional active' : state === 'error' ? 'Verification needed' : state === 'verifying' ? 'Verifying checkout' : 'Webhook pending'
  const title = state === 'active' ? 'Your optimisation layer is active.' : 'Stripe checkout is being verified.'

  return (
    <Panel className="mt-6 border-[#c8f500]/40 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <StatusPill tone={tone}>{label}</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">{title}</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">{message}</p>
          {sessionId ? <p className="mt-2 break-all text-xs text-zinc-500">Stripe session: {sessionId}</p> : null}
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href="/pro" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
            Open Pro tools
          </Link>
          <Link href="/account" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
            Account
          </Link>
        </div>
      </div>
    </Panel>
  )
}
