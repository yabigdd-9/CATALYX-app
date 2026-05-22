'use client'

import { useState } from 'react'
import { products, protocols, universityLessons } from '@/lib/catalyx'
import { readLocalList, writeLocalList } from '@/lib/persistence'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

type AdminItem = {
  id: string
  type: string
  title: string
  body: string
  plan: 'free' | 'professional'
}

const seedItems: AdminItem[] = [
  ...products.map((product) => ({
    id: product.id,
    type: 'product',
    title: product.name,
    body: product.why,
    plan: 'free' as const,
  })),
  ...protocols.slice(0, 6).map(([name, audience, , stage, benefit]) => ({
    id: name,
    type: 'protocol',
    title: name,
    body: `${audience}. ${stage}. ${benefit}.`,
    plan: 'professional' as const,
  })),
  ...universityLessons.slice(0, 8).map((lesson, index) => ({
    id: lesson,
    type: 'lesson',
    title: lesson,
    body: 'Editable Catalyx University lesson content.',
    plan: index < 3 ? 'free' as const : 'professional' as const,
  })),
]

export default function AdminEditor() {
  const [items, setItems] = useState<AdminItem[]>(() => {
    const stored = readLocalList<AdminItem>('catalyx-admin-items')
    return stored.length ? stored : seedItems
  })
  const [selectedId, setSelectedId] = useState(items[0]?.id)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const selected = items.find((item) => item.id === selectedId) ?? items[0]

  function updateSelected(patch: Partial<AdminItem>) {
    setItems((current) => current.map((item) => item.id === selected.id ? { ...item, ...patch } : item))
  }

  function save() {
    setStatus('saving')
    const next = items.map((item) => item.id === selected.id ? selected : item)
    writeLocalList('catalyx-admin-items', next)
    window.setTimeout(() => setStatus('saved'), 250)
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
      <Panel className="p-5">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Editable content</h2>
          <StatusPill tone="blue">{items.length} items</StatusPill>
        </div>
        <div className="mt-4 grid max-h-[620px] gap-2 overflow-auto pr-1">
          {items.map((item) => (
            <button key={item.id} onClick={() => setSelectedId(item.id)} className={`rounded-md border p-3 text-left transition ${selected?.id === item.id ? 'border-[#c8f500]/50 bg-[#c8f500]/10' : 'border-white/10 bg-black/30 hover:border-white/25'}`}>
              <p className="font-bold text-white">{item.title}</p>
              <p className="mt-1 text-xs uppercase tracking-[0.16em] text-zinc-500">{item.type} / {item.plan}</p>
            </button>
          ))}
        </div>
      </Panel>
      {selected ? (
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Admin editor</h2>
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
            <SaveBanner status={status} message="Admin content saved locally. Wire this surface to Supabase tables for production editorial control." />
          </div>
        </Panel>
      ) : null}
    </div>
  )
}

