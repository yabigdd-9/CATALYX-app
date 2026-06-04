import type { AppReminder, DailyCheckIn, GrowPhoto } from '@/lib/catalyx'
import type { IntelligenceEnvironmentLog, IntelligenceFeedLog } from '@/lib/pro-insights'
import { calculateLiveScores } from '@/lib/pro-insights'

export type ProgressBadge = {
  id: string
  title: string
  body: string
  status: 'earned' | 'in-progress' | 'locked'
  progress: number
  target: number
}

function uniqueLogDays(values: Array<Record<string, unknown>>) {
  return new Set(values.map((item) => {
    const value = item.date ?? item.checkedAt ?? item.capturedAt ?? item.loggedAt
    return typeof value === 'string' ? value : ''
  }).filter(Boolean).map((value) => new Date(value).toDateString())).size
}

function perfectFeedCount(feedLogs: IntelligenceFeedLog[]) {
  return feedLogs.filter((log) => {
    const ph = Number(log.ph ?? 0)
    const runoffEc = Number(log.runoffEc ?? 0)
    return ph >= 5.6 && ph <= 6.4 && runoffEc > 0 && runoffEc <= 2.4
  }).length
}

function healthyCheckInCount(checkIns: DailyCheckIn[]) {
  return checkIns.filter((item) => item.healthScore >= 82 && item.stressLevel <= 2 && item.droopLevel <= 2).length
}

export function buildProgressBadges({
  feedLogs = [],
  checkIns = [],
  environmentLogs = [],
  reminders = [],
  photos = [],
}: {
  feedLogs?: IntelligenceFeedLog[]
  checkIns?: DailyCheckIn[]
  environmentLogs?: IntelligenceEnvironmentLog[]
  reminders?: AppReminder[]
  photos?: GrowPhoto[]
}): ProgressBadge[] {
  const scores = calculateLiveScores({ feedLogs, environmentLogs })
  const logDays = uniqueLogDays([
    ...(feedLogs as Array<Record<string, unknown>>),
    ...(checkIns as Array<Record<string, unknown>>),
    ...(photos as Array<Record<string, unknown>>),
    ...(environmentLogs as Array<Record<string, unknown>>),
  ])
  const completedReminders = reminders.filter((item) => item.completed).length
  const perfectFeeds = perfectFeedCount(feedLogs)
  const healthyChecks = healthyCheckInCount(checkIns)
  const stableRunoff = feedLogs.filter((log) => Number(log.runoffEc ?? 0) > 0 && Number(log.runoffEc ?? 0) <= 2.4).length

  const badges: ProgressBadge[] = [
    {
      id: 'consistency-streak',
      title: 'Consistency Streak',
      body: 'Logged grow evidence across multiple days.',
      progress: Math.min(logDays, 7),
      target: 7,
      status: logDays >= 7 ? 'earned' : logDays >= 2 ? 'in-progress' : 'locked',
    },
    {
      id: 'perfect-feed-streak',
      title: 'Perfect Feed Streak',
      body: 'pH and runoff stayed inside the safe operating window.',
      progress: Math.min(perfectFeeds, 3),
      target: 3,
      status: perfectFeeds >= 3 ? 'earned' : perfectFeeds ? 'in-progress' : 'locked',
    },
    {
      id: 'healthy-runoff',
      title: 'Healthy Runoff',
      body: 'Runoff EC readings stayed under pressure limits.',
      progress: Math.min(stableRunoff, 3),
      target: 3,
      status: stableRunoff >= 3 ? 'earned' : stableRunoff ? 'in-progress' : 'locked',
    },
    {
      id: 'dialed-in-grow',
      title: 'Dialed-In Grow',
      body: 'Grow score, feed stability, and environment score are all strong.',
      progress: [scores.growScore, scores.feedStability, scores.environment].filter((score) => score >= 82).length,
      target: 3,
      status: scores.growScore >= 82 && scores.feedStability >= 82 && scores.environment >= 82 ? 'earned' : scores.growScore >= 72 ? 'in-progress' : 'locked',
    },
    {
      id: 'daily-read',
      title: 'Daily Read Habit',
      body: 'Fast plant reads are building reliable trend history.',
      progress: Math.min(healthyChecks || checkIns.length, 5),
      target: 5,
      status: checkIns.length >= 5 ? 'earned' : checkIns.length ? 'in-progress' : 'locked',
    },
    {
      id: 'task-discipline',
      title: 'Task Discipline',
      body: 'Completed reminders keep the routine controlled.',
      progress: Math.min(completedReminders, 5),
      target: 5,
      status: completedReminders >= 5 ? 'earned' : completedReminders ? 'in-progress' : 'locked',
    },
    {
      id: 'photo-progress',
      title: 'Photo Progression',
      body: 'Photo history is ready for visual comparison.',
      progress: Math.min(photos.length, 4),
      target: 4,
      status: photos.length >= 4 ? 'earned' : photos.length >= 2 ? 'in-progress' : 'locked',
    },
  ]

  return badges
}

export function progressSummary(badges: ProgressBadge[]) {
  const earned = badges.filter((badge) => badge.status === 'earned').length
  const inProgress = badges.filter((badge) => badge.status === 'in-progress').length
  return {
    earned,
    inProgress,
    total: badges.length,
    score: Math.round(((earned + inProgress * 0.45) / badges.length) * 100),
  }
}
