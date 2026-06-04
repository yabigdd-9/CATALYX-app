'use client'

import { useEffect, useMemo, useState } from 'react'
import { feedLogs as seedFeedLogs } from '@/lib/catalyx'
import { readLocalList, storageKeys } from '@/lib/persistence'
import {
  calculateLiveScores,
  generateCompareRows,
  generateOutcomeForecast,
  generateRecoveryPlan,
  generateWeeklyReview,
  type IntelligenceEnvironmentLog,
  type IntelligenceFeedLog,
} from '@/lib/pro-insights'
import { loadEnvironmentLogsFromSupabase, loadFeedLogsFromSupabase } from '@/lib/supabase-services'
import { MetricCard, Panel, StatusPill } from '@/components/catalyx-ui'
import TrendChart from '@/components/TrendChart'

type Variant = 'weekly-review' | 'forecast' | 'recovery' | 'compare' | 'analytics'

export default function LiveProInsights({ variant }: { variant: Variant }) {
  const [feedLogs, setFeedLogs] = useState<IntelligenceFeedLog[]>(seedFeedLogs)
  const [environmentLogs, setEnvironmentLogs] = useState<IntelligenceEnvironmentLog[]>([])
  const [source, setSource] = useState<'supabase' | 'local' | 'seed'>('seed')

  useEffect(() => {
    let alive = true
    async function load() {
      const localFeedLogs = readLocalList<IntelligenceFeedLog>(storageKeys.feedLogs)
      const localEnvironmentLogs = readLocalList<IntelligenceEnvironmentLog>(storageKeys.environmentLogs)
      const [remoteFeedLogs, remoteEnvironmentLogs] = await Promise.all([
        loadFeedLogsFromSupabase().catch(() => []),
        loadEnvironmentLogsFromSupabase().catch(() => []),
      ])
      if (!alive) return
      setFeedLogs(remoteFeedLogs.length ? remoteFeedLogs : localFeedLogs.length ? localFeedLogs : seedFeedLogs)
      setEnvironmentLogs(remoteEnvironmentLogs.length ? remoteEnvironmentLogs : localEnvironmentLogs)
      setSource(remoteFeedLogs.length || remoteEnvironmentLogs.length ? 'supabase' : localFeedLogs.length || localEnvironmentLogs.length ? 'local' : 'seed')
    }
    load()
    return () => {
      alive = false
    }
  }, [])

  const weekly = useMemo(() => generateWeeklyReview({ feedLogs, environmentLogs }), [feedLogs, environmentLogs])
  const recovery = useMemo(() => generateRecoveryPlan({ feedLogs, environmentLogs }), [feedLogs, environmentLogs])
  const forecast = useMemo(() => generateOutcomeForecast({ feedLogs, environmentLogs }), [feedLogs, environmentLogs])
  const compareRows = useMemo(() => generateCompareRows({ feedLogs, environmentLogs }), [feedLogs, environmentLogs])
  const scores = useMemo(() => calculateLiveScores({ feedLogs, environmentLogs }), [feedLogs, environmentLogs])
  const sourceLabel = source === 'supabase' ? 'Supabase evidence' : source === 'local' ? 'Local saved evidence' : 'Seed fallback'

  if (variant === 'weekly-review') {
    return (
      <>
        <div className="mt-6 grid gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          <MetricCard label={`Week of ${weekly.week}`} value={weekly.growScore} note={weekly.direction} />
          <Panel className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <StatusPill tone="lime">Professional report</StatusPill>
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{sourceLabel}</p>
            </div>
            <h2 className="mt-4 text-3xl font-black text-white">{weekly.headline}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-400">Generated from {feedLogs.length} feed logs and {environmentLogs.length} environment logs.</p>
          </Panel>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          <ReviewColumn title="Strengths" items={weekly.strengths} tone="lime" />
          <ReviewColumn title="Issues to watch" items={weekly.issues} tone="amber" />
          <ReviewColumn title="Next-week plan" items={weekly.nextWeek} tone="blue" />
        </div>
      </>
    )
  }

  if (variant === 'recovery') {
    const radar = [
      ['Runoff EC trend', scores.runoffTrend, scores.runoffTrend === 'rising' ? 'amber' : 'lime', scores.runoffTrend === 'rising' ? 'Recent logs suggest salt-load pressure.' : 'Recent runoff trend is not climbing sharply.'],
      ['pH range', scores.avgPh ? String(scores.avgPh) : 'Limited', scores.avgPh && (scores.avgPh < 5.6 || scores.avgPh > 6.4) ? 'amber' : 'lime', 'Input pH affects nutrient availability and diagnosis confidence.'],
      ['Environment', String(scores.environment), scores.environment >= 82 ? 'lime' : 'amber', 'VPD and water temperature influence plant response.'],
      ['Root zone', String(scores.rootZone), scores.rootZone >= 82 ? 'lime' : 'amber', 'Root-zone score combines runoff and water-temperature risk.'],
    ] as const
    return (
      <>
        <Panel className="mt-6 overflow-hidden border-[#ffd23f]/25">
          <div className="grid gap-6 p-5 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <StatusPill tone={recovery.status === 'Stable' ? 'lime' : 'amber'}>{recovery.status}</StatusPill>
              <h2 className="mt-4 text-3xl font-black text-white">{recovery.trigger}</h2>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{recovery.goal}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {radar.map(([label, status, tone, body]) => (
                <RadarCard key={label} label={label} status={status} tone={tone} body={body} />
              ))}
            </div>
          </div>
        </Panel>
        <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <ListPanel title="48-hour recovery checklist" items={recovery.checklist.map(([title, body]) => `${title}: ${body}`)} />
          <ListPanel title="Avoid" items={recovery.avoid} tone="red" />
        </div>
      </>
    )
  }

  if (variant === 'forecast') {
    return (
      <>
        <div className="mt-6 grid gap-4 md:grid-cols-5">
          {forecast.map(([label, status, body]) => (
            <Panel key={label} className="p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{label}</p>
                <StatusPill tone={status === 'Low' || status === 'Strong' || status === 'Stable' ? 'lime' : status === 'Moderate' || status === 'Watch' || status === 'Elevated' ? 'amber' : 'blue'}>{status}</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">{body}</p>
            </Panel>
          ))}
        </div>
        <Panel className="mt-6 p-5">
          <h2 className="text-2xl font-black">Dose Change Simulator</h2>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {[
              ['Current plan', 'Maintain current feed', `Feed stability is ${scores.feedStability}/100.`],
              ['If runoff rises again', 'Reduce strength by 10%', 'Lower salt pressure before adding bloom intensity.'],
              ['If runoff stabilises twice', '+0.1 EC maximum', 'Only increase after two matching stable readings.'],
            ].map(([scenario, dose, why]) => <ScenarioCard key={scenario} scenario={scenario} dose={dose} why={why} />)}
          </div>
        </Panel>
      </>
    )
  }

  if (variant === 'compare') {
    return (
      <Panel className="mt-6 overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
          <div>
            <StatusPill tone="lime">{sourceLabel}</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Current run benchmark from saved evidence</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-zinc-400">Comparison uses current calculated scores against a conservative previous-week baseline until historical grows are available.</p>
        </div>
        <CompareTable rows={compareRows} />
      </Panel>
    )
  }

  return (
    <>
      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {[
          ['Grow Score', scores.growScore, 'Calculated from live evidence', '#c8f500'],
          ['Feed Stability', scores.feedStability, `Runoff trend: ${scores.runoffTrend}`, '#ff8a1f'],
          ['Environment', scores.environment, `${environmentLogs.length} environment logs`, '#33d9ff'],
          ['Root Zone', scores.rootZone, `Avg runoff EC ${scores.avgRunoffEc || 'limited'}`, '#16d6c8'],
        ].map(([label, value, note, accent]) => <MetricCard key={label} label={String(label)} value={Number(value)} note={String(note)} accent={String(accent)} />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {[
          ['Feed EC history', feedLogs.map((log) => Number(log.ec ?? 0)), '#c8f500', 'input EC'],
          ['pH stability', feedLogs.map((log) => Number(log.ph ?? 0)), '#33d9ff', '5.8-6.2 target'],
          ['Runoff EC trend', feedLogs.map((log) => Number(log.runoffEc ?? 0)), '#ff8a1f', 'watch rising trend'],
        ].map(([title, values, color, target]) => (
          <Panel key={String(title)} className="p-5">
            <TrendChart title={String(title)} values={values as number[]} color={String(color)} target={String(target)} />
          </Panel>
        ))}
      </div>
      <Panel className="mt-6 overflow-hidden">
        <div className="border-b border-white/10 p-5">
          <h2 className="text-2xl font-black">Feed log table</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-sm">
            <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
              <tr><th className="p-4">Date</th><th className="p-4">Litres</th><th className="p-4">EC</th><th className="p-4">pH</th><th className="p-4">Runoff EC</th><th className="p-4">Response</th></tr>
            </thead>
            <tbody>{feedLogs.map((log, index) => <tr key={index} className="border-t border-white/10"><td className="p-4">{String((log as { date?: unknown }).date ?? index + 1)}</td><td className="p-4">{String((log as { litres?: unknown }).litres ?? '-')}</td><td className="p-4">{String(log.ec ?? '-')}</td><td className="p-4">{String(log.ph ?? '-')}</td><td className="p-4">{String(log.runoffEc ?? '-')}</td><td className="p-4 text-zinc-400">{String(log.response ?? 'Logged feed')}</td></tr>)}</tbody>
          </table>
        </div>
      </Panel>
    </>
  )
}

function ReviewColumn({ title, items, tone }: { title: string; items: string[]; tone: 'lime' | 'amber' | 'blue' }) {
  return <ListPanel title={title} items={items} tone={tone} />
}

function ListPanel({ title, items, tone = 'blue' }: { title: string; items: string[]; tone?: 'lime' | 'amber' | 'blue' | 'red' }) {
  return (
    <Panel className="p-5">
      <StatusPill tone={tone}>{title}</StatusPill>
      <div className="mt-4 grid gap-3">
        {items.map((item) => <div key={item} className={`rounded-md border p-3 text-sm leading-6 text-zinc-300 ${tone === 'red' ? 'border-[#ff3b45]/25 bg-[#ff3b45]/10' : 'border-white/10 bg-black/30'}`}>{item}</div>)}
      </div>
    </Panel>
  )
}

function RadarCard({ label, status, tone, body }: { label: string; status: string; tone: 'lime' | 'amber'; body: string }) {
  return <div className="rounded-md border border-white/10 bg-black/30 p-4"><div className="flex items-center justify-between gap-3"><p className="font-black text-white">{label}</p><StatusPill tone={tone}>{status}</StatusPill></div><p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p></div>
}

function ScenarioCard({ scenario, dose, why }: { scenario: string; dose: string; why: string }) {
  return <div className="rounded-md border border-white/10 bg-black/30 p-4"><p className="text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">{scenario}</p><h3 className="mt-3 text-xl font-black text-white">{dose}</h3><p className="mt-3 text-sm leading-6 text-zinc-400">{why}</p></div>
}

function CompareTable({ rows }: { rows: readonly (readonly [string, string, string, string, string])[] }) {
  return <div className="overflow-x-auto"><table className="w-full min-w-[780px] text-left text-sm"><thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500"><tr><th className="p-4">Signal</th><th className="p-4">Current</th><th className="p-4">Previous</th><th className="p-4">Change</th><th className="p-4">Interpretation</th></tr></thead><tbody>{rows.map(([signal, current, previous, change, interpretation]) => <tr key={signal} className="border-t border-white/10"><td className="p-4 font-bold text-white">{signal}</td><td className="p-4 text-zinc-300">{current}</td><td className="p-4 text-zinc-400">{previous}</td><td className={`p-4 font-black ${change.startsWith('+') ? 'text-[#d9ff34]' : 'text-[#ffd23f]'}`}>{change}</td><td className="p-4 text-zinc-400">{interpretation}</td></tr>)}</tbody></table></div>
}
