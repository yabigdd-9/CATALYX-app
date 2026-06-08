'use client'

import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { EmptyState, PageHeader, Panel, SaveBanner, ShellSection, StatusPill } from '@/components/catalyx-ui'
import ProductCheckoutStatusBanner from '@/components/ProductCheckoutStatusBanner'
import { getProductById, products as storeProducts } from '@/lib/products'
import { useCart } from '@/lib/store'
import { loadCurrentUserRewardWallet, type RewardWalletRow } from '@/lib/supabase-services'
import type { CartItem, Product } from '@/types'

export default function CartPage() {
  return (
    <Suspense fallback={<CartPageFallback />}>
      <CartPageContent />
    </Suspense>
  )
}

function CartPageContent() {
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { items, removeFromCart, updateQuantity, clearCart } = useCart()
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Stripe Checkout opens when product checkout is configured.')
  const [rewardWallet, setRewardWallet] = useState<RewardWalletRow | null>(null)
  const [applyStoreCredit, setApplyStoreCredit] = useState(false)
  const [cartHydrated, setCartHydrated] = useState(() => {
    const cartPersist = useCart.persist
    return cartPersist ? cartPersist.hasHydrated() : true
  })
  const validItems = useMemo(
    () =>
      items
        .map((item) => ({ item, product: getProductById(item.productId) }))
        .filter((entry): entry is { item: CartItem; product: Product } => Boolean(entry.product?.inStock)),
    [items]
  )
  const invalidItems = useMemo(() => items.filter((item) => !storeProducts.some((product) => product.id === item.productId && product.inStock)), [items])
  const subtotal = validItems.reduce((total, { item, product }) => total + product.price * item.quantity, 0)
  const subtotalCents = Math.round(subtotal * 100)
  const shipping = validItems.length ? 10 : 0
  const availableStoreCreditCents = rewardWallet ? Math.max(0, rewardWallet.storeCreditBalanceCents - rewardWallet.pendingStoreCreditCents) : 0
  const appliedStoreCreditCents = applyStoreCredit && subtotalCents >= 6000 ? Math.min(availableStoreCreditCents, subtotalCents) : 0
  const total = subtotal + shipping - appliedStoreCreditCents / 100
  const checkoutStatus = searchParams.get('checkout')
  const sessionId = searchParams.get('session_id')
  const mockCheckout = searchParams.has('mockCheckout')
  const hasCheckoutReturn = Boolean(checkoutStatus || mockCheckout)

  useEffect(() => {
    const cartPersist = useCart.persist
    if (!cartPersist) return
    const unsubscribe = cartPersist.onFinishHydration(() => setCartHydrated(true))
    return unsubscribe
  }, [])

  useEffect(() => {
    let alive = true
    loadCurrentUserRewardWallet()
      .then((wallet) => {
        if (!alive) return
        setRewardWallet(wallet)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [user?.id])

  async function checkout() {
    if (!validItems.length) {
      setStatus('error')
      setMessage('Remove unavailable items or add a current Catalyx product before checkout.')
      return
    }
    setStatus('saving')
    try {
      const response = await fetch('/api/stripe/product-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: validItems.map(({ item }) => item),
          email: user?.email,
          userId: user?.id,
          storeCreditCents: appliedStoreCreditCents,
        }),
      })
      const payload = await response.json()
      if (response.ok && payload.ok && payload.url) {
        window.location.href = payload.url
        return
      }
      setStatus('error')
      setMessage(payload.error ?? 'Product checkout is unavailable.')
    } catch {
      setStatus('error')
      setMessage('Could not start product checkout.')
    }
  }

  return (
    <ShellSection>
      <PageHeader title="Catalyx store cart" copy="Build a product order from the Catalyx nutrition system and checkout through Stripe-hosted payment." />
      <ProductCheckoutStatusBanner
        key={`${checkoutStatus ?? 'idle'}:${sessionId ?? 'none'}:${mockCheckout ? 'mock' : 'live'}`}
        checkoutStatus={checkoutStatus}
        sessionId={sessionId}
        mockCheckout={mockCheckout}
        clearCart={clearCart}
      />

      {!cartHydrated ? (
        <Panel className="mt-6 p-5">
          <StatusPill tone="blue">Loading cart</StatusPill>
          <p className="mt-3 text-sm leading-6 text-zinc-300">Restoring your saved cart before showing the latest Stripe return state.</p>
        </Panel>
      ) : items.length === 0 ? (
        <Panel className="mt-6 p-5">
          <EmptyState title="Your cart is empty" body="Add Catalyx products to build a feed system order." />
          <Link href="/products" className="mt-5 inline-flex rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
            Continue shopping
          </Link>
        </Panel>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Panel className={`overflow-hidden ${hasCheckoutReturn ? 'order-2 lg:order-1' : ''}`}>
            <div className="border-b border-white/10 p-5">
              <h2 className="text-2xl font-black text-white">Order items</h2>
            </div>
            <div className="grid gap-0">
              {invalidItems.map((item) => (
                <div key={item.productId} className="grid gap-4 border-b border-[#ff3b45]/30 bg-[#ff3b45]/[0.06] p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-white">{item.productId}</h3>
                      <StatusPill tone="red">Removed SKU</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">This product is coming soon and cannot be checked out yet. Remove it before checkout.</p>
                  </div>
                  <button onClick={() => removeFromCart(item.productId)} className="rounded-md border border-[#ff3b45]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ff8b92]">
                    Remove
                  </button>
                </div>
              ))}
              {validItems.map(({ item, product }) => (
                <div key={item.productId} className="grid gap-4 border-b border-white/10 p-5 md:grid-cols-[1fr_auto] md:items-center">
                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-xl font-black text-white">{product.name}</h3>
                      <StatusPill tone={product.inStock ? 'lime' : 'amber'}>{product.inStock ? 'In stock' : 'Coming soon'}</StatusPill>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{product.description}</p>
                    <p className="mt-2 text-sm font-bold text-[#c8f500]">NZD ${product.price.toFixed(2)} each</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                      className="w-20 rounded-md border border-white/10 bg-black px-3 py-2 text-white outline-none focus:border-[#c8f500]"
                    />
                    <button onClick={() => removeFromCart(item.productId)} className="rounded-md border border-[#ff3b45]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ff8b92]">
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </Panel>

          <Panel id="cart-summary" className={`h-fit scroll-mt-24 p-5 ${hasCheckoutReturn ? 'order-1 lg:order-2' : ''}`}>
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-black">Order summary</h2>
              <StatusPill tone="blue">Stripe Checkout</StatusPill>
            </div>
            <div className="mt-5 grid gap-3 border-b border-white/10 pb-5 text-sm">
              <SummaryRow label="Subtotal" value={`NZD $${subtotal.toFixed(2)}`} />
              <SummaryRow label="Store credit" value={appliedStoreCreditCents > 0 ? `- NZD $${(appliedStoreCreditCents / 100).toFixed(2)}` : 'Not applied'} />
              <SummaryRow label="Estimated shipping" value={`NZD $${shipping.toFixed(2)}`} />
              <SummaryRow label="Tax / GST" value="Calculated in Checkout" />
            </div>
            <div className="mt-5 flex items-center justify-between text-xl font-black text-white">
              <span>Total estimate</span>
              <span>NZD ${total.toFixed(2)}</span>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Standard shipping is charged in Stripe Checkout. Tax / GST is calculated there when Stripe Tax is enabled.</p>
            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Store credit wallet</p>
                  <p className="mt-2 text-lg font-black text-white">NZD ${(availableStoreCreditCents / 100).toFixed(2)} available</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">
                    {user?.id
                      ? subtotalCents >= 6000
                        ? 'Credit is reserved against your backend wallet at checkout start and restored automatically if payment fails or is refunded.'
                        : 'Credit unlocks once this order subtotal reaches NZD $60.00.'
                      : 'Sign in to use backend-tracked store credit at checkout.'}
                  </p>
                </div>
                <StatusPill tone={availableStoreCreditCents > 0 ? 'lime' : 'amber'}>
                  {rewardWallet?.pendingStoreCreditCents ? 'Reserved credit exists' : 'Wallet ready'}
                </StatusPill>
              </div>
              <label className="mt-4 flex items-center justify-between rounded-md border border-white/10 bg-white/5 px-3 py-3 text-sm font-semibold text-zinc-300">
                <span>Apply wallet credit to this order</span>
                <input
                  type="checkbox"
                  checked={applyStoreCredit}
                  disabled={!user?.id || availableStoreCreditCents <= 0 || subtotalCents < 6000}
                  onChange={(event) => setApplyStoreCredit(event.target.checked)}
                  className="h-4 w-4 accent-[#c8f500]"
                />
              </label>
            </div>
            <button
              onClick={checkout}
              disabled={status === 'saving' || !validItems.length}
              className="mt-5 w-full rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-not-allowed disabled:bg-zinc-700 disabled:text-zinc-400"
            >
              {status === 'saving' ? 'Opening Checkout' : 'Proceed to Checkout'}
            </button>
            <Link href="/products" className="mt-3 inline-flex w-full justify-center rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">
              Continue shopping
            </Link>
            <div className="mt-4">
              <SaveBanner status={status} message={message} />
            </div>
          </Panel>
        </div>
      )}
    </ShellSection>
  )
}

function CartPageFallback() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx store cart" copy="Build a product order from the Catalyx nutrition system and checkout through Stripe-hosted payment." />
      <Panel className="mt-6 p-5">
        <StatusPill tone="blue">Loading cart</StatusPill>
        <p className="mt-3 text-sm leading-6 text-zinc-300">Preparing your current cart and Stripe checkout status.</p>
      </Panel>
    </ShellSection>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-zinc-300">
      <span>{label}</span>
      <span className="font-bold text-white">{value}</span>
    </div>
  )
}
