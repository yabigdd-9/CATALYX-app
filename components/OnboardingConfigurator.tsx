'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import { defaultOnboardingSetup, modes, productsForStage, stageLabels, type Experience, type GrowMode, type Medium, type OnboardingSetup, type Stage } from '@/lib/catalyx'
import { Panel, ProductAccent, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalObject, storageKeys, writeLocalObject } from '@/lib/persistence'
import { saveOnboardingToSupabase } from '@/lib/supabase-services'

export default function OnboardingConfigurator() {
  const [savedSetup] = useState<OnboardingSetup>(() => readLocalObject<OnboardingSetup>(storageKeys.onboarding, defaultOnboardingSetup))
  const [medium, setMedium] = useState<Medium>(savedSetup.medium)
  const [experience, setExperience] = useState<Experience>(savedSetup.experience)
  const [stage, setStage] = useState<Stage>(savedSetup.stage)
  const [feedingStyle, setFeedingStyle] = useState<OnboardingSetup['feedingStyle']>(savedSetup.feedingStyle)
  const [delivery, setDelivery] = useState<OnboardingSetup['delivery']>(savedSetup.delivery)
  const [environment, setEnvironment] = useState<OnboardingSetup['environment']>(savedSetup.environment)
  const [mode, setMode] = useState<GrowMode>(savedSetup.mode)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const recommended = useMemo(() => productsForStage(stage), [stage])
  const readiness = experience === 'professional' ? 92 : feedingStyle === 'aggressive' ? 74 : 86

  async function saveSetup() {
    setSaveStatus('saving')
    const payload: OnboardingSetup = {
      medium,
      experience,
      stage,
      feedingStyle,
      delivery,
      environment,
      mode,
      configuredAt: new Date().toISOString(),
    }
    writeLocalObject(storageKeys.onboarding, payload)

    try {
      await saveOnboardingToSupabase(payload)
      setSaveStatus('saved')
    } catch {
      setSaveStatus('error')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <Panel className="p-5">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f500]">Step 1 of 3</p>
          <h2 className="mt-2 text-2xl font-black text-white">Tell Catalyx how you grow.</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-500">Only the settings that change recommendations are asked here.</p>
        </div>
        <div className="grid gap-4">
          {[
            ['Grow medium', medium, ['hydro', 'coco', 'soil'], setMedium],
            ['Experience level', experience, ['beginner', 'standard', 'professional'], setExperience],
            ['Current growth stage', stage, Object.keys(stageLabels), setStage],
            ['Preferred feeding style', feedingStyle, ['safe', 'standard', 'aggressive'], setFeedingStyle],
            ['Watering method', delivery, ['hand-water', 'automated'], setDelivery],
            ['Environment difficulty', environment, ['easy', 'moderate', 'difficult'], setEnvironment],
          ].map(([label, value, options, setter]) => (
            <label key={label as string} className="grid gap-2 text-sm font-semibold text-zinc-300">
              {label as string}
              <select value={value as string} onChange={(event) => (setter as (value: string) => void)(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                {(options as string[]).map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
          ))}
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            Grow goal mode
            <select value={mode} onChange={(event) => setMode(event.target.value as GrowMode)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
              {modes.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <div className="grid gap-2 sm:grid-cols-3">
            {['Safe start', 'Balanced', 'Push performance'].map((preset) => (
              <button
                key={preset}
                onClick={() => {
                  setFeedingStyle(preset === 'Push performance' ? 'aggressive' : preset === 'Safe start' ? 'safe' : 'standard')
                  setMode(preset === 'Push performance' ? 'Yield Mode' : preset === 'Safe start' ? 'Beginner Mode' : 'Quality Mode')
                }}
                className="rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm font-bold text-zinc-300 transition hover:border-[#c8f500]/50 hover:text-white"
              >
                {preset}
              </button>
            ))}
          </div>
        </div>
      </Panel>
      <Panel className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Step 2 of 3</p>
            <h2 className="mt-2 text-3xl font-black text-white">Your setup is configured.</h2>
            <p className="mt-2 text-sm leading-6 text-zinc-400">Catalyx uses these inputs to set dose safety, reminders, dashboard mode, and product education depth.</p>
          </div>
          <StatusPill tone={experience === 'professional' ? 'blue' : 'lime'}>{mode}</StatusPill>
        </div>
        <div className="mt-5 rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-bold text-white">Configuration confidence</p>
            <p className="text-2xl font-black text-[#d9ff34]">{readiness}%</p>
          </div>
          <div className="mt-3 h-2 rounded-full bg-black/50">
            <div className="h-2 rounded-full bg-[#c8f500] shadow-[0_0_18px_rgba(200,245,0,0.45)]" style={{ width: `${readiness}%` }} />
          </div>
        </div>
        <div className="mt-5 grid gap-3">
          {recommended.map((product) => (
            <ProductAccent key={product.id} product={product} />
          ))}
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Dashboard mode</p>
            <p className="mt-2 text-lg font-bold text-white">{experience === 'professional' ? 'Professional Cultivation Mode' : 'Beginner Mode'}</p>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Education depth</p>
            <p className="mt-2 text-lg font-bold text-white">{experience === 'beginner' ? 'Guided basics' : 'Advanced tuning'}</p>
          </div>
        </div>
        <div className="mt-5 rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 p-4 text-sm leading-6 text-zinc-300">
          Reminders, feed chart, recommendations, product education, warnings, and dose safety are configured from your medium, stage, goal, environment difficulty, and feeding preference.
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button onClick={saveSetup} className="rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black">Save setup</button>
          <Link href="/products" className="rounded-md border border-white/15 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">Review products</Link>
        </div>
        <div className="mt-3">
          <SaveBanner status={saveStatus} message={saveStatus === 'saved' ? 'Onboarding saved locally. Supabase sync is ready when keys are configured.' : undefined} />
        </div>
        {saveStatus === 'saved' ? (
          <Link href="/dashboard" className="mt-3 inline-flex w-full justify-center rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#d9ff34]">
            Open dashboard
          </Link>
        ) : null}
      </Panel>
    </div>
  )
}
