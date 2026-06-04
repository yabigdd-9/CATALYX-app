'use client'

import { useMemo } from 'react'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { formatMoneyFromCents, getCxRewardSnapshot, membershipTierLabel } from '@/lib/rewards'

export default function PricingValueCallout() {
  const { user } = useAuth()
  const snapshot = useMemo(
    () =>
      getCxRewardSnapshot({
        userId: user?.id ?? 'guest',
        plan: user?.plan,
      }),
    [user?.id, user?.plan]
  )

  return (
    <Panel className="mt-6 overflow-hidden border-[#33d9ff]/25">
      <div className="grid gap-5 bg-[radial-gradient(circle_at_top_right,rgba(51,217,255,0.14),transparent_34%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] p-5 lg:grid-cols-[1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="blue">{membershipTierLabel(snapshot.tier)}</StatusPill>
            <StatusPill tone="amber">Upgrade pressure inside the product</StatusPill>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">Your CX is worth more on Pro</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
            {snapshot.balanceCx} CX is worth {formatMoneyFromCents(snapshot.currentValueCents)} now, {formatMoneyFromCents(snapshot.monthlyValueCents)} on Monthly, and {formatMoneyFromCents(snapshot.yearlyValueCents)} on Annual.
          </p>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            Reward redemptions can turn into real backend-tracked wallet credit, while Pro features become permanent product capability instead of one-off reward unlocks.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Free</p>
            <p className="mt-2 text-2xl font-black text-white">{formatMoneyFromCents(snapshot.currentValueCents)}</p>
            <p className="mt-2 text-sm text-zinc-400">Base CX value and temporary unlocks.</p>
          </div>
          <div className="rounded-md border border-[#c8f500]/25 bg-[#c8f500]/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#d9ff34]">Monthly</p>
            <p className="mt-2 text-2xl font-black text-white">{formatMoneyFromCents(snapshot.monthlyValueCents)}</p>
            <p className="mt-2 text-sm text-zinc-300">Higher redemption value plus broader Pro surfaces.</p>
          </div>
          <div className="rounded-md border border-[#33d9ff]/25 bg-[#33d9ff]/10 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-[#97eeff]">Annual</p>
            <p className="mt-2 text-2xl font-black text-white">{formatMoneyFromCents(snapshot.yearlyValueCents)}</p>
            <p className="mt-2 text-sm text-zinc-300">Best CX value and strongest case for permanent access.</p>
          </div>
        </div>
      </div>
      <div className="flex flex-wrap gap-3 border-t border-white/10 p-5">
        <Link href="/rewards" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
          Open rewards hub
        </Link>
        <Link href="/pro" className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
          See permanent Pro value
        </Link>
      </div>
    </Panel>
  )
}
