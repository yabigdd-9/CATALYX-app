'use client'

import Link from 'next/link'
import { useEffect, useRef, useState } from 'react'
import { Panel, StatusPill } from '@/components/catalyx-ui'

const VERIFICATION_TIMEOUT_MS = 15_000
const REQUEST_TIMEOUT_MS = 5_000
const RETRY_DELAY_MS = 1_250

type ProductCheckoutState = 'verifying' | 'confirmed' | 'pending' | 'verification_error'
type ProductCheckoutVerification = {
  sessionId: string
  state: ProductCheckoutState
  message: string
}

type CheckoutStatusResponse = {
  ok?: boolean
  complete?: boolean
  paid?: boolean
  mode?: string
  checkoutType?: string | null
  error?: string
}

export default function ProductCheckoutStatusBanner({
  checkoutStatus,
  sessionId,
  mockCheckout = false,
  clearCart,
}: {
  checkoutStatus: string | null
  sessionId: string | null
  mockCheckout?: boolean
  clearCart: () => void
}) {
  const [attempt, setAttempt] = useState(0)
  const [verification, setVerification] = useState<ProductCheckoutVerification | null>(null)
  const clearedSessionIdsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    if (checkoutStatus !== 'success' || !sessionId) return

    const checkoutSessionId = sessionId
    let active = true

    async function verifyOrder() {
      setVerification({
        sessionId: checkoutSessionId,
        state: 'verifying',
        message: 'Confirming payment with Stripe and recording the order for fulfilment.',
      })

      const deadline = Date.now() + VERIFICATION_TIMEOUT_MS
      let sawPendingProductOrder = false
      let lastErrorMessage: string | null = null

      while (active && Date.now() < deadline) {
        const controller = new AbortController()
        const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

        try {
          const response = await fetch(`/api/stripe/checkout-status?session_id=${encodeURIComponent(checkoutSessionId)}`, {
            signal: controller.signal,
          })
          const payload = (await response.json()) as CheckoutStatusResponse
          if (!active) return

          if (response.ok && payload.ok && payload.mode === 'payment' && payload.checkoutType === 'product_order' && payload.complete && payload.paid) {
            if (!clearedSessionIdsRef.current.has(checkoutSessionId)) {
              clearCart()
              clearedSessionIdsRef.current.add(checkoutSessionId)
            }
            setVerification({
              sessionId: checkoutSessionId,
              state: 'confirmed',
              message: 'Payment is confirmed and the order has been recorded for fulfilment.',
            })
            return
          }

          if (response.ok && payload.ok && payload.mode === 'payment' && payload.checkoutType === 'product_order') {
            sawPendingProductOrder = true
          } else {
            setVerification({
              sessionId: checkoutSessionId,
              state: 'verification_error',
              message: payload.error ?? 'The returned Stripe session is not a Catalyx product order.',
            })
            return
          }
        } catch (error) {
          if (!active) return
          lastErrorMessage =
            error instanceof DOMException && error.name === 'AbortError'
              ? 'Stripe verification is taking too long on this connection. Retry verification or keep the session ID for support.'
              : 'The app could not verify this Stripe order. Check the Stripe webhook and server logs before fulfilment.'
        } finally {
          window.clearTimeout(timeoutId)
        }

        if (!active) return
        if (Date.now() >= deadline) break
        await wait(RETRY_DELAY_MS)
      }

      if (!active) return

      if (sawPendingProductOrder) {
        setVerification({
          sessionId: checkoutSessionId,
          state: 'pending',
          message: 'Stripe received the checkout, but payment is still pending. Keep this session ID for support.',
        })
        return
      }

      setVerification({
        sessionId: checkoutSessionId,
        state: 'verification_error',
        message: lastErrorMessage ?? 'The app could not verify this Stripe order. Check the Stripe webhook and server logs before fulfilment.',
      })
    }

    verifyOrder()
    return () => {
      active = false
    }
  }, [attempt, checkoutStatus, clearCart, sessionId])

  const verificationState =
    checkoutStatus !== 'success'
      ? null
      : !sessionId
        ? {
            state: 'verification_error' as const,
            message: 'Stripe returned without a Checkout Session ID. The order cannot be confirmed from this page.',
          }
        : verification?.sessionId === sessionId
          ? verification
          : {
              state: 'verifying' as const,
              message: 'Confirming payment with Stripe and recording the order for fulfilment.',
            }

  const banner = resolveBanner({
    checkoutStatus,
    mockCheckout,
    sessionId,
    verificationState: verificationState?.state ?? 'verifying',
    verificationMessage: verificationState?.message ?? 'Confirming payment with Stripe and recording the order for fulfilment.',
  })
  if (!banner) return null

  const isVerificationState = checkoutStatus === 'success'
  const showRetry = isVerificationState && (verificationState?.state === 'pending' || verificationState?.state === 'verification_error')
  const role = banner.tone === 'red' ? 'alert' : 'status'

  return (
    <Panel className={`mt-6 p-5 ${banner.borderClass}`} role={role} aria-live={banner.tone === 'red' ? 'assertive' : 'polite'}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <StatusPill tone={banner.tone}>{banner.label}</StatusPill>
          <h2 className="mt-3 text-xl font-black text-white sm:text-2xl">{banner.title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-300">{banner.body}</p>
          {banner.help ? <p className="mt-3 text-xs leading-5 text-zinc-500">{banner.help}</p> : null}
          {banner.showSessionId ? (
            <div className="mt-3 rounded-md border border-white/10 bg-black/30 p-3">
              <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-zinc-500">Stripe session</p>
              <p className="mt-2 break-all text-xs leading-5 text-zinc-300">{sessionId}</p>
            </div>
          ) : null}
        </div>
        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[14rem]">
          {showRetry ? (
            <button
              onClick={() => setAttempt((current) => current + 1)}
              className="w-full rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
            >
              Retry verification
            </button>
          ) : (
            <Link href={banner.primaryHref} className="w-full rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black">
              {banner.primaryLabel}
            </Link>
          )}
          <Link
            href={banner.secondaryHref}
            className="w-full rounded-md border border-white/15 px-4 py-3 text-center text-xs font-black uppercase tracking-[0.12em] text-white"
          >
            {banner.secondaryLabel}
          </Link>
        </div>
      </div>
    </Panel>
  )
}

function resolveBanner({
  checkoutStatus,
  mockCheckout,
  sessionId,
  verificationState,
  verificationMessage,
}: {
  checkoutStatus: string | null
  mockCheckout: boolean
  sessionId: string | null
  verificationState: ProductCheckoutState
  verificationMessage: string
}) {
  if (mockCheckout) {
    return {
      tone: 'violet' as const,
      label: 'Mock checkout',
      title: 'This was a local checkout preview.',
      body: 'Stripe is not configured in this environment, so the cart returned from mock mode and no payment was taken.',
      help: 'You can keep adjusting the cart here, or finish Stripe setup before testing the live mobile return flow.',
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '/products',
      secondaryLabel: 'Continue shopping',
      showSessionId: false,
      borderClass: 'border-[#9a5cff]/35',
    }
  }

  if (checkoutStatus === 'cancelled') {
    return {
      tone: 'amber' as const,
      label: 'Checkout cancelled',
      title: 'Your cart is still ready.',
      body: 'Stripe Checkout was closed before payment completed. Review the order summary below and reopen checkout when you are ready.',
      help: null,
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '/products',
      secondaryLabel: 'Continue shopping',
      showSessionId: false,
      borderClass: 'border-[#ffd23f]/35',
    }
  }

  if (checkoutStatus === 'configuration-error') {
    return {
      tone: 'red' as const,
      label: 'Stripe setup needed',
      title: 'Product checkout could not start.',
      body: 'The cart returned before Stripe Checkout opened because product checkout is not fully configured yet.',
      help: 'Complete the Stripe product checkout setup, then retry from this cart.',
      primaryHref: '/stripe-setup',
      primaryLabel: 'Open Stripe setup',
      secondaryHref: '#cart-summary',
      secondaryLabel: 'Review cart',
      showSessionId: false,
      borderClass: 'border-[#ff3b45]/35',
    }
  }

  if (checkoutStatus === 'invalid') {
    return {
      tone: 'red' as const,
      label: 'Cart needs review',
      title: 'One or more items can no longer be checked out.',
      body: 'Remove unavailable products or fix quantities before you try Stripe Checkout again.',
      help: null,
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '/products',
      secondaryLabel: 'Continue shopping',
      showSessionId: false,
      borderClass: 'border-[#ff3b45]/35',
    }
  }

  if (checkoutStatus === 'empty') {
    return {
      tone: 'amber' as const,
      label: 'Cart empty',
      title: 'Add a product before checkout.',
      body: 'Stripe Checkout cannot open until there is at least one current Catalyx product in the cart.',
      help: null,
      primaryHref: '/products',
      primaryLabel: 'Browse products',
      secondaryHref: '#cart-summary',
      secondaryLabel: 'Review cart',
      showSessionId: false,
      borderClass: 'border-[#ffd23f]/35',
    }
  }

  if (checkoutStatus === 'unavailable') {
    return {
      tone: 'red' as const,
      label: 'Checkout unavailable',
      title: 'Stripe did not return a checkout link.',
      body: 'The cart stayed local and no payment was started. Review the order below, then retry after Stripe is available again.',
      help: null,
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '/products',
      secondaryLabel: 'Continue shopping',
      showSessionId: false,
      borderClass: 'border-[#ff3b45]/35',
    }
  }

  if (checkoutStatus !== 'success') return null

  if (verificationState === 'confirmed') {
    return {
      tone: 'lime' as const,
      label: 'Order confirmed',
      title: 'Your Catalyx order is confirmed.',
      body: verificationMessage,
      help: 'Keep the Stripe session ID below until fulfilment confirmation lands in your inbox.',
      primaryHref: '/products',
      primaryLabel: 'Continue shopping',
      secondaryHref: '/dashboard',
      secondaryLabel: 'Open dashboard',
      showSessionId: Boolean(sessionId),
      borderClass: 'border-[#c8f500]/35',
    }
  }

  if (verificationState === 'pending') {
    return {
      tone: 'amber' as const,
      label: 'Payment pending',
      title: 'Stripe checkout returned, but payment is still processing.',
      body: verificationMessage,
      help: 'Retry verification in a moment, or keep the session ID for support if the payment does not settle.',
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '#cart-summary',
      secondaryLabel: 'View order summary',
      showSessionId: Boolean(sessionId),
      borderClass: 'border-[#ffd23f]/35',
    }
  }

  if (verificationState === 'verification_error') {
    return {
      tone: 'red' as const,
      label: 'Verification needed',
      title: 'We could not verify this order yet.',
      body: verificationMessage,
      help: 'Retry verification after the connection recovers, then check Stripe webhook persistence before fulfilment.',
      primaryHref: '#cart-summary',
      primaryLabel: 'Review cart',
      secondaryHref: '#cart-summary',
      secondaryLabel: 'View order summary',
      showSessionId: Boolean(sessionId),
      borderClass: 'border-[#ff3b45]/35',
    }
  }

  return {
    tone: 'blue' as const,
    label: 'Verifying order',
    title: 'Verifying your Stripe order.',
    body: verificationMessage,
    help: 'This usually completes within a moment after Stripe returns to the cart.',
    primaryHref: '#cart-summary',
    primaryLabel: 'View order summary',
    secondaryHref: '/products',
    secondaryLabel: 'Continue shopping',
    showSessionId: Boolean(sessionId),
    borderClass: 'border-[#33d9ff]/35',
  }
}

function wait(durationMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs))
}
