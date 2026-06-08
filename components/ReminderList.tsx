'use client'

import { useEffect, useMemo, useState } from 'react'
import { reminders as seedReminders, type AppReminder } from '@/lib/catalyx'
import { createReminder, dueReminder, formatReminderDue, showReminderNotification } from '@/lib/notifications'
import { EmptyState, Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { saveReminderToSupabase } from '@/lib/supabase-services'

const reminderTypes: Array<[AppReminder['type'], string]> = [
  ['feed', 'Feed reminder'],
  ['water', 'Water reminder'],
  ['photo', 'Photo reminder'],
  ['check-in', 'Daily check-in reminder'],
  ['environment', 'Environment log reminder'],
  ['stage', 'Stage change reminder'],
  ['flush', 'Flush reminder'],
  ['low-stock', 'Low-stock reminder'],
]

function defaultDueAt() {
  const next = new Date(Date.now() + 60 * 60 * 1000)
  next.setMinutes(0, 0, 0)
  return next.toISOString().slice(0, 16)
}

export default function ReminderList() {
  const [items, setItems] = useState<AppReminder[]>(() => {
    const stored = readLocalList<AppReminder>(storageKeys.reminders)
    return stored.length ? stored : seedReminders
  })
  const [title, setTitle] = useState('Check runoff after next feed')
  const [detail, setDetail] = useState('Confirm runoff EC and plant response before increasing feed strength.')
  const [type, setType] = useState<AppReminder['type']>('feed')
  const [dueAt, setDueAt] = useState(defaultDueAt)
  const [currentTime, setCurrentTime] = useState(() => Date.now())
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [saveMessage, setSaveMessage] = useState('Reminder saved. Supabase sync activates when configured.')
  const activeItems = useMemo(() => items.filter((item) => !item.completed), [items])

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(Date.now())
      const reminder = dueReminder(items)
      if (!reminder) return
      showReminderNotification(reminder).then((shown) => {
        if (!shown) return
        const next = items.map((item) => item.id === reminder.id ? { ...item, notifiedAt: new Date().toISOString() } : item)
        setItems(next)
        writeLocalList(storageKeys.reminders, next)
      }).catch(() => undefined)
    }, 30000)
    return () => window.clearInterval(interval)
  }, [items])

  async function addReminder() {
    if (!title.trim()) return
    setSaveStatus('saving')
    const reminder = createReminder({
      title,
      detail,
      type,
      dueAt: new Date(dueAt).toISOString(),
    })
    const next = [reminder, ...items]
    setItems(next)
    writeLocalList(storageKeys.reminders, next)
    try {
      const result = await saveReminderToSupabase({ title: reminder.title, detail: reminder.detail, type: reminder.type })
      setSaveMessage(result.message)
      setSaveStatus('saved')
    } catch {
      setSaveMessage('Reminder saved locally. Supabase sync failed and can be retried later.')
      setSaveStatus('saved')
    }
    setTitle('')
    setDetail('')
    setDueAt(defaultDueAt())
  }

  function toggle(index: number) {
    const target = items[index]
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !item.completed } : item)
    setItems(next)
    writeLocalList(storageKeys.reminders, next)
    setSaveStatus('saved')
    setSaveMessage(`${target.title} ${target.completed ? 'reopened' : 'completed'}.`)
  }

  async function notifyNow(index: number) {
    const reminder = items[index]
    const shown = await showReminderNotification(reminder).catch(() => false)
    if (!shown) {
      setSaveStatus('error')
      setSaveMessage('Enable browser notifications before sending this reminder.')
      return
    }
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, notifiedAt: new Date().toISOString() } : item)
    setItems(next)
    writeLocalList(storageKeys.reminders, next)
    setSaveStatus('saved')
    setSaveMessage('Reminder notification sent.')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <h2 className="text-2xl font-black">Create scheduled reminder</h2>
        <div className="mt-4 grid gap-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Reminder title" />
          <select value={type} onChange={(event) => setType(event.target.value as AppReminder['type'])} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
            {reminderTypes.map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <input value={dueAt} type="datetime-local" onChange={(event) => setDueAt(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
          <textarea value={detail} onChange={(event) => setDetail(event.target.value)} className="min-h-24 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="What should the grower do?" />
          <button onClick={addReminder} disabled={!title.trim()} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:opacity-50">Add reminder</button>
          <SaveBanner status={saveStatus} message={saveMessage} />
        </div>
      </Panel>
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Scheduled reminders</h2>
          <div className="flex gap-2">
            <StatusPill tone="lime">{activeItems.length} active</StatusPill>
            <StatusPill tone="blue">{items.filter((item) => item.notifiedAt).length} notified</StatusPill>
          </div>
        </div>
        {items.length ? (
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => {
              const isDue = new Date(item.dueAt).getTime() <= currentTime
              return (
                <div key={item.id ?? `${item.title}-${index}`} className="rounded-md border border-white/10 bg-black/30 p-4">
                  <button onClick={() => toggle(index)} className="w-full text-left">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <p className={`font-bold ${item.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{item.title}</p>
                      <StatusPill tone={item.completed ? 'blue' : isDue ? 'amber' : 'lime'}>
                        {item.completed ? 'Done' : isDue ? 'Due' : item.due || formatReminderDue(new Date(item.dueAt))}
                      </StatusPill>
                    </div>
                    <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">{item.type} / {item.source ?? 'local'}{item.notifiedAt ? ` / notified ${new Date(item.notifiedAt).toLocaleString()}` : ''}</p>
                  </button>
                  <button onClick={() => void notifyNow(index)} className="mt-3 rounded-md border border-[#33d9ff]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#8decff]">Notify now</button>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="mt-4">
            <EmptyState title="No reminders yet" body="Create your first feed, water, photo, check-in, stage, flush, or low-stock reminder." />
          </div>
        )}
      </Panel>
    </div>
  )
}
