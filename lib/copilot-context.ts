import { defaultOnboardingSetup } from '@/lib/catalyx'
import { readLocalList, readLocalObject, storageKeys } from '@/lib/persistence'
import type { CopilotContext } from '@/lib/ai-copilot'
import {
  loadActiveGrowFromSupabase,
  loadDailyCheckInsFromSupabase,
  loadEnvironmentLogsFromSupabase,
  loadFeedLogsFromSupabase,
  loadJournalEntriesFromSupabase,
} from '@/lib/supabase-services'

export type CopilotContextOptions = Pick<CopilotContext, 'question' | 'conversationHistory' | 'proDepth'>

export type CopilotContextResult = {
  context: CopilotContext
  evidenceLabel: 'Supabase context' | 'Local context'
}

export async function buildCopilotContext(options: CopilotContextOptions = {}): Promise<CopilotContextResult> {
  const localFeedLogs = readLocalList<Record<string, unknown>>(storageKeys.feedLogs)
  const localEnvironmentLogs = readLocalList<Record<string, unknown>>(storageKeys.environmentLogs)
  const localDailyCheckIns = readLocalList<Record<string, unknown>>(storageKeys.dailyCheckIns)
  const localJournalEntries = readLocalList<Record<string, unknown>>(storageKeys.journalEntries)

  const [remoteGrow, remoteFeedLogs, remoteEnvironmentLogs, remoteDailyCheckIns, remoteJournalEntries] = await Promise.all([
    loadActiveGrowFromSupabase().catch(() => null),
    loadFeedLogsFromSupabase().catch(() => []),
    loadEnvironmentLogsFromSupabase().catch(() => []),
    loadDailyCheckInsFromSupabase().catch(() => []),
    loadJournalEntriesFromSupabase().catch(() => []),
  ])

  const feedLogs = remoteFeedLogs.length ? remoteFeedLogs : localFeedLogs
  const environmentLogs = remoteEnvironmentLogs.length ? remoteEnvironmentLogs : localEnvironmentLogs
  const dailyCheckIns = remoteDailyCheckIns.length ? remoteDailyCheckIns : localDailyCheckIns
  const journalEntries = remoteJournalEntries.length ? remoteJournalEntries : localJournalEntries
  const sourceSummary = {
    grow: remoteGrow ? 'supabase' : 'local',
    feedLogs: remoteFeedLogs.length ? 'supabase' : localFeedLogs.length ? 'local' : 'none',
    environmentLogs: remoteEnvironmentLogs.length ? 'supabase' : localEnvironmentLogs.length ? 'local' : 'none',
    dailyCheckIns: remoteDailyCheckIns.length ? 'supabase' : localDailyCheckIns.length ? 'local' : 'none',
    journalEntries: remoteJournalEntries.length ? 'supabase' : localJournalEntries.length ? 'local' : 'none',
  } satisfies NonNullable<CopilotContext['sourceSummary']>

  return {
    context: {
      ...options,
      onboarding: readLocalObject(storageKeys.onboarding, defaultOnboardingSetup),
      grow: remoteGrow ?? undefined,
      feedLogs,
      environmentLogs,
      dailyCheckIns,
      journalEntries,
      reminders: readLocalList(storageKeys.reminders),
      sourceSummary,
    },
    evidenceLabel: Object.values(sourceSummary).includes('supabase') ? 'Supabase context' : 'Local context',
  }
}
