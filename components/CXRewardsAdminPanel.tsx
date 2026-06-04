'use client'

import { useState } from 'react'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import {
  adjustCxByAdmin,
  formatMoneyFromCents,
  getCxRewardsAdminSummary,
  readCxRewardCatalog,
  readCxRewardConfig,
  writeCxRewardCatalog,
  writeCxRewardConfig,
  type CxRewardCategory,
  type CxRewardConfig,
  type CxRewardDefinition,
} from '@/lib/rewards'

export default function CXRewardsAdminPanel() {
  const [config, setConfig] = useState<CxRewardConfig>(() => readCxRewardConfig())
  const [catalog, setCatalog] = useState<CxRewardDefinition[]>(() => readCxRewardCatalog())
  const [targetUserId, setTargetUserId] = useState('guest')
  const [adjustment, setAdjustment] = useState('250')
  const [message, setMessage] = useState<{ status: 'idle' | 'saved' | 'error'; text?: string }>({ status: 'idle' })
  const summary = getCxRewardsAdminSummary()

  function saveConfig() {
    writeCxRewardConfig(config)
    setMessage({ status: 'saved', text: 'CX rewards config saved locally.' })
  }

  function saveCatalog() {
    writeCxRewardCatalog(catalog)
    setMessage({ status: 'saved', text: 'Reward catalog saved locally.' })
  }

  function grantAdjustment() {
    const points = Number(adjustment)
    if (!Number.isFinite(points) || points === 0) {
      setMessage({ status: 'error', text: 'Enter a non-zero point adjustment.' })
      return
    }
    adjustCxByAdmin({
      userId: targetUserId || 'guest',
      pointsDelta: points,
      detail: 'Manual admin CX adjustment.',
    })
    setMessage({ status: 'saved', text: `Adjusted ${targetUserId || 'guest'} by ${points} CX.` })
  }

  function updateReward(rewardId: string, patch: Partial<CxRewardDefinition>) {
    setCatalog((current) => current.map((reward) => (reward.id === rewardId ? { ...reward, ...patch } : reward)))
  }

  return (
    <div className="mt-6 grid gap-6">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">CX Rewards admin</p>
            <h2 className="mt-2 text-2xl font-black text-white">Economy controls</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusPill tone="lime">{summary.users} users</StatusPill>
            <StatusPill tone="blue">{formatMoneyFromCents(summary.storeCreditLiabilityCents)} liability</StatusPill>
          </div>
        </div>
        <SaveBanner status={message.status} message={message.text} />
        <div className="mt-5 grid gap-3 md:grid-cols-4">
          <Metric title="Issued" value={`${summary.totalCxIssued} CX`} />
          <Metric title="Spent" value={`${summary.totalCxSpent} CX`} />
          <Metric title="Liability" value={formatMoneyFromCents(summary.storeCreditLiabilityCents)} />
          <Metric title="Mission claims" value={String(summary.missionClaims)} />
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Redemption mix</p>
            <div className="mt-3 grid gap-2">
              {summary.redemptionMix.length ? (
                summary.redemptionMix.slice(0, 4).map((entry) => (
                  <div key={entry.category} className="flex items-center justify-between gap-3 text-sm text-zinc-300">
                    <span>{entry.category}</span>
                    <span className="font-black text-white">{entry.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No redemption activity yet.</p>
              )}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Top claimed rewards</p>
            <div className="mt-3 grid gap-2">
              {summary.topRewards.length ? (
                summary.topRewards.slice(0, 4).map((entry) => (
                  <div key={entry.reward} className="flex items-center justify-between gap-3 text-sm text-zinc-300">
                    <span>{entry.reward}</span>
                    <span className="font-black text-white">{entry.count}</span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">No reward claims yet.</p>
              )}
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-white">Launch defaults</h2>
          <button onClick={saveConfig} className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
            Save config
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <NumberField label="Free value per 100 CX" value={config.pointValuePer100Cx.free} onChange={(value) => setConfig({ ...config, pointValuePer100Cx: { ...config.pointValuePer100Cx, free: value } })} step={0.1} />
          <NumberField label="Monthly value per 100 CX" value={config.pointValuePer100Cx.monthly} onChange={(value) => setConfig({ ...config, pointValuePer100Cx: { ...config.pointValuePer100Cx, monthly: value } })} step={0.1} />
          <NumberField label="Annual value per 100 CX" value={config.pointValuePer100Cx.yearly} onChange={(value) => setConfig({ ...config, pointValuePer100Cx: { ...config.pointValuePer100Cx, yearly: value } })} step={0.1} />
          <NumberField label="Minimum credit redemption CX" value={config.minimumStoreCreditRedemptionCx} onChange={(value) => setConfig({ ...config, minimumStoreCreditRedemptionCx: value })} />
          <NumberField label="Minimum order subtotal cents" value={config.minimumCreditOrderSubtotalCents} onChange={(value) => setConfig({ ...config, minimumCreditOrderSubtotalCents: value })} />
          <NumberField label="Inactivity expiry days" value={config.inactivityExpiryDays} onChange={(value) => setConfig({ ...config, inactivityExpiryDays: value })} />
          <ToggleField label="Allow promo stacking" checked={config.allowPromoStacking} onChange={(checked) => setConfig({ ...config, allowPromoStacking: checked })} />
          <ToggleField label="Allow free shipping stacking" checked={config.allowFreeShippingStacking} onChange={(checked) => setConfig({ ...config, allowFreeShippingStacking: checked })} />
          <ToggleField label="Reverse points on refunds" checked={config.reversePointsOnRefunds} onChange={(checked) => setConfig({ ...config, reversePointsOnRefunds: checked })} />
          <ToggleField label="Suspicious activity flags" checked={config.suspiciousFlagsEnabled} onChange={(checked) => setConfig({ ...config, suspiciousFlagsEnabled: checked })} />
          <ToggleField label="Reward audit logging" checked={config.rewardAuditEnabled} onChange={(checked) => setConfig({ ...config, rewardAuditEnabled: checked })} />
          <ToggleField label="Use credit for subscriptions" checked={config.allowSubscriptionCreditUse} onChange={(checked) => setConfig({ ...config, allowSubscriptionCreditUse: checked })} />
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-white">Manual CX adjustment</h2>
          <button onClick={grantAdjustment} className="rounded-md border border-white/15 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-white">
            Apply adjustment
          </button>
        </div>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            User ID
            <input value={targetUserId} onChange={(event) => setTargetUserId(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white" />
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            Point adjustment
            <input value={adjustment} onChange={(event) => setAdjustment(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white" />
          </label>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black text-white">Reward catalog controls</h2>
          <button onClick={saveCatalog} className="rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">
            Save rewards
          </button>
        </div>
        <div className="mt-5 grid gap-4">
          {catalog.map((reward) => (
            <div key={reward.id} className="rounded-md border border-white/10 bg-black/30 p-4">
              <div className="grid gap-4 lg:grid-cols-[1.3fr_0.7fr_0.6fr_0.6fr]">
                <div>
                  <p className="font-black text-white">{reward.title}</p>
                  <p className="mt-1 text-sm leading-6 text-zinc-400">{reward.description}</p>
                </div>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Cost CX
                  <input
                    type="number"
                    value={reward.costCx}
                    onChange={(event) => updateReward(reward.id, { costCx: Number(event.target.value) || 0 })}
                    className="rounded-md border border-white/10 bg-black px-3 py-2 text-white"
                  />
                </label>
                <label className="grid gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-500">
                  Category
                  <select
                    value={reward.category}
                    onChange={(event) => updateReward(reward.id, { category: event.target.value as CxRewardCategory })}
                    className="rounded-md border border-white/10 bg-black px-3 py-2 text-white"
                  >
                    <option value="digital">Digital</option>
                    <option value="boosts">Boosts</option>
                    <option value="store-credit">Store Credit</option>
                    <option value="subscriber-exclusive">Subscriber Exclusive</option>
                    <option value="physical">Physical</option>
                    <option value="limited-time">Limited Time</option>
                    <option value="founder-rare">Founder / Rare</option>
                  </select>
                </label>
                <div className="grid gap-2">
                  <ToggleField label="Visible" checked={reward.visible !== false} onChange={(checked) => updateReward(reward.id, { visible: checked })} />
                  <ToggleField label="Active" checked={reward.active !== false} onChange={(checked) => updateReward(reward.id, { active: checked })} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </Panel>
    </div>
  )
}

function Metric({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-md border border-white/10 bg-black/30 p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">{title}</p>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  step?: number
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <input type="number" step={step} value={value} onChange={(event) => onChange(Number(event.target.value) || 0)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white" />
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm font-semibold text-zinc-300">
      <span>{label}</span>
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[#c8f500]" />
    </label>
  )
}
