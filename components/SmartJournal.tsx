'use client'

import { useEffect, useMemo, useState } from 'react'
import { checkIns, feedLogs, type JournalEntry } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { deleteJournalEntryFromSupabase, loadJournalEntriesFromSupabase, saveJournalEntryToSupabase } from '@/lib/supabase-services'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

const generatedEntries: JournalEntry[] = [
  ...feedLogs.map((log) => ({
    id: `feed-${log.date}`,
    type: 'Feed' as const,
    title: `${log.date} feed`,
    body: `${log.litres} L, EC ${log.ec}, pH ${log.ph}, runoff EC ${log.runoffEc}. Response: ${log.response}.`,
    approved: true,
    source: 'generated' as const,
  })),
  ...checkIns.map((check) => ({
    id: `check-${check.date}`,
    type: 'Check-in' as const,
    title: `${check.date} plant read`,
    body: `${check.leaf}; growth ${check.growth}; stress ${check.stress}/5; environment ${check.environment}/100.`,
    approved: true,
    source: 'generated' as const,
  })),
  {
    id: 'ai-runoff-pressure',
    type: 'AI suggestion',
    title: 'Runoff pressure is increasing',
    body: 'Runoff EC has climbed across recent feeds. Hold feed strength and confirm the next runoff value before increasing PK-X.',
    source: 'generated',
  },
  {
    id: 'ai-flower-momentum',
    type: 'AI suggestion',
    title: 'Flower momentum remains positive',
    body: 'Plant response and growth momentum remain strong while stress is low. Keep the current routine consistent unless runoff rises again.',
    source: 'generated',
  },
]

export default function SmartJournal() {
  const [entries, setEntries] = useState<JournalEntry[]>(() => {
    const saved = readLocalList<JournalEntry>(storageKeys.journalEntries)
    return saved.length ? saved : generatedEntries
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Journal changes saved locally.')
  const approvedCount = useMemo(() => entries.filter((entry) => entry.approved).length, [entries])
  const syncedCount = useMemo(() => entries.filter((entry) => entry.source === 'supabase').length, [entries])

  useEffect(() => {
    let alive = true
    async function loadRemoteEntries() {
      try {
        const remoteEntries = await loadJournalEntriesFromSupabase()
        if (!alive || !remoteEntries.length) return
        setEntries(remoteEntries)
        writeLocalList(storageKeys.journalEntries, remoteEntries)
        setMessage('Journal loaded from Supabase.')
        setStatus('saved')
      } catch {
        if (!alive) return
        setMessage('Using local journal until Supabase is ready.')
      }
    }
    loadRemoteEntries()
    return () => {
      alive = false
    }
  }, [])

  function persistLocal(next: JournalEntry[]) {
    setEntries(next)
    writeLocalList(storageKeys.journalEntries, next)
  }

  async function syncEntry(entry: JournalEntry) {
    setStatus('saving')
    try {
      const result = await saveJournalEntryToSupabase(entry)
      if (result.entry) {
        const next = entries.map((item) => (item.id === entry.id ? result.entry! : item))
        persistLocal(next)
      }
      setStatus('saved')
      setMessage(result.message)
    } catch (error) {
      setStatus('saved')
      setMessage(error instanceof Error ? `Saved locally. Supabase sync needs attention: ${error.message}` : 'Saved locally. Supabase sync needs attention.')
    }
  }

  function updateEntry(id: string, patch: Partial<JournalEntry>) {
    const next: JournalEntry[] = entries.map((entry) => (
      entry.id === id
        ? { ...entry, ...patch, source: entry.source === 'supabase' ? 'supabase' : 'local', updatedAt: new Date().toISOString() }
        : entry
    ))
    persistLocal(next)
  }

  function syncCurrent(id: string) {
    const current = entries.find((entry) => entry.id === id)
    if (current) void syncEntry(current)
  }

  function setApproved(id: string, approved: boolean) {
    const next: JournalEntry[] = entries.map((entry) => (
      entry.id === id
        ? { ...entry, approved, source: entry.source === 'supabase' ? 'supabase' : 'local', updatedAt: new Date().toISOString() }
        : entry
    ))
    persistLocal(next)
    const current = next.find((entry) => entry.id === id)
    if (current) void syncEntry(current)
  }

  async function deleteEntry(id: string) {
    const entry = entries.find((item) => item.id === id)
    const next = entries.filter((item) => item.id !== id)
    persistLocal(next)
    if (!entry) return

    setStatus('saving')
    try {
      const result = await deleteJournalEntryFromSupabase(entry)
      setStatus('saved')
      setMessage(result.message)
    } catch (error) {
      setStatus('saved')
      setMessage(error instanceof Error ? `Deleted locally. Supabase delete needs attention: ${error.message}` : 'Deleted locally. Supabase delete needs attention.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <StatusPill tone="blue">AI-assisted</StatusPill>
            <h2 className="mt-3 text-2xl font-black text-white">Journal quality</h2>
          </div>
          <StatusPill tone={syncedCount ? 'lime' : 'amber'}>{syncedCount ? `${syncedCount} synced` : `${approvedCount} approved`}</StatusPill>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-400">
          Catalyx turns feeds, check-ins, and trend signals into suggested journal notes. Approved notes now persist into Supabase when configured and remain available locally when offline.
        </p>
        <div className="mt-5 grid gap-3">
          {['Approve what matters', 'Edit the wording', 'Sync approved notes', 'Export clean history'].map((item) => (
            <div key={item} className="rounded-md border border-white/10 bg-black/30 p-3 text-sm font-semibold text-zinc-300">{item}</div>
          ))}
        </div>
        <div className="mt-4">
          <SaveBanner status={status} message={message} />
        </div>
      </Panel>

      <div className="grid gap-4">
        {entries.map((entry) => (
          <Panel key={entry.id} className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f500]">{entry.type}</p>
                <input
                  value={entry.title}
                  onChange={(event) => updateEntry(entry.id, { title: event.target.value })}
                  onBlur={() => syncCurrent(entry.id)}
                  className="mt-2 w-full border-0 bg-transparent p-0 text-xl font-black text-white outline-none"
                />
              </div>
              <StatusPill tone={entry.source === 'supabase' ? 'lime' : entry.approved ? 'blue' : 'amber'}>
                {entry.source === 'supabase' ? 'Synced' : entry.approved ? 'Approved' : 'Suggested'}
              </StatusPill>
            </div>
            <textarea
              value={entry.body}
              onChange={(event) => updateEntry(entry.id, { body: event.target.value })}
              onBlur={() => syncCurrent(entry.id)}
              className="mt-4 min-h-24 w-full rounded-md border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-zinc-300 outline-none focus:border-[#c8f500]"
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button onClick={() => setApproved(entry.id, true)} className="rounded-md bg-[#c8f500] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black">Approve</button>
              <button onClick={() => setApproved(entry.id, false)} className="rounded-md border border-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Keep suggested</button>
              <button onClick={() => void syncEntry(entry)} className="rounded-md border border-[#33d9ff]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8decff]">Sync</button>
              <button onClick={() => void deleteEntry(entry.id)} className="rounded-md border border-[#ff3b45]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#ff8b92]">Delete</button>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  )
}
