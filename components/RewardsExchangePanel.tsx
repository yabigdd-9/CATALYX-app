'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, storageKeys } from '@/lib/persistence'
import {
  buildCxMissionActivitySummary,
  claimDailyCheckInReward,
  claimCxMission,
  CX_ACHIEVEMENTS,
  formatMoneyFromCents,
  getCxRewardSnapshot,
  membershipTierLabel,
  redeemCxReward,
  spinGrowWheel,
  syncCxRewardsFromActivity,
  type CxOrderSummary,
  type CxRewardCategory,
  type CxRewardsSnapshot,
} from '@/lib/rewards'
import { loadCurrentUserProductOrders, loadCurrentUserRewardWallet, type RewardWalletRow } from '@/lib/supabase-services'
import type { TrackedGrow } from '@/lib/catalyx'

const categoryOrder: Array<{ id: CxRewardCategory; label: string }> = [
  { id: 'digital', label: 'Digital' },
  { id: 'boosts', label: 'Boosts' },
  { id: 'store-credit', label: 'Store Credit' },
  { id: 'subscriber-exclusive', label: 'Subscriber Exclusive' },
  { id: 'physical', label: 'Physical' },
  { id: 'limited-time', label: 'Limited Time' },
  { id: 'founder-rare', label: 'Founder / Rare' },
]

function formatDate(value: string | null) {
  if (!value) return 'Not available'
  return new Intl.DateTimeFormat('en-NZ', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

function streakPercent(current: number) {
  return Math.min(100, Math.round(((current % 7) || 7) / 7 * 100))
}

export default function RewardsExchangePanel({
  className = '',
  variant = 'full',
}: {
  className?: string
  variant?: 'full' | 'compact'
}) {
  const { user } = useAuth()
  const userId = user?.id ?? 'guest'
  const [grows] = useState<TrackedGrow[]>(() => readLocalList<TrackedGrow>(storageKeys.grows))
  const [photos] = useState(() => readLocalList(storageKeys.photos))
  const [checkIns] = useState(() => readLocalList(storageKeys.dailyCheckIns))
  const [feedLogs] = useState(() => readLocalList(storageKeys.feedLogs))
  const [environmentLogs] = useState(() => readLocalList(storageKeys.environmentLogs))
  const [journalEntries] = useState(() => readLocalList(storageKeys.journalEntries))
  const [orders, setOrders] = useState<CxOrderSummary[]>([])
  const [backendWallet, setBackendWallet] = useState<RewardWalletRow | null>(null)
  const [activeCategory, setActiveCategory] = useState<CxRewardCategory>('digital')
  const [banner, setBanner] = useState<{ status: 'idle' | 'saved' | 'error'; message?: string }>({ status: 'idle' })
  const [spinResult, setSpinResult] = useState<string | null>(null)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    let active = true
    Promise.all([loadCurrentUserProductOrders(), loadCurrentUserRewardWallet().catch(() => null)])
      .then(([rows, wallet]) => {
        if (!active) return
        setOrders(rows.map((row) => ({
          id: row.id,
          amountTotal: Number(row.amount_total ?? 0),
          currency: row.currency,
          status: row.status,
          createdAt: row.created_at,
        })))
        setBackendWallet(wallet)
      })
      .catch(() => undefined)
    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    let active = true
    queueMicrotask(() => {
      if (!active) return
      syncCxRewardsFromActivity({
        userId,
        plan: user?.plan,
        hasProfile: Boolean(user?.email && user?.name),
        growsCount: grows.length,
        photosCount: photos.length,
        dailyCheckInsCount: checkIns.length,
        orders,
      })
      setRefreshKey((value) => value + 1)
    })
    return () => {
      active = false
    }
  }, [checkIns.length, grows.length, orders, photos.length, user?.email, user?.name, user?.plan, userId])

  const missionActivity = useMemo(
    () => buildCxMissionActivitySummary({ checkIns, photos, feedLogs, environmentLogs, journalEntries }),
    [checkIns, environmentLogs, feedLogs, journalEntries, photos]
  )

  const snapshot = useMemo<CxRewardsSnapshot>(
    () => {
      void refreshKey
      return getCxRewardSnapshot({ userId, plan: user?.plan, activitySummary: missionActivity })
    },
    [missionActivity, refreshKey, user?.plan, userId]
  )

  const filteredRewards = useMemo(
    () => snapshot.availableRewards.filter((reward) => reward.category === activeCategory),
    [activeCategory, snapshot.availableRewards]
  )
  const availableStoreCreditCents = backendWallet
    ? Math.max(0, backendWallet.storeCreditBalanceCents - backendWallet.pendingStoreCreditCents)
    : snapshot.storeCreditBalanceCents

  useEffect(() => {
    if (!user?.id && !user?.email) return
    fetch('/api/rewards/sync', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId,
        email: user?.email,
        balanceCx: snapshot.balanceCx,
        tier: snapshot.tier,
      }),
    }).catch(() => undefined)
  }, [snapshot.balanceCx, snapshot.tier, user?.email, user?.id, userId])

  async function handleRedeem(rewardId: string) {
    const reward = snapshot.availableRewards.find((entry) => entry.id === rewardId)
    if (!reward) {
      setBanner({ status: 'error', message: 'Reward not found.' })
      return
    }

    if (reward.kind === 'store_credit' && user?.id) {
      try {
        const response = await fetch('/api/rewards/redeem', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            email: user.email,
            rewardId,
            plan: user.plan,
          }),
        })
        const payload = await response.json()
        if (!response.ok || !payload.ok) {
          setBanner({ status: 'error', message: payload.error ?? 'Backend reward redemption failed.' })
          return
        }
        if (payload.wallet) {
          setBackendWallet({
            balanceCx: Number(payload.wallet.balanceCx ?? 0),
            tier: payload.wallet.tier === 'yearly' || payload.wallet.tier === 'monthly' ? payload.wallet.tier : 'free',
            storeCreditBalanceCents: Number(payload.wallet.storeCreditBalanceCents ?? 0),
            pendingStoreCreditCents: Number(payload.wallet.pendingStoreCreditCents ?? 0),
          })
        }
      } catch {
        setBanner({ status: 'error', message: 'Could not sync the reward wallet to the backend.' })
        return
      }
    }

    const result = redeemCxReward({ userId, rewardId, plan: user?.plan })
    if (!result.ok || !result.reward) {
      setBanner({ status: 'error', message: result.error })
      return
    }
    setBanner({ status: 'saved', message: `${result.reward.title} redeemed successfully.` })
    setRefreshKey((value) => value + 1)
  }

  function handleSpin() {
    const result = spinGrowWheel({ userId, plan: user?.plan })
    if (!result.ok || !result.slice) {
      setBanner({ status: 'error', message: result.error })
      return
    }
    setSpinResult(result.slice.label)
    setBanner({ status: 'saved', message: `Grow Wheel result: ${result.slice.label}.` })
    setRefreshKey((value) => value + 1)
  }

  function handleClaimCheckInBonus() {
    const result = claimDailyCheckInReward({ userId, plan: user?.plan })
    if (!result.ok) {
      setBanner({ status: 'error', message: result.error })
      return
    }
    setBanner({ status: 'saved', message: `Daily check-in reward claimed: +${result.pointsAwarded} CX. Streak is now ${result.streak}.` })
    setRefreshKey((value) => value + 1)
  }

  function handleClaimMission(missionId: string) {
    const result = claimCxMission({ userId, missionId, activitySummary: missionActivity })
    if (!result.ok || !result.mission) {
      setBanner({ status: 'error', message: result.error })
      return
    }
    setBanner({ status: 'saved', message: `${result.mission.title} completed for +${result.mission.rewardCx} CX.` })
    setRefreshKey((value) => value + 1)
  }

  if (variant === 'compact') {
    return (
      <Panel className={`p-5 ${className}`}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">CATALYX CX Rewards</p>
            <h2 className="mt-2 text-2xl font-black text-white">Earn. Grow. Unlock.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">
              {snapshot.balanceCx} CX is worth {formatMoneyFromCents(snapshot.currentValueCents)} now, or {formatMoneyFromCents(snapshot.yearlyValueCents)} on Annual.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="lime">{snapshot.balanceCx} CX</StatusPill>
            <StatusPill tone="blue">{membershipTierLabel(snapshot.tier)}</StatusPill>
          </div>
        </div>
        <SaveBanner status={banner.status} message={banner.message} />
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-md border border-[#c8f500]/25 bg-[#c8f500]/10 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-[#d9ff34]">Streak</p>
            <p className="mt-2 text-3xl font-black text-white">{snapshot.streak.current} days</p>
            <p className="mt-2 text-sm text-zinc-300">Next reward: {snapshot.streak.nextRewardCx} CX</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Wheel</p>
            <p className="mt-2 text-3xl font-black text-white">{snapshot.wheel.extraSpins}</p>
            <p className="mt-2 text-sm text-zinc-400">{snapshot.wheel.canSpin ? 'Free spin ready now.' : `Next free spin after ${formatDate(snapshot.wheel.lastFreeSpinAt)}.`}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Store credit</p>
            <p className="mt-2 text-3xl font-black text-white">{formatMoneyFromCents(availableStoreCreditCents)}</p>
            <p className="mt-2 text-sm text-zinc-400">{user?.id ? 'Backed by your checkout wallet and reserved per order.' : 'Sign in to lock store credit to your checkout wallet.'}</p>
          </div>
        </div>
        {snapshot.missions.some((mission) => mission.readyToClaim) ? (
          <div className="mt-5 rounded-md border border-[#16d6c8]/25 bg-[#16d6c8]/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-white">CX Mission ready</p>
              <StatusPill tone="blue">{snapshot.missions.filter((mission) => mission.readyToClaim).length} claimable</StatusPill>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-300">Weekly missions are now live. Claim the ready task and keep the habit loop moving.</p>
          </div>
        ) : null}
        <div className="mt-5 grid gap-3 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-white">Best use of your CX</p>
              <StatusPill tone="amber">Annual best value</StatusPill>
            </div>
            <div className="mt-3 grid gap-3">
              {snapshot.recommendedRewards.slice(0, 2).map((reward) => (
                <div key={reward.id} className="rounded-md border border-white/10 bg-black/30 p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{reward.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">{reward.description}</p>
                    </div>
                    <StatusPill tone="lime">{reward.costCx} CX</StatusPill>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <div className="flex flex-wrap gap-2">
              {!snapshot.streak.todayClaimed ? (
                <button onClick={handleClaimCheckInBonus} className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
                  Claim check-in CX
                </button>
              ) : null}
              <button
                onClick={handleSpin}
                disabled={!snapshot.wheel.canSpin}
                className={`rounded-md px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${
                  snapshot.wheel.canSpin ? 'bg-white text-black' : 'border border-white/10 bg-white/5 text-zinc-500'
                }`}
              >
                Spin Grow Wheel
              </button>
              <Link href="/rewards" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
                Open rewards hub
              </Link>
            </div>
            {spinResult ? <p className="mt-3 text-sm text-zinc-300">Last spin: {spinResult}</p> : null}
          </div>
        </div>
      </Panel>
    )
  }

  return (
    <div id="rewards" className={className}>
      <Panel className="overflow-hidden border-[#c8f500]/25">
        <div className="bg-[radial-gradient(circle_at_top_left,rgba(200,245,0,0.16),transparent_38%),radial-gradient(circle_at_85%_20%,rgba(51,217,255,0.14),transparent_28%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent)] p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#d9ff34]">CATALYX CX Rewards</p>
              <h2 className="mt-2 text-3xl font-black text-white">Earn. Grow. Unlock.</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-300">
                A premium loyalty layer built around progression, digital utility, store credit discipline, and conversion-aware reward value.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusPill tone="lime">{snapshot.balanceCx} CX</StatusPill>
              <StatusPill tone="blue">{membershipTierLabel(snapshot.tier)}</StatusPill>
              <StatusPill tone="amber">Annual best value</StatusPill>
            </div>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-4">
            <MetricTile title="Current balance" value={`${snapshot.balanceCx} CX`} body={`Current value: ${formatMoneyFromCents(snapshot.currentValueCents)}`} accent="lime" />
            <MetricTile title="Monthly value" value={formatMoneyFromCents(snapshot.monthlyValueCents)} body="100 CX = $1.50 on Monthly." accent="blue" />
            <MetricTile title="Annual value" value={formatMoneyFromCents(snapshot.yearlyValueCents)} body="100 CX = $2.00 on Annual. Best Value." accent="amber" />
            <MetricTile title="Store credit wallet" value={formatMoneyFromCents(availableStoreCreditCents)} body={user?.id ? 'Applied, reserved, and restored through backend checkout events.' : 'Sign in to make store credit usable at checkout.'} accent="violet" />
          </div>
        </div>
      </Panel>

      <SaveBanner status={banner.status} message={banner.message} />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Daily streak</p>
              <h3 className="mt-2 text-2xl font-black text-white">{snapshot.streak.current}-day streak</h3>
            </div>
            <StatusPill tone={snapshot.streak.todayClaimed ? 'lime' : 'amber'}>
              {snapshot.streak.todayClaimed ? 'Claimed today' : 'Ready to claim'}
            </StatusPill>
          </div>
          <div className="mt-4 h-3 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#c8f500]" style={{ width: `${streakPercent(snapshot.streak.current)}%` }} />
          </div>
          <div className="mt-4 grid gap-2 sm:grid-cols-7">
            {[10, 15, 20, 25, 30, 40, 100].map((value, index) => {
              const day = index + 1
              const reached = day <= ((snapshot.streak.current % 7) || (snapshot.streak.current ? 7 : 0))
              return (
                <div key={day} className={`rounded-md border p-3 ${reached ? 'border-[#c8f500]/40 bg-[#c8f500]/10' : 'border-white/10 bg-black/30'}`}>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Day {day}</p>
                  <p className="mt-2 font-black text-white">{value} CX</p>
                </div>
              )
            })}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            {!snapshot.streak.todayClaimed ? (
              <button onClick={handleClaimCheckInBonus} className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
                Claim daily check-in
              </button>
            ) : null}
            <Link href="/check-in" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
              Open check-in
            </Link>
            <Link href="/pricing" className="rounded-md border border-[#c8f500]/30 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-[#d9ff34]">
              Upgrade for better CX value
            </Link>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[7, 14, 21, 30].map((milestone) => (
              <div key={milestone} className="rounded-md border border-white/10 bg-black/30 p-3">
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{milestone} days</p>
                <p className="mt-2 font-black text-white">
                  {milestone === 7 ? '100 CX bonus' : milestone === 14 ? '250 CX bonus' : milestone === 21 ? '500 CX bonus' : '1000 CX + crate'}
                </p>
              </div>
            ))}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Grow Wheel</p>
              <h3 className="mt-2 text-2xl font-black text-white">1 free spin every 24 hours</h3>
            </div>
            <StatusPill tone={snapshot.wheel.canSpin ? 'lime' : 'blue'}>
              {snapshot.wheel.canSpin ? 'Spin ready' : 'Cooling down'}
            </StatusPill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {['10 CX', '25 CX', '50 CX', '100 CX', 'Extra spin', 'Theme unlock'].map((label, index) => (
              <div key={label} className={`rounded-md border p-3 ${index < 2 ? 'border-[#c8f500]/20 bg-[#c8f500]/5' : 'border-white/10 bg-black/30'}`}>
                <p className="text-sm font-black text-white">{label}</p>
                <p className="mt-1 text-xs text-zinc-500">{index < 2 ? 'Common' : index < 4 ? 'Rare' : 'Very rare'}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <button
              onClick={handleSpin}
              disabled={!snapshot.wheel.canSpin}
              className={`rounded-md px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${
                snapshot.wheel.canSpin ? 'bg-[#c8f500] text-black' : 'border border-white/10 bg-white/5 text-zinc-500'
              }`}
            >
              Spin the wheel
            </button>
            <div className="rounded-md border border-white/10 bg-black/30 px-4 py-3 text-xs font-semibold text-zinc-300">
              Extra spins: {snapshot.wheel.extraSpins}
            </div>
          </div>
          {spinResult ? <p className="mt-3 text-sm text-zinc-300">Last result: {spinResult}</p> : null}
          <p className="mt-4 text-sm leading-6 text-zinc-400">
            Higher-value slices stay rare. Paid tiers can receive better odds through configurable weighting without turning the wheel into a discount machine.
          </p>
        </Panel>
      </div>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">CX Missions</p>
            <h3 className="mt-2 text-2xl font-black text-white">Weekly habit loops</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
              Missions convert core GrowOS actions into explicit weekly goals so the rewards system drives app habit formation instead of passive collection.
            </p>
          </div>
          <StatusPill tone="amber">{snapshot.missions.filter((mission) => mission.readyToClaim).length} ready</StatusPill>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {snapshot.missions.map((mission) => {
            const percent = Math.min(100, Math.round((mission.progress / mission.target) * 100))
            return (
              <div key={mission.id} className="rounded-lg border border-white/10 bg-black/30 p-4" style={{ boxShadow: `inset 0 1px 0 ${mission.accent}25` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: mission.accent }}>This week</p>
                    <h4 className="mt-2 text-xl font-black text-white">{mission.title}</h4>
                  </div>
                  <StatusPill tone={mission.claimed ? 'blue' : mission.readyToClaim ? 'lime' : 'amber'}>
                    {mission.claimed ? 'Claimed' : mission.readyToClaim ? 'Ready' : `${mission.progress}/${mission.target}`}
                  </StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{mission.description}</p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: mission.accent }} />
                </div>
                <div className="mt-3 flex items-center justify-between gap-3">
                  <p className="text-sm font-semibold text-zinc-300">{mission.rewardCx} CX reward</p>
                  <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Week {mission.weekKey}</p>
                </div>
                <button
                  type="button"
                  onClick={() => handleClaimMission(mission.id)}
                  disabled={!mission.readyToClaim || mission.claimed}
                  className={`mt-4 inline-flex w-full justify-center rounded-md px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${
                    mission.readyToClaim && !mission.claimed
                      ? 'bg-[#c8f500] text-black hover:bg-[#e0ff33]'
                      : 'border border-white/10 bg-white/5 text-zinc-500'
                  }`}
                >
                  {mission.claimed ? 'Already claimed' : mission.readyToClaim ? 'Claim mission reward' : 'Mission in progress'}
                </button>
              </div>
            )
          })}
        </div>
      </Panel>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Reward store</p>
            <h3 className="mt-2 text-2xl font-black text-white">Digital rewards first</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {categoryOrder.map((category) => (
              <button
                key={category.id}
                type="button"
                onClick={() => setActiveCategory(category.id)}
                className={`rounded-full border px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${
                  activeCategory === category.id
                    ? 'border-[#c8f500]/50 bg-[#c8f500]/10 text-[#d9ff34]'
                    : 'border-white/10 bg-black/30 text-zinc-400'
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filteredRewards.map((reward) => {
            const owned = snapshot.ownedRewards.find((item) => item.reward.id === reward.id)?.quantity ?? 0
            const lockedByBalance = snapshot.balanceCx < reward.costCx
            return (
              <div key={reward.id} className="rounded-lg border border-white/10 bg-black/30 p-4" style={{ boxShadow: `inset 0 1px 0 ${reward.accent}33` }}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em]" style={{ color: reward.accent }}>{reward.rarity}</p>
                    <h4 className="mt-2 text-xl font-black text-white">{reward.title}</h4>
                  </div>
                  <StatusPill tone={reward.category === 'store-credit' ? 'blue' : 'lime'}>{reward.costCx} CX</StatusPill>
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-400">{reward.description}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {reward.minimumTier ? <StatusPill tone="amber">{membershipTierLabel(reward.minimumTier)}+</StatusPill> : null}
                  {reward.limitedQuantity ? <StatusPill tone="red">Limited</StatusPill> : null}
                  {owned > 0 ? <StatusPill tone="violet">Owned x{owned}</StatusPill> : null}
                </div>
                {reward.category === 'store-credit' ? (
                  <p className="mt-4 text-sm text-zinc-300">
                    Current tier value: {formatMoneyFromCents(snapshot.tier === 'free' ? Math.round(reward.costCx) : snapshot.tier === 'monthly' ? Math.round(reward.costCx * 1.5) : reward.costCx * 2)}
                  </p>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleRedeem(reward.id)}
                  disabled={lockedByBalance}
                  className={`mt-4 inline-flex w-full justify-center rounded-md px-4 py-3 text-xs font-black uppercase tracking-[0.12em] ${
                    lockedByBalance
                      ? 'border border-white/10 bg-white/5 text-zinc-500'
                      : 'bg-[#c8f500] text-black hover:bg-[#e0ff33]'
                  }`}
                >
                  {lockedByBalance ? `Need ${reward.costCx - snapshot.balanceCx} more CX` : reward.category === 'store-credit' ? 'Convert CX' : 'Redeem reward'}
                </button>
              </div>
            )
          })}
        </div>
      </Panel>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Achievements</p>
              <h3 className="mt-2 text-2xl font-black text-white">Milestones that actually matter</h3>
            </div>
            <StatusPill tone="lime">{snapshot.achievements.length} unlocked</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {CX_ACHIEVEMENTS.map((achievement) => {
              const unlocked = snapshot.achievements.find((item) => item.id === achievement.id)
              return (
                <div key={achievement.id} className={`rounded-md border p-4 ${unlocked ? 'border-[#c8f500]/35 bg-[#c8f500]/10' : 'border-white/10 bg-black/30'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-white">{achievement.title}</p>
                    <StatusPill tone={unlocked ? 'lime' : 'amber'}>{unlocked ? 'Unlocked' : 'Locked'}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{achievement.description}</p>
                  <p className="mt-3 text-xs uppercase tracking-[0.14em] text-zinc-500">
                    {achievement.points ? `+${achievement.points} CX` : achievement.badgeTitle ?? 'Badge unlock'}
                  </p>
                </div>
              )
            })}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Referral engine</p>
              <h3 className="mt-2 text-2xl font-black text-white">Give the code, earn the CX</h3>
            </div>
            <StatusPill tone="blue">{snapshot.referralCode}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Referral code</p>
              <p className="mt-2 text-2xl font-black text-white">{snapshot.referralCode}</p>
              <p className="mt-2 text-sm text-zinc-400">Referrer gets 500 CX on a valid signup action and 1,000 CX after the first qualifying purchase.</p>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Upgrade pressure</p>
              <p className="mt-2 text-sm leading-6 text-zinc-300">
                {snapshot.balanceCx} CX is worth {formatMoneyFromCents(snapshot.currentValueCents)} now, or {formatMoneyFromCents(snapshot.yearlyValueCents)} on Annual.
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3">
            {snapshot.notifications.slice(0, 3).map((item) => (
              <div key={item.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="font-black text-white">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_1fr]">
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-white">CX inventory and unlocks</h3>
            <StatusPill tone="violet">{snapshot.ownedRewards.length} active items</StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            {snapshot.ownedRewards.length ? snapshot.ownedRewards.map((item) => (
              <div key={item.reward.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-black text-white">{item.reward.title}</p>
                  <StatusPill tone="blue">x{item.quantity}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.reward.description}</p>
              </div>
            )) : (
              <div className="rounded-md border border-dashed border-white/15 bg-black/20 p-5 text-sm text-zinc-400">
                Nothing redeemed yet. Digital rewards are prioritised ahead of physical rewards to keep the economy sustainable.
              </div>
            )}
          </div>
        </Panel>

        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-2xl font-black text-white">Wallet and ledger</h3>
            <StatusPill tone="amber">{snapshot.spentCx} CX spent</StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            {snapshot.recentLedger.map((entry) => (
              <div key={entry.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white">{entry.title}</p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-zinc-500">{entry.source.replace(/_/g, ' ')}</p>
                  </div>
                  <StatusPill tone={entry.pointsDelta >= 0 ? 'lime' : 'red'}>
                    {entry.pointsDelta >= 0 ? `+${entry.pointsDelta} CX` : `${entry.pointsDelta} CX`}
                  </StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{entry.detail}</p>
                <p className="mt-2 text-xs text-zinc-500">{formatDate(entry.createdAt)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <Panel className="mt-6 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Rules and liability</p>
            <h3 className="mt-2 text-2xl font-black text-white">Checkout, expiry, and abuse prevention</h3>
          </div>
          <Link href="/rewards/terms" className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            View rewards terms
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <RuleCard title="Minimum credit threshold" body="Store credit starts at 500 CX and should only apply above the configured subtotal threshold." />
          <RuleCard title="Stacking rules" body="Major promo stacking is disabled by default. Free shipping can stack only when admin rules allow it." />
          <RuleCard title="Refund logic" body="Qualifying refunded orders can reverse earned CX fully or proportionally based on admin rules." />
          <RuleCard title="Inactivity expiry" body="CX expires after 12 months of account inactivity. Active users keep their balance." />
        </div>
        {snapshot.expiringCx > 0 ? (
          <div className="mt-5 rounded-md border border-[#ff3b45]/25 bg-[#ff3b45]/10 p-4 text-sm text-[#ffb4b8]">
            {snapshot.expiringCx} CX is at risk if inactivity continues past {formatDate(snapshot.inactivityWarningDate)}.
          </div>
        ) : null}
      </Panel>
    </div>
  )
}

function MetricTile({
  title,
  value,
  body,
  accent,
}: {
  title: string
  value: string
  body: string
  accent: 'lime' | 'blue' | 'amber' | 'violet'
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/35 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{title}</p>
        <StatusPill tone={accent}>{accent === 'amber' ? 'Best Value' : accent === 'violet' ? 'Wallet' : 'Live'}</StatusPill>
      </div>
      <p className="mt-3 text-3xl font-black text-white">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  )
}

function RuleCard({
  title,
  body,
}: {
  title: string
  body: string
}) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-4">
      <p className="font-black text-white">{title}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-400">{body}</p>
    </div>
  )
}
