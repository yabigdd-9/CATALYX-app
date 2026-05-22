'use client'

import { useState } from 'react'
import { reminders as seedReminders } from '@/lib/catalyx'
import { EmptyState, Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { saveReminderToSupabase } from '@/lib/supabase-services'

type Reminder = {
  title: string
  due: string
  detail: string
  completed?: boolean
}

export default function ReminderList() {
  const [items, setItems] = useState<Reminder[]>(() => {
    const stored = readLocalList<Reminder>(storageKeys.reminders)
    return stored.length ? stored : seedReminders
  })
  const [title, setTitle] = useState('Check runoff after next feed')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  async function addReminder() {
    setSaveStatus('saving')
    const reminder = { title, due: 'Today', detail: 'Core Phase 1 reminder created locally.', completed: false }
    const next = [reminder, ...items]
    setItems(next)
    writeLocalList(storageKeys.reminders, next)
    await saveReminderToSupabase({ title, detail: reminder.detail, type: 'basic' })
    writeLocalList(storageKeys.reminders, next)
    setSaveStatus('saved')
    setTitle('')
  }

  function toggle(index: number) {
    const next = items.map((item, itemIndex) => itemIndex === index ? { ...item, completed: !item.completed } : item)
    setItems(next)
    writeLocalList(storageKeys.reminders, next)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <h2 className="text-2xl font-black">Create reminder</h2>
        <div className="mt-4 grid gap-3">
          <input value={title} onChange={(event) => setTitle(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder="Reminder title" />
          <select className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
            {['Feed reminder', 'Water reminder', 'Photo reminder', 'Daily check-in reminder', 'Stage change reminder', 'Flush reminder', 'Low-stock reminder'].map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
          <button onClick={addReminder} disabled={!title.trim()} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black disabled:opacity-50">Add reminder</button>
          <SaveBanner status={saveStatus} message="Reminder saved. Supabase sync activates when configured." />
        </div>
      </Panel>
      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Basic reminders</h2>
          <StatusPill tone="lime">{items.filter((item) => !item.completed).length} active</StatusPill>
        </div>
        {items.length ? (
          <div className="mt-4 grid gap-3">
            {items.map((item, index) => (
            <button key={`${item.title}-${index}`} onClick={() => toggle(index)} className="rounded-md border border-white/10 bg-black/30 p-4 text-left transition hover:border-[#c8f500]/40">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className={`font-bold ${item.completed ? 'text-zinc-500 line-through' : 'text-white'}`}>{item.title}</p>
                <span className="text-sm font-semibold text-[#c8f500]">{item.due}</span>
              </div>
              <p className="mt-2 text-sm text-zinc-400">{item.detail}</p>
            </button>
            ))}
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
