'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import { activeGrow, productsForStage, recommendationEngine, reminders, scoreBreakdown } from '@/lib/catalyx'
import { MetricCard, MiniGraph, PageHeader, Panel, PrimaryActionPanel, ProductAccent, RecommendationCard, ShellSection, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, storageKeys } from '@/lib/persistence'
import { loadFeedLogsFromSupabase } from '@/lib/supabase-services'
import SubscriptionPanel from '@/components/SubscriptionPanel'

type LocalFeedLog = {
  date: string
  litres: number
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
}

export default function DashboardPage() {
  const [savedLogs, setSavedLogs] = useState<LocalFeedLog[]>([])

  useEffect(() => {
    setSavedLogs(readLocalList<LocalFeedLog>(storageKeys.feedLogs))
    loadFeedLogsFromSupabase()
      .then((logs) => {
        if (logs.length) setSavedLogs(logs)
      })
      .catch(() => undefined)
  }, [])

  const runoffTrend = useMemo(() => {
    const recent = savedLogs.slice(0, 3).reverse()
    if (recent.length < 3) return 'rising'
    const first = recent[0].runoffEc
    const last = recent[recent.length - 1].runoffEc
    if (last - first > 0.2) return 'rising'
    if (first - last > 0.2) return 'falling'
    return 'stable'
  }, [savedLogs])

  const recommendations = recommendationEngine({ runoffTrend })
  const topRecommendation = recommendations[1]
  const primaryTitle = runoffTrend === 'rising' ? "Hold feed strength and log runoff after tonight's feed." : runoffTrend === 'stable' ? 'Maintain feed strength and keep the routine consistent.' : 'Runoff is easing. Maintain the recovery trend.'
  const primaryBody = runoffTrend === 'rising'
    ? 'Runoff EC is trending upward. The safest high-confidence move is to maintain strength, feed cleanly, and capture runoff before increasing bloom products.'
    : runoffTrend === 'stable'
      ? 'Recent feed values are stable. Catalyx recommends consistency over adjustment until the next check-in changes the signal.'
      : 'Runoff EC has moved down. Keep the current approach and avoid aggressive rebound increases.'
  const evidenceText = savedLogs.length >= 3
    ? `Saved logs: ${savedLogs.slice(0, 3).map((log) => `${log.date} runoff EC ${log.runoffEc}`).join(', ')}.`
    : 'Seeded baseline is active. Save three feed logs to increase confidence.'

  return (
    <ShellSection>
      <PageHeader title="Grow command dashboard" copy="Open the app and know the next correct action: feed, check, hold, adjust, or monitor." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <PrimaryActionPanel
          meta="Next best action"
          title={primaryTitle}
          body={primaryBody}
          href="/feed-log"
          action="Log tonight's feed"
        />
        <Panel className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Trust signal</p>
              <h2 className="mt-2 text-2xl font-black">Recommendation confidence: {topRecommendation.confidence}</h2>
            </div>
            <StatusPill tone="amber">Runoff trend</StatusPill>
          </div>
          <div className="mt-4">
            <MiniGraph color="#ff8a1f" />
          </div>
          <p className="mt-4 text-sm leading-6 text-zinc-400">{evidenceText}</p>
        </Panel>
      </div>

      <div className="mt-6">
        <SubscriptionPanel variant="summary" />
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        {scoreBreakdown.slice(0, 4).map((score, index) => (
          <MetricCard key={score.label} {...score} accent={['#c8f500', '#16d6c8', '#ff8a1f', '#33d9ff'][index]} />
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <Panel className="p-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active grow</p>
              <h2 className="mt-2 text-3xl font-black">{activeGrow.name}</h2>
              <p className="mt-2 text-zinc-400">{activeGrow.strain} / {activeGrow.medium} / {activeGrow.lightSchedule}</p>
            </div>
            <StatusPill tone="blue">{activeGrow.healthStatus}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Next feed</p>
              <div className="mt-3 grid gap-2">
                {productsForStage(activeGrow.stage).map((product) => (
                  <ProductAccent key={product.id} product={product} compact />
                ))}
              </div>
            </div>
            <div className="rounded-md border border-white/10 bg-black/30 p-4">
              <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">Weekly progress snapshot</p>
              <MiniGraph color="#c8f500" />
              <p className="mt-3 text-sm text-zinc-400">Photo progression and growth momentum are both above last week.</p>
            </div>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Today&apos;s tasks</h2>
            <StatusPill tone="lime">4 active</StatusPill>
          </div>
          <div className="mt-4 grid gap-3">
            {reminders.map((reminder) => (
              <div key={reminder.title} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex justify-between gap-3">
                  <p className="font-bold">{reminder.title}</p>
                  <span className="text-sm text-[#c8f500]">{reminder.due}</span>
                </div>
                <p className="mt-2 text-sm text-zinc-400">{reminder.detail}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-4">
        {[
          ['Log feed', '/feed-log'],
          ['Daily check-in', '/check-in'],
          ['Calculate feed', '/feed-calculator'],
          ['Manage reminders', '/reminders'],
        ].map(([label, href]) => (
          <Link key={href} href={href} className="rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 px-4 py-4 text-center text-sm font-black uppercase tracking-[0.12em] text-[#d9ff34] transition hover:bg-[#c8f500] hover:text-black">
            {label}
          </Link>
        ))}
      </div>
      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {recommendations.map((item) => (
          <RecommendationCard
            key={item.title}
            {...item}
            evidence={item.title.includes('Runoff') ? evidenceText : 'Current stage, medium, grow mode, and latest feed/check-in data.'}
          />
        ))}
      </div>
    </ShellSection>
  )
}
