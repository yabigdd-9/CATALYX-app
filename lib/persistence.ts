import { supabaseRest } from '@/lib/supabase'

export type SaveResult<T> = {
  ok: boolean
  data: T | null
  source: 'supabase' | 'local'
  error: string | null
}

export function readLocalList<T>(key: string, fallback: T[] = []): T[] {
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T[]) : fallback
  } catch {
    return fallback
  }
}

export function writeLocalList<T>(key: string, values: T[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(values))
}

export function readLocalObject<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback

  try {
    const stored = window.localStorage.getItem(key)
    return stored ? (JSON.parse(stored) as T) : fallback
  } catch {
    return fallback
  }
}

export function writeLocalObject<T>(key: string, value: T) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export async function persistRecord<T extends Record<string, unknown>>({
  table,
  localKey,
  record,
  limit = 50,
}: {
  table: string
  localKey: string
  record: T
  limit?: number
}): Promise<SaveResult<T>> {
  const existing = readLocalList<T>(localKey)
  const localValues = [record, ...existing].slice(0, limit)
  writeLocalList(localKey, localValues)

  try {
    const data = await supabaseRest<T[]>(table, {
      method: 'POST',
      body: JSON.stringify(record),
    })

    if (data) return { ok: true, data: data[0] ?? record, source: 'supabase', error: null }
  } catch (error) {
    return {
      ok: true,
      data: record,
      source: 'local',
      error: error instanceof Error ? error.message : 'Supabase save failed; saved locally.',
    }
  }

  return { ok: true, data: record, source: 'local', error: null }
}

export const storageKeys = {
  onboarding: 'catalyx-onboarding',
  grows: 'catalyx-grows',
  feedLogs: 'catalyx-feed-logs',
  reminders: 'catalyx-reminders',
  shelf: 'catalyx-shelf',
}
