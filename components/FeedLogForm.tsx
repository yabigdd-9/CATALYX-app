'use client'

import { useMemo, useState } from 'react'
import { calculateFeed, feedLogs, stageLabels, type Experience, type GrowMode, type Medium, type Stage } from '@/lib/catalyx'
import { EmptyState, Panel, ProductAccent, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import ProFeedAdvisor from '@/components/ProFeedAdvisor'
import { saveFeedLogToSupabase } from '@/lib/supabase-services'

type SavedFeedLog = {
  date: string
  litres: number
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
}

function readLogs(): SavedFeedLog[] {
  return readLocalList<SavedFeedLog>(storageKeys.feedLogs)
}

export default function FeedLogForm() {
  const last = feedLogs[feedLogs.length - 1]
  const [stage, setStage] = useState<Stage>('mid-flower')
  const [medium, setMedium] = useState<Medium>('coco')
  const [experience, setExperience] = useState<Experience>('standard')
  const [mode, setMode] = useState<GrowMode>('Quality Mode')
  const [litres, setLitres] = useState(last.litres)
  const [ec, setEc] = useState(last.ec)
  const [ph, setPh] = useState(last.ph)
  const [runoffEc, setRunoffEc] = useState(last.runoffEc)
  const [runoffPh, setRunoffPh] = useState(last.runoffPh)
  const [response, setResponse] = useState(last.response)
  const [saved, setSaved] = useState<SavedFeedLog[]>([])
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState<string | undefined>()

  const feed = useMemo(() => calculateFeed(stage, litres, experience, mode, medium), [experience, litres, medium, mode, stage])
  const warnings = [
    ph < 5.5 || ph > 6.5 ? 'pH is outside the usual target band. Correct before feeding.' : null,
    runoffEc - ec > 0.35 ? 'Runoff EC is elevated above input EC. Consider holding or reducing strength.' : null,
    ec > 2.2 && experience !== 'professional' ? 'Feed strength looks aggressive for non-professional mode.' : null,
  ].filter(Boolean)

  async function saveLog() {
    setSaveStatus('saving')
    setSaveMessage(undefined)
    const next = {
      date: new Date().toLocaleDateString(),
      litres,
      ec,
      ph,
      runoffEc,
      runoffPh,
      response,
    }
    const previousLogs = readLogs()
    const productAmounts = Object.fromEntries(feed.map((item) => [item.product.name, item.totalMl]))
    const result = await saveFeedLogToSupabase({ litres, ec, ph, runoffEc, runoffPh, response, productAmounts })

    const logs = [next, ...previousLogs].slice(0, 12)
    writeLocalList(storageKeys.feedLogs, logs)
    setSaved(logs)
    setSaveStatus(result.ok ? 'saved' : 'error')
    setSaveMessage(result.message)
  }

  function repeatPrevious() {
    setLitres(last.litres)
    setEc(last.ec)
    setPh(last.ph)
    setRunoffEc(last.runoffEc)
    setRunoffPh(last.runoffPh)
    setResponse(last.response)
  }

  function applyPreset(preset: 'stable' | 'light' | 'recovery') {
    if (preset === 'stable') {
      repeatPrevious()
      setResponse('Stable posture')
      return
    }

    if (preset === 'light') {
      setEc(Number(Math.max(0.4, ec - 0.2).toFixed(1)))
      setRunoffEc(Number(Math.max(0.4, runoffEc - 0.15).toFixed(2)))
      setResponse('Slight tip brightness')
      return
    }

    setMode('Recovery Mode')
    setEc(Number(Math.max(0.4, ec - 0.35).toFixed(1)))
    setResponse('Recovery improving')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.92fr_1.08fr]">
      <Panel className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Fast feed logging</p>
            <h2 className="mt-2 text-3xl font-black">Record the feed in one pass.</h2>
          </div>
          <StatusPill tone={warnings.length ? 'amber' : 'lime'}>{warnings.length ? 'Review values' : 'Stable range'}</StatusPill>
        </div>
        <div className="mt-5 grid gap-4">
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              ['stable', 'Repeat stable feed', 'Use last values'],
              ['light', 'Reduce slightly', '-0.2 EC'],
              ['recovery', 'Recovery feed', 'Safer mode'],
            ].map(([preset, label, helper]) => (
              <button
                key={preset}
                onClick={() => applyPreset(preset as 'stable' | 'light' | 'recovery')}
                className="rounded-md border border-white/10 bg-black/30 p-3 text-left transition hover:border-[#c8f500]/50"
              >
                <span className="block text-sm font-black text-white">{label}</span>
                <span className="mt-1 block text-xs text-zinc-500">{helper}</span>
              </button>
            ))}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Select label="Stage" value={stage} options={Object.keys(stageLabels)} setValue={(value) => setStage(value as Stage)} />
            <Select label="Medium" value={medium} options={['hydro', 'coco', 'soil']} setValue={(value) => setMedium(value as Medium)} />
            <Select label="Experience" value={experience} options={['beginner', 'standard', 'professional']} setValue={(value) => setExperience(value as Experience)} />
            <Select label="Mode" value={mode} options={['Beginner Mode', 'Quality Mode', 'Professional Cultivation Mode', 'Recovery Mode']} setValue={(value) => setMode(value as GrowMode)} />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <NumberInput label="Water litres" value={litres} setValue={setLitres} step={1} />
            <NumberInput label="Input EC" value={ec} setValue={setEc} step={0.1} />
            <NumberInput label="Input pH" value={ph} setValue={setPh} step={0.1} />
            <NumberInput label="Runoff EC" value={runoffEc} setValue={setRunoffEc} step={0.1} />
            <NumberInput label="Runoff pH" value={runoffPh} setValue={setRunoffPh} step={0.1} />
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Plant response
              <select value={response} onChange={(event) => setResponse(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {['Stable posture', 'Good flower swell', 'Slight tip brightness', 'Droop after feed', 'Recovery improving'].map((option) => (
                  <option key={option}>{option}</option>
                ))}
              </select>
            </label>
          </div>
          <textarea className="min-h-28 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Notes: runoff amount, environment, visible response, photo context" />
          <div className="grid gap-3 sm:grid-cols-2">
            <button onClick={saveLog} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save feed log</button>
            <button onClick={repeatPrevious} className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Autofill previous</button>
          </div>
          <SaveBanner status={saveStatus} message={saveMessage} />
        </div>
      </Panel>

      <Panel className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Live feed read</p>
            <h2 className="mt-2 text-2xl font-black">Products and safety</h2>
          </div>
          <StatusPill tone={warnings.length ? 'amber' : 'lime'}>{warnings.length ? `${warnings.length} warning` : 'Clear'}</StatusPill>
        </div>
        <div className="mt-4 grid gap-3">
          {feed.map((item) => (
            <div key={item.product.id} className="grid gap-3 rounded-md border border-white/10 bg-black/30 p-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <ProductAccent product={item.product} compact />
              <div className="text-right">
                <p className="text-xl font-black">{item.totalMl} ml</p>
                <p className="text-xs text-zinc-500">{item.mlPerL} ml/L</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 grid gap-2">
          {(warnings.length ? warnings : ['Values look stable. Maintain this feed strength unless the next check-in shows stress.']).map((warning) => (
            <div key={warning} className={`rounded-md border p-3 text-sm leading-6 ${warnings.length ? 'border-[#ff8a1f]/30 bg-[#ff8a1f]/10 text-zinc-300' : 'border-[#c8f500]/30 bg-[#c8f500]/10 text-zinc-300'}`}>
              {warning}
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ProFeedAdvisor stage={stage} medium={medium} ec={ec} ph={ph} runoffEc={runoffEc} runoffPh={runoffPh} response={response} />
        </div>
        {saved.length ? (
          <div className="mt-5">
            <h3 className="font-black">Saved this session</h3>
            <div className="mt-3 grid gap-2">
              {saved.slice(0, 3).map((log, index) => (
                <div key={`${log.date}-${index}`} className="rounded-md border border-white/10 bg-black/30 p-3 text-sm text-zinc-400">
                  {log.date}: {log.litres} L / EC {log.ec} / pH {log.ph} / runoff EC {log.runoffEc}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5">
            <EmptyState title="No saved feed logs this session" body="Save your next feed and Catalyx will use it to improve confidence, runoff trend detection, and next-feed guidance." />
          </div>
        )}
      </Panel>
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#050707]/95 p-3 backdrop-blur md:hidden">
        <button onClick={saveLog} className="w-full rounded-md bg-[#c8f500] px-4 py-4 text-sm font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/20">
          Save feed log
        </button>
      </div>
    </div>
  )
}

function Select({
  label,
  value,
  options,
  setValue,
}: {
  label: string
  value: string
  options: string[]
  setValue: (value: string) => void
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <select value={value} onChange={(event) => setValue(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
        {options.map((option) => (
          <option key={option} value={option}>
            {stageLabels[option as Stage] ?? option}
          </option>
        ))}
      </select>
    </label>
  )
}

function NumberInput({
  label,
  value,
  setValue,
  step,
}: {
  label: string
  value: number
  setValue: (value: number) => void
  step: number
}) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-zinc-300">
      {label}
      <input value={value} step={step} type="number" onChange={(event) => setValue(Number(event.target.value))} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
    </label>
  )
}
