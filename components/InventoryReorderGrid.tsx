'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import AddToCartButton from '@/components/AddToCartButton'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { products } from '@/lib/catalyx'
import { products as storeProducts } from '@/lib/products'
import { formatMoneyFromCents, getCxRewardSnapshot } from '@/lib/rewards'
import { loadCurrentUserProductInventory, loadCurrentUserRewardWallet, type ProductInventoryRow, type RewardWalletRow } from '@/lib/supabase-services'

function formatReorderDate(value: string | null) {
  if (!value) return 'Calculate from usage'
  return new Intl.DateTimeFormat('en-NZ', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export default function InventoryReorderGrid() {
  const [inventory, setInventory] = useState<ProductInventoryRow[]>([])
  const [rewardWallet, setRewardWallet] = useState<RewardWalletRow | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([loadCurrentUserProductInventory(), loadCurrentUserRewardWallet().catch(() => null)])
      .then(([rows, wallet]) => {
        if (!alive) return
        setInventory(rows)
        setRewardWallet(wallet)
      })
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [])

  const walletCreditCents = rewardWallet
    ? Math.max(0, rewardWallet.storeCreditBalanceCents - rewardWallet.pendingStoreCreditCents)
    : getCxRewardSnapshot({ userId: 'guest' }).storeCreditBalanceCents

  const inventoryByProduct = useMemo(
    () =>
      new Map(
        inventory.map((entry) => [
          entry.productId,
          entry,
        ])
      ),
    [inventory]
  )

  return (
    <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => {
        const liveInventory = inventoryByProduct.get(product.id)
        const remaining = liveInventory ? Math.max(0, liveInventory.amountRemainingMl) : 820 - index * 55
        const usagePerFeed = liveInventory?.usagePerFeedMl ? Math.max(1, liveInventory.usagePerFeedMl) : 20 + index * 3
        const days = liveInventory?.estimatedDaysLeft ? Math.max(1, liveInventory.estimatedDaysLeft) : Math.max(6, Math.round(remaining / usagePerFeed))
        const reorderThreshold = liveInventory?.reorderThresholdDays ?? 10
        const reorderInDays = Math.max(1, days - reorderThreshold)
        const catalogueProduct = storeProducts.find((entry) => entry.id === product.id)
        const lowSoon = days <= reorderThreshold
        return (
          <Panel key={product.id} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{product.purpose}</p>
                <h2 className="mt-2 text-2xl font-black" style={{ color: product.accent }}>{product.name}</h2>
              </div>
              <StatusPill tone={lowSoon ? 'amber' : 'lime'}>{lowSoon ? 'Reorder now' : 'Stocked'}</StatusPill>
            </div>
            <p className="mt-4 text-sm leading-6 text-zinc-400">
              Bottle size: {Math.max(250, liveInventory?.bottleSizeMl ?? 1000)} ml. Amount remaining: {Math.round(remaining)} ml. Estimated {days} days left.
            </p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">
              Reorder target: in {reorderInDays} day{reorderInDays === 1 ? '' : 's'} or by {formatReorderDate(liveInventory?.estimatedReorderDate ?? null)}.
            </p>
            <div className="mt-4 h-2 rounded-full bg-white/10">
              <div className="h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(8, remaining / 10))}%`, maxWidth: '100%', backgroundColor: product.accent, boxShadow: `0 0 18px ${product.accent}66` }} />
            </div>
            <div className="mt-4 rounded-md border border-white/10 bg-black/30 p-3 text-sm leading-6 text-zinc-300">
              {catalogueProduct ? (
                <>Next reorder is {walletCreditCents > 0 ? `partially covered by ${formatMoneyFromCents(walletCreditCents)} wallet credit.` : 'ready to route straight into checkout when stock runs low.'}</>
              ) : (
                <>Inventory is tracked here even when the product card is not currently purchasable from the store.</>
              )}
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              {catalogueProduct ? (
                <AddToCartButton product={catalogueProduct} className="px-4" />
              ) : null}
              <Link href={`/products/${product.id}`} className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white transition hover:border-[#c8f500]/60 hover:text-[#d9ff34]">
                Product details
              </Link>
            </div>
          </Panel>
        )
      })}
    </div>
  )
}
