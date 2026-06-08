'use client'

import { useEffect, useMemo, useState } from 'react'
import { products, protocols, universityLessons } from '@/lib/catalyx'
import { adminFetch } from '@/lib/admin-client'
import { readLocalList, writeLocalList } from '@/lib/persistence'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'
import { premiumFeatureSuites } from '@/lib/pro-features'

type AdminItem = {
  id: string
  type: 'product' | 'protocol' | 'recipe' | 'lesson' | 'lab-note' | 'tip' | 'announcement' | 'feature'
  title: string
  body: string
  plan: 'free' | 'professional'
  meta?: Record<string, unknown>
}

const storageKey = 'catalyx-admin-items'

const seedItems: AdminItem[] = [
  ...products.map((product) => ({
    id: product.id,
    type: 'product' as const,
    title: product.name,
    body: product.why,
    plan: 'free' as const,
  })),
  ...protocols.slice(0, 6).map(([name, audience, , stage, benefit]) => ({
    id: name,
    type: 'protocol' as const,
    title: name,
    body: `${audience}. ${stage}. ${benefit}.`,
    plan: 'professional' as const,
  })),
  ...universityLessons.slice(0, 8).map((lesson, index) => ({
    id: lesson,
    type: 'lesson' as const,
    title: lesson,
    body: 'Editable Catalyx University lesson content.',
    plan: index < 3 ? 'free' as const : 'professional' as const,
  })),
  {
    id: 'ai-copilot-daily-guidance',
    type: 'feature',
    title: 'AI Copilot daily guidance',
    body: 'Free AI guidance for every user: next action, recommendation confidence, and basic why explanation.',
    plan: 'free' as const,
  },
  ...premiumFeatureSuites.map((suite) => ({
    id: suite.title.toLowerCase().replace(/\s+/g, '-'),
    type: 'feature' as const,
    title: suite.title,
    body: `${suite.value} Unlocks: ${suite.unlocks.join(', ')}.`,
    plan: 'professional' as const,
  })),
]

export default function AdminEditor() {
  const [items, setItems] = useState<AdminItem[]>(() => {
    const stored = readLocalList<AdminItem>(storageKey)
    return stored.length ? stored : seedItems
  })
  const [selectedId, setSelectedId] = useState(items[0]?.id)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Admin content saved locally. Configure SUPABASE_SERVICE_ROLE_KEY for production editorial control.')
  const [source, setSource] = useState<'local' | 'supabase'>('local')
  const selected = items.find((item) => item.id === selectedId) ?? items[0]
  const contentCounts = useMemo(() => {
    const counts = new Map<string, number>()
    items.forEach((item) => counts.set(item.type, (counts.get(item.type) ?? 0) + 1))
    return Array.from(counts.entries())
  }, [items])

  useEffect(() => {
    let active = true
    async function loadRemote() {
      try {
        const response = await adminFetch('/api/admin/content')
        const payload = await response.json()
        if (!active) return
        if (payload.ok && Array.isArray(payload.items) && payload.items.length) {
          setItems(payload.items)
          setSelectedId(payload.items[0].id)
          setSource('supabase')
          setStatus('saved')
          setMessage('Admin content loaded from Supabase.')
          writeLocalList(storageKey, payload.items)
        } else if (!payload.ok) {
          setMessage(payload.error ?? 'Using local admin content.')
        }
      } catch {
        if (active) setMessage('Using local admin content.')
      }
    }
    loadRemote()
    return () => {
      active = false
    }
  }, [])

  function updateSelected(patch: Partial<AdminItem>) {
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item))
  }

  async function save() {
    if (!selected) return
    setStatus('saving')
    const next = items.map((item) => item.id === selected.id ? selected : item)
    setItems(next)
    writeLocalList(storageKey, next)

    if (selected.type === 'feature') {
      setStatus('saved')
      setMessage('Feature-suite copy saved locally. Use the feature access panel for production flags.')
      return
    }

    try {
      const response = await adminFetch('/api/admin/content', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ item: selected }),
      })
      const payload = await response.json()
      if (payload.ok) {
        setSource('supabase')
        setStatus('saved')
        setMessage('Admin content saved to Supabase.')
      } else {
        setStatus('error')
        setMessage(payload.error ?? 'Saved locally only; Supabase admin save failed.')
      }
    } catch {
      setStatus('error')
      setMessage('Saved locally only; could not reach admin content API.')
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Editable content</h2>
          <div className="flex gap-2">
            <StatusPill tone="blue">{items.length} items</StatusPill>
            <StatusPill tone={source === 'supabase' ? 'lime' : 'amber'}>{source === 'supabase' ? 'Supabase' : 'Local'}</StatusPill>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {contentCounts.map(([type, count]) => (
            <span key={type} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
              {type}: {count}
            </span>
          ))}
        </div>
        <div className="mt-4 grid max-h-[620px] gap-2 overflow-auto pr-1">
          {items.map((item) => (
            <button key={`${item.type}-${item.id}`} onClick={() => setSelectedId(item.id)} className={`rounded-md border p-3 text-left transition ${selected?.id === item.id ? 'border-[#c8f500]/50 bg-[#c8f500]/10' : 'border-white/10 bg-black/30 hover:border-white/25'}`}>
              <p className="font-bold text-white">{item.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{item.type} / {item.plan}</p>
            </button>
          ))}
        </div>
      </Panel>
      {selected ? (
        <Panel className="p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-2xl font-black">Admin editor</h2>
            <StatusPill tone={selected.plan === 'professional' ? 'lime' : 'blue'}>{selected.plan === 'professional' ? 'Pro' : 'Free'}</StatusPill>
          </div>
          <div className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Title
              <input value={selected.title} onChange={(event) => updateSelected({ title: event.target.value })} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Body
              <textarea value={selected.body} onChange={(event) => updateSelected({ body: event.target.value })} className="min-h-40 rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Feature access
              <select value={selected.plan} onChange={(event) => updateSelected({ plan: event.target.value as AdminItem['plan'] })} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                <option value="free">Free</option>
                <option value="professional">Professional</option>
              </select>
            </label>
            <button onClick={save} className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save admin changes</button>
            <SaveBanner status={status} message={message} />
          </div>
        </Panel>
      ) : null}
    </div>
  )
}
