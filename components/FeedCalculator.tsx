'use client'

import { useMemo, useState } from 'react'
import {
  calculateAdaptiveFeed,
  modes,
  stageLabels,
  type Experience,
  type GrowMode,
  type Medium,
  type RunoffTrend,
  type Stage,
  type StressLevel,
} from '@/lib/catalyx'
import { Panel, ProductAccent, StatusPill } from '@/components/catalyx-ui'

const stages = Object.keys(stageLabels) as Stage[]
const experiences: Experience[] = ['beginner', 'standard', 'professional']
const mediums: Medium[] = ['hydro', 'coco', 'soil']
const runoffTrends: RunoffTrend[] = ['stable', 'rising', 'falling']
const stressLevels: StressLevel[] = ['low', 'moderate', 'high']

export default function FeedCalculator() {
  const [stage, setStage] = useState<Stage>('mid-flower')
  const [litres, setLitres] = useState(20)
  const [experience, setExperience] = useState<Experience>('standard')
  const [medium, setMedium] = useState<Medium>('coco')
  const [mode, setMode] = useState<GrowMode>('Quality Mode')
  const [runoffTrend, setRunoffTrend] = useState<RunoffTrend>('stable')
  const [stressLevel, setStressLevel] = useState<StressLevel>('low')

  const plan = useMemo(
    () => calculateAdaptiveFeed({ stage, litres, experience, mode, medium, runoffTrend, stressLevel }),
    [experience, litres, medium, mode, runoffTrend, stage, stressLevel],
  )
  const aggressive = plan.adjustmentPercent > 5 || plan.warnings.length > 0

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel className="p-5">
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            Growth stage
            <select value={stage} onChange={(event) => setStage(event.target.value as Stage)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
              {stages.map((item) => (
                <option key={item} value={item}>
                  {stageLabels[item]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            Tank size / water litres
            <input value={litres} min={1} max={500} type="number" onChange={(event) => setLitres(Number(event.target.value))} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
          </label>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Experience
              <select value={experience} onChange={(event) => setExperience(event.target.value as Experience)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {experiences.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Medium
              <select value={medium} onChange={(event) => setMedium(event.target.value as Medium)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {mediums.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Grow mode
              <select value={mode} onChange={(event) => setMode(event.target.value as GrowMode)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {modes.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Runoff trend
              <select value={runoffTrend} onChange={(event) => setRunoffTrend(event.target.value as RunoffTrend)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {runoffTrends.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Plant stress
              <select value={stressLevel} onChange={(event) => setStressLevel(event.target.value as StressLevel)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {stressLevels.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save feed to journal</button>
            <button className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Repeat previous feed</button>
          </div>
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Adaptive Catalyx Feed</p>
            <h2 className="mt-2 text-2xl font-black text-white">{stageLabels[stage]} recommendation</h2>
          </div>
          <StatusPill tone={aggressive ? 'amber' : 'lime'}>{plan.adjustmentLabel} adaptive adjustment</StatusPill>
        </div>
        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
          <div className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Target EC</p>
            <p className="mt-1 font-black text-white">{plan.targetEc[0]}-{plan.targetEc[1]}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Target pH</p>
            <p className="mt-1 font-black text-white">{plan.targetPh[0]}-{plan.targetPh[1]}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-3">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Total dose</p>
            <p className="mt-1 font-black text-white">{plan.totalMl} ml</p>
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {plan.items.map((item) => (
            <div key={item.product.id} className="grid gap-3 rounded-lg border border-white/10 bg-black/30 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <ProductAccent product={item.product} compact />
              <div className="text-right">
                <p className="text-2xl font-black text-white">{item.totalMl} ml</p>
                <p className="text-xs text-zinc-500">{item.adaptiveMlPerL} ml/L</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 rounded-md border border-[#33d9ff]/30 bg-[#33d9ff]/10 p-4 text-sm leading-6 text-zinc-300">
          {plan.warnings[0] ?? plan.instructions.join(' ')}
        </div>
      </Panel>
    </div>
  )
}
