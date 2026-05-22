'use client'

import { useMemo, useState } from 'react'
import {
  calculateAdaptiveFeed,
  defaultOnboardingSetup,
  modes,
  stageLabels,
  type Experience,
  type GrowMode,
  type Medium,
  type RunoffTrend,
  type Stage,
  type StressLevel,
  type TrackedGrow,
} from '@/lib/catalyx'
import { Panel, ProductAccent, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, readLocalObject, storageKeys, writeLocalList } from '@/lib/persistence'

const stages = Object.keys(stageLabels) as Stage[]
const experiences: Experience[] = ['beginner', 'standard', 'professional']
const mediums: Medium[] = ['hydro', 'coco', 'soil']
const runoffTrends: RunoffTrend[] = ['stable', 'rising', 'falling']
const stressLevels: StressLevel[] = ['low', 'moderate', 'high']

type SavedFeedLog = {
  date: string
  litres: number
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
}

export default function FeedCalculator() {
  const [savedSetup] = useState(() => readLocalObject(storageKeys.onboarding, defaultOnboardingSetup))
  const [activeSavedGrow] = useState<TrackedGrow | null>(() => readLocalList<TrackedGrow>(storageKeys.grows)[0] ?? null)
  const [stage, setStage] = useState<Stage>(activeSavedGrow?.stage ?? savedSetup.stage)
  const [litres, setLitres] = useState(20)
  const [experience, setExperience] = useState<Experience>(savedSetup.experience)
  const [medium, setMedium] = useState<Medium>(activeSavedGrow?.medium ?? savedSetup.medium)
  const [mode, setMode] = useState<GrowMode>(activeSavedGrow?.goal ?? savedSetup.mode)
  const [runoffTrend, setRunoffTrend] = useState<RunoffTrend>('stable')
  const [stressLevel, setStressLevel] = useState<StressLevel>('low')
  const [savedLogs, setSavedLogs] = useState<SavedFeedLog[]>(() => readLocalList<SavedFeedLog>(storageKeys.feedLogs))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | undefined>()

  const plan = useMemo(
    () => calculateAdaptiveFeed({ stage, litres, experience, mode, medium, runoffTrend, stressLevel }),
    [experience, litres, medium, mode, runoffTrend, stage, stressLevel],
  )
  const aggressive = plan.adjustmentPercent > 5 || plan.warnings.length > 0
  const targetEc = Number(((plan.targetEc[0] + plan.targetEc[1]) / 2).toFixed(1))
  const targetPh = Number(((plan.targetPh[0] + plan.targetPh[1]) / 2).toFixed(1))

  function saveFeedPlan() {
    setSaveStatus('saving')
    const productList = plan.items.map((item) => `${item.product.name} ${item.totalMl} ml`).join(', ')
    const plannedFeed: SavedFeedLog = {
      date: new Date().toLocaleDateString(),
      litres,
      ec: targetEc,
      ph: targetPh,
      runoffEc: targetEc,
      runoffPh: targetPh,
      response: `Planned ${stageLabels[stage]} feed: ${productList}`,
    }
    const nextLogs = [plannedFeed, ...savedLogs].slice(0, 12)
    writeLocalList(storageKeys.feedLogs, nextLogs)
    setSavedLogs(nextLogs)
    setSaveStatus('saved')
    setSaveMessage('Planned feed saved locally. Dashboard confidence and runoff trend can now use it.')
  }

  function repeatPreviousFeed() {
    const previous = savedLogs[0]
    if (!previous) {
      setSaveStatus('error')
      setSaveMessage('No saved feed is available to repeat yet.')
      return
    }

    setLitres(previous.litres)
    setSaveStatus('saved')
    setSaveMessage(`Loaded previous feed from ${previous.date}.`)
  }

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
            <button onClick={saveFeedPlan} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save feed to journal</button>
            <button onClick={repeatPreviousFeed} className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Repeat previous feed</button>
          </div>
          <SaveBanner status={saveStatus} message={saveMessage} />
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
        {savedLogs.length ? (
          <div className="mt-5 rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Latest saved feed</p>
            <p className="mt-2 text-sm leading-6 text-zinc-300">{savedLogs[0].date}: {savedLogs[0].litres} L / EC {savedLogs[0].ec} / pH {savedLogs[0].ph}</p>
          </div>
        ) : null}
      </Panel>
    </div>
  )
}
