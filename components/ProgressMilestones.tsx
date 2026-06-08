'use client'

import { useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import type { AppReminder, DailyCheckIn, GrowPhoto } from '@/lib/catalyx'
import { buildProgressBadges, progressSummary } from '@/lib/gamification'
import { getCxRewardSnapshot } from '@/lib/rewards'
import type { IntelligenceEnvironmentLog, IntelligenceFeedLog } from '@/lib/pro-insights'
import { readLocalList, storageKeys } from '@/lib/persistence'
import { loadCurrentUserProductOrders, loadDailyCheckInsFromSupabase, loadEnvironmentLogsFromSupabase, loadFeedLogsFromSupabase, loadPhotosFromSupabase } from '@/lib/supabase-services'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function ProgressMilestones({ className = '' }: { className?: string }) {
  const { user } = useAuth()
  const [feedLogs, setFeedLogs] = useState<IntelligenceFeedLog[]>(() => readLocalList<IntelligenceFeedLog>(storageKeys.feedLogs))
  const [checkIns, setCheckIns] = useState<DailyCheckIn[]>(() => readLocalList<DailyCheckIn>(storageKeys.dailyCheckIns))
  const [environmentLogs, setEnvironmentLogs] = useState<IntelligenceEnvironmentLog[]>(() => readLocalList<IntelligenceEnvironmentLog>(storageKeys.environmentLogs))
  const [reminders] = useState<AppReminder[]>(() => readLocalList<AppReminder>(storageKeys.reminders))
  const [photos, setPhotos] = useState<GrowPhoto[]>(() => readLocalList<GrowPhoto>(storageKeys.photos))
  const [orderCount, setOrderCount] = useState(0)

  useEffect(() => {
    let alive = true
    Promise.all([
      loadFeedLogsFromSupabase().catch(() => []),
      loadDailyCheckInsFromSupabase().catch(() => []),
      loadEnvironmentLogsFromSupabase().catch(() => []),
      loadPhotosFromSupabase().catch(() => []),
      loadCurrentUserProductOrders().catch(() => []),
    ]).then(([remoteFeeds, remoteChecks, remoteEnvironment, remotePhotos, remoteOrders]) => {
      if (!alive) return
      if (remoteFeeds.length) setFeedLogs(remoteFeeds)
      if (remoteChecks.length) setCheckIns(remoteChecks)
      if (remoteEnvironment.length) setEnvironmentLogs(remoteEnvironment)
      if (remotePhotos.length) setPhotos(remotePhotos)
      if (remoteOrders.length) setOrderCount(remoteOrders.length)
    })
    return () => {
      alive = false
    }
  }, [])

  const badges = useMemo(() => buildProgressBadges({ feedLogs, checkIns, environmentLogs, reminders, photos }), [feedLogs, checkIns, environmentLogs, reminders, photos])
  const summary = useMemo(() => progressSummary(badges), [badges])
  const rewardsSnapshot = useMemo(
    () => getCxRewardSnapshot({ userId: user?.id ?? 'guest', plan: user?.plan }),
    [user?.id, user?.plan]
  )
  const firstWeekLifecycle = [
    { id: 'account', title: 'Account created', done: Boolean(user?.id || user?.email), detail: 'Start with a real identity so progress and wallet credit stick.' },
    { id: 'checkin', title: 'First check-in', done: checkIns.length > 0, detail: 'Open the habit loop and trigger daily CX progression.' },
    { id: 'feed', title: 'First feed log', done: feedLogs.length > 0, detail: 'Anchor actual product usage against the grow timeline.' },
    { id: 'photo', title: 'First photo', done: photos.length > 0, detail: 'Create visual proof and before/after momentum.' },
    {
      id: 'reward',
      title: 'First reward claim',
      done: rewardsSnapshot.recentLedger.some((entry) => entry.source === 'reward_redemption' && entry.pointsDelta < 0),
      detail: 'Convert engagement into a felt reward before interest drops.',
    },
    { id: 'store', title: 'First store action', done: orderCount > 0, detail: 'Close the loop from activity to reorder revenue.' },
  ]
  const firstWeekCompleted = firstWeekLifecycle.filter((step) => step.done).length

  return (
    <Panel className={`p-5 ${className}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Progress system</p>
          <h2 className="mt-2 text-2xl font-black text-white">Cultivation milestones</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-400">Premium progress signals reward disciplined logging, stable runoff, healthy check-ins, and complete grow evidence.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="lime">{summary.earned} earned</StatusPill>
          <StatusPill tone="blue">{summary.score}/100 progress</StatusPill>
          <StatusPill tone="amber">{firstWeekCompleted}/6 first-week actions</StatusPill>
        </div>
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {firstWeekLifecycle.map((step, index) => (
          <div key={step.id} className={`rounded-md border p-4 ${step.done ? 'border-[#c8f500]/30 bg-[#c8f500]/10' : 'border-white/10 bg-black/30'}`}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-[0.14em] text-zinc-500">Step {index + 1}</p>
                <p className="mt-2 font-black text-white">{step.title}</p>
              </div>
              <StatusPill tone={step.done ? 'lime' : 'amber'}>{step.done ? 'Done' : 'Next'}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{step.detail}</p>
          </div>
        ))}
      </div>
      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {badges.map((badge) => {
          const percent = Math.min(100, Math.round((badge.progress / badge.target) * 100))
          return (
            <div key={badge.id} className="rounded-md border border-white/10 bg-black/30 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{badge.title}</p>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{badge.body}</p>
                </div>
                <StatusPill tone={badge.status === 'earned' ? 'lime' : badge.status === 'in-progress' ? 'blue' : 'amber'}>
                  {badge.status === 'earned' ? 'Earned' : badge.status === 'in-progress' ? 'Active' : 'Locked'}
                </StatusPill>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-[#c8f500]" style={{ width: `${percent}%` }} />
              </div>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.14em] text-zinc-500">{badge.progress}/{badge.target}</p>
            </div>
          )
        })}
      </div>
    </Panel>
  )
}
