'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import type { DailyCheckIn } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { claimDailyCheckInReward } from '@/lib/rewards'
import { saveDailyCheckInToSupabase } from '@/lib/supabase-services'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

export default function QuickCheckIn() {
  const { user } = useAuth()
  const [leafColour, setLeafColour] = useState('Balanced')
  const [growthSpeed, setGrowthSpeed] = useState('Strong')
  const [pestConcern, setPestConcern] = useState('None')
  const [overallPlantFeel, setOverallPlantFeel] = useState('Stable')
  const [stress, setStress] = useState(2)
  const [droop, setDroop] = useState(1)
  const [environment, setEnvironment] = useState(84)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Check-in saved locally.')
  const score = Math.max(45, 100 - stress * 8 - droop * 6 + Math.round((environment - 75) / 3))

  async function saveCheckIn() {
    setStatus('saving')
    const checkIn: DailyCheckIn = {
      id: `check-in-${Date.now()}`,
      checkedAt: new Date().toISOString(),
      leafColour,
      droopLevel: droop,
      growthSpeed,
      stressLevel: stress,
      pestConcern,
      environmentStability: environment,
      overallPlantFeel,
      healthScore: score,
      source: 'local',
    }
    const next = [checkIn, ...readLocalList<DailyCheckIn>(storageKeys.dailyCheckIns)].slice(0, 40)
    writeLocalList(storageKeys.dailyCheckIns, next)
    const rewardResult = claimDailyCheckInReward({ userId: user?.id ?? 'guest', plan: user?.plan })
    try {
      const result = await saveDailyCheckInToSupabase(checkIn)
      setStatus('saved')
      setMessage(rewardResult.ok ? `${result.message} Daily reward: +${rewardResult.pointsAwarded} CX.` : `${result.message} ${rewardResult.error ?? ''}`.trim())
    } catch {
      setStatus('saved')
      setMessage(rewardResult.ok ? `Check-in saved locally. Daily reward: +${rewardResult.pointsAwarded} CX.` : 'Check-in saved locally. Supabase sync failed and can be retried later.')
    }
  }

  return (
    <Panel className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Fast daily check-in</p>
          <h2 className="mt-2 text-3xl font-black text-white">Log the plant feel in under one minute.</h2>
        </div>
        <StatusPill tone={score > 82 ? 'lime' : 'amber'}>Projected health {score}/100</StatusPill>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SelectField label="Leaf colour" value={leafColour} setValue={setLeafColour} options={['Deep green', 'Balanced', 'Pale', 'Tip burn']} />
        <SelectField label="Growth speed" value={growthSpeed} setValue={setGrowthSpeed} options={['Slow', 'Steady', 'Strong', 'Explosive']} />
        <SelectField label="Pest concern" value={pestConcern} setValue={setPestConcern} options={['None', 'Monitor', 'Confirmed']} />
        <SelectField label="Overall plant feel" value={overallPlantFeel} setValue={setOverallPlantFeel} options={['Stable', 'Improving', 'Stressed', 'Recovery']} />
        <Range label="Droop level" value={droop} setValue={setDroop} max={5} />
        <Range label="Stress level" value={stress} setValue={setStress} max={5} />
        <Range label="Environment stability" value={environment} setValue={setEnvironment} max={100} />
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Optional photo
          <input type="file" className="rounded-md border border-dashed border-white/15 bg-black px-3 py-3 text-sm text-zinc-500 file:mr-4 file:rounded-md file:border-0 file:bg-[#c8f500] file:px-3 file:py-2 file:text-sm file:font-bold file:text-black" />
        </label>
      </div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <button onClick={saveCheckIn} className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save check-in</button>
        <button className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Approve suggested journal entry</button>
      </div>
      <div className="mt-4">
        <SaveBanner status={status} message={message} />
      </div>
    </Panel>
  )
}

function SelectField({
  label,
  value,
  setValue,
  options,
}: {
  label: string
  value: string
  setValue: (value: string) => void
  options: string[]
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </label>
  )
}

function Range({
  label,
  value,
  setValue,
  max,
}: {
  label: string
  value: number
  setValue: (value: number) => void
  max: number
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      <span className="flex justify-between">
        {label}
        <span className="text-[#c8f500]">{value}</span>
      </span>
      <input type="range" min={0} max={max} value={value} onChange={(event) => setValue(Number(event.target.value))} className="accent-[#c8f500]" />
    </label>
  )
}
