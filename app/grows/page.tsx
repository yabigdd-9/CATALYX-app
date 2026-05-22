'use client'

import { FormEvent, useMemo, useState } from 'react'
import {
  activeGrow,
  defaultOnboardingSetup,
  mediumLabels,
  mediumOrder,
  modes,
  stageLabels,
  stageOrder,
  type GrowMode,
  type Medium,
  type OnboardingSetup,
  type Stage,
  type TrackedGrow,
} from '@/lib/catalyx'
import { EmptyState, PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, readLocalObject, storageKeys, writeLocalList } from '@/lib/persistence'

type GrowForm = Omit<TrackedGrow, 'id' | 'createdAt'>

function createBlankForm(setup: OnboardingSetup): GrowForm {
  return {
    name: '',
    strain: '',
    startDate: new Date().toISOString().slice(0, 10),
    stage: setup.stage,
    medium: setup.medium,
    lightSchedule: '18 / 6',
    goal: setup.mode,
    feedingStyle: setup.feedingStyle,
    environmentNotes: setup.environment,
    healthStatus: 'Stable',
    notes: '',
  }
}

function createId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `grow-${Date.now()}`
}

export default function GrowsPage() {
  const [setup] = useState<OnboardingSetup>(() => readLocalObject<OnboardingSetup>(storageKeys.onboarding, defaultOnboardingSetup))
  const [grows, setGrows] = useState<TrackedGrow[]>(() => readLocalList<TrackedGrow>(storageKeys.grows))
  const [form, setForm] = useState<GrowForm>(() => createBlankForm(setup))
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saved' | 'error'>('idle')

  const fallbackGrow: TrackedGrow = useMemo(
    () => ({
      id: activeGrow.id,
      name: activeGrow.name,
      strain: activeGrow.strain,
      startDate: activeGrow.startDate,
      stage: setup.stage,
      medium: setup.medium,
      lightSchedule: activeGrow.lightSchedule,
      goal: setup.mode,
      feedingStyle: `${setup.feedingStyle} / ${setup.delivery}`,
      environmentNotes: setup.environment,
      healthStatus: activeGrow.healthStatus,
      notes: `Saved onboarding profile. Environment difficulty: ${setup.environment}.`,
      createdAt: setup.configuredAt ?? activeGrow.startDate,
    }),
    [setup],
  )
  const currentGrow = grows[0] ?? fallbackGrow
  const detailRows = [
    ['Strain', currentGrow.strain],
    ['Start date', currentGrow.startDate],
    ['Medium', mediumLabels[currentGrow.medium]],
    ['Light schedule', currentGrow.lightSchedule],
    ['Goal', currentGrow.goal],
    ['Feeding style', currentGrow.feedingStyle],
    ['Environment notes', currentGrow.environmentNotes],
    ['Health status', currentGrow.healthStatus],
    ['Notes', currentGrow.notes],
  ]

  function updateForm<Key extends keyof GrowForm>(key: Key, value: GrowForm[Key]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  function createGrow(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!form.name.trim() || !form.strain.trim()) {
      setSaveStatus('error')
      return
    }

    const grow: TrackedGrow = {
      ...form,
      name: form.name.trim(),
      strain: form.strain.trim(),
      id: createId(),
      createdAt: new Date().toISOString(),
    }
    const nextGrows = [grow, ...grows].slice(0, 12)
    setGrows(nextGrows)
    writeLocalList(storageKeys.grows, nextGrows)
    setForm(createBlankForm(setup))
    setSaveStatus('saved')
  }

  return (
    <ShellSection>
      <PageHeader title="Grow tracker" copy="Track grows, plants, tents, rooms, stages, mediums, light schedules, goals, feeding style, environment notes, health status, and journal notes." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Add grow</h2>
          <form onSubmit={createGrow} className="mt-4 grid gap-3">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Grow name
              <input value={form.name} onChange={(event) => updateForm('name', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Run Alpha" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Strain name
              <input value={form.strain} onChange={(event) => updateForm('strain', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Cultivar or plant label" />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Start date
                <input value={form.startDate} type="date" onChange={(event) => updateForm('startDate', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Light schedule
                <input value={form.lightSchedule} onChange={(event) => updateForm('lightSchedule', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="18 / 6" />
              </label>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Stage
                <select value={form.stage} onChange={(event) => updateForm('stage', event.target.value as Stage)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  {stageOrder.map((stage) => (
                    <option key={stage} value={stage}>{stageLabels[stage]}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Medium
                <select value={form.medium} onChange={(event) => updateForm('medium', event.target.value as Medium)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  {mediumOrder.map((medium) => (
                    <option key={medium} value={medium}>{mediumLabels[medium]}</option>
                  ))}
                </select>
              </label>
            </div>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Grow goal
              <select value={form.goal} onChange={(event) => updateForm('goal', event.target.value as GrowMode)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {modes.map((mode) => (
                  <option key={mode} value={mode}>{mode}</option>
                ))}
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Feeding style
              <input value={form.feedingStyle} onChange={(event) => updateForm('feedingStyle', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="safe, standard, aggressive, automated" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Environment notes
              <input value={form.environmentNotes} onChange={(event) => updateForm('environmentNotes', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="temperature, humidity, room notes" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Health status
              <input value={form.healthStatus} onChange={(event) => updateForm('healthStatus', event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Stable" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Notes
              <textarea value={form.notes} onChange={(event) => updateForm('notes', event.target.value)} className="min-h-24 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Current observations, room context, or target outcome" />
            </label>
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Create grow</button>
            {saveStatus === 'saved' ? <p className="text-sm font-semibold text-[#d9ff34]">Grow saved locally and set as active.</p> : null}
            {saveStatus === 'error' ? <p className="text-sm font-semibold text-[#ff8b92]">Add a grow name and strain before saving.</p> : null}
          </form>
        </Panel>
        <Panel className="p-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active grow</p>
              <h2 className="mt-2 text-3xl font-black">{currentGrow.name}</h2>
              <p className="mt-2 text-zinc-400">{currentGrow.strain} / {mediumLabels[currentGrow.medium]}</p>
            </div>
            <StatusPill tone="lime">{stageLabels[currentGrow.stage]}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {detailRows.map(([label, value]) => (
              <div key={label} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <p className="mt-2 font-bold text-white">{value}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="mt-6">
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Saved grows</h2>
            <StatusPill tone={grows.length ? 'blue' : 'amber'}>{grows.length} saved</StatusPill>
          </div>
          {grows.length ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {grows.map((grow) => (
                <button
                  key={grow.id}
                  onClick={() => {
                    const nextGrows = [grow, ...grows.filter((item) => item.id !== grow.id)]
                    setGrows(nextGrows)
                    writeLocalList(storageKeys.grows, nextGrows)
                  }}
                  className="rounded-md border border-white/10 bg-black/30 p-4 text-left transition hover:border-[#c8f500]/50"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white">{grow.name}</p>
                      <p className="mt-1 text-sm text-zinc-500">{grow.strain} / {mediumLabels[grow.medium]}</p>
                    </div>
                    <StatusPill tone="lime">{stageLabels[grow.stage]}</StatusPill>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-zinc-400">{grow.healthStatus}</p>
                </button>
              ))}
            </div>
          ) : (
            <div className="mt-4">
              <EmptyState title="No custom grows saved yet" body="Create a grow to replace the seeded active profile with your own room, stage, medium, goal, and notes." />
            </div>
          )}
        </Panel>
      </div>
    </ShellSection>
  )
}
