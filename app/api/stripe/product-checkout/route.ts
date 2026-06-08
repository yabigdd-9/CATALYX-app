import { NextResponse } from 'next/server'
import { reserveBackendStoreCreditForCheckout } from '@/lib/rewards-backend'
import { createProductCheckout, hasStripeCheckout } from '@/lib/stripe'
import { products as storeProducts } from '@/lib/products'
import type { CartItem } from '@/types'

export async function POST(request: Request) {
  let body: { items?: CartItem[]; email?: string; userId?: string; storeCreditCents?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid checkout request.' }, { status: 400 })
  }

  const items = body.items ?? []
  if (!items.length) {
    return NextResponse.json({ ok: false, error: 'Cart is empty.' }, { status: 400 })
  }

  const currentProductIds = new Set(storeProducts.filter((product) => product.inStock).map((product) => product.id))
  const validItems = items.filter(
    (item) => currentProductIds.has(item.productId) && Number.isInteger(item.quantity) && item.quantity >= 1 && item.quantity <= 12
  )
  if (validItems.length !== items.length) {
    return NextResponse.json(
      { ok: false, error: 'Cart contains an unavailable product or invalid quantity. Review the cart before checkout.' },
      { status: 400 }
    )
  }

  try {
    const subtotalCents = validItems.reduce((total, item) => {
      const product = storeProducts.find((entry) => entry.id === item.productId)
      return total + Math.round((product?.price ?? 0) * 100) * item.quantity
    }, 0)

    const requestedCreditCents = Math.max(0, Math.round(Number(body.storeCreditCents ?? 0)))
    const creditReservation =
      requestedCreditCents > 0 && hasStripeCheckout
        ? await reserveBackendStoreCreditForCheckout({
            userCandidate: body.userId,
            email: body.email,
            requestedCreditCents,
            subtotalCents,
          })
        : {
            appliedCreditCents: 0,
            rewardRedemptionId: '',
            appUserId: body.userId ?? '',
          }

    const url = await createProductCheckout({
      items: validItems,
      email: body.email,
      userId: creditReservation.appUserId || body.userId,
      storeCreditCents: creditReservation.appliedCreditCents,
      allowPromotionCodes: creditReservation.appliedCreditCents > 0 ? false : true,
      rewardRedemptionId: creditReservation.rewardRedemptionId,
      rewardWalletUserId: creditReservation.appUserId || body.userId || '',
    })

    return NextResponse.json({
      ok: true,
      url,
      appliedStoreCreditCents: creditReservation.appliedCreditCents,
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Product checkout is unavailable.' },
      { status: 503 }
    )
  }
}

export const runtime = 'nodejs'
