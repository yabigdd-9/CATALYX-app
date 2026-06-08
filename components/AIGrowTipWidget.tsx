'use client'

import { FormEvent, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { type JournalEntry } from '@/lib/catalyx'
import { readLocalList, storageKeys, writeLocalList } from '@/lib/persistence'
import { isProfessionalLikePlan } from '@/lib/rewards'
import type { CopilotResponsePayload } from '@/lib/ai-copilot'
import { buildCopilotContext } from '@/lib/copilot-context'
import { useAuth } from '@/components/AuthProvider'
import { saveJournalEntryToSupabase } from '@/lib/supabase-services'

type ChatMessage = {
  id: string
  role: 'assistant' | 'user'
  body: string
  question?: string
  source?: 'openai' | 'rule' | 'offline'
  saveStatus?: 'idle' | 'saving' | 'saved' | 'error'
  journalId?: string
}

const starterQuestions = [
  'What should I do next?',
  'Is my feed too strong?',
  'What should I log today?',
  'Is this a root-zone issue?',
]

export default function AIGrowTipWidget() {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [online, setOnline] = useState(true)
  const [question, setQuestion] = useState('')
  const [loading, setLoading] = useState(false)
  const [proDepth, setProDepth] = useState(false)
  const [evidenceLabel, setEvidenceLabel] = useState('Local context')
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'assistant-welcome',
      role: 'assistant',
      body: 'Ask Catalyx about feeding, runoff, pH, stage timing, or what to do next. I can answer with live AI when online, or rule-engine guidance when the model is not configured.',
      source: 'rule',
      saveStatus: 'idle',
    },
  ])

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    updateOnline()
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
  }, [])

  const lastSource = useMemo(() => [...messages].reverse().find((message) => message.source)?.source ?? 'rule', [messages])
  const canUseProDepth = isProfessionalLikePlan(user?.plan)

  async function askCopilot(nextQuestion: string) {
    const trimmed = nextQuestion.trim()
    if (!trimmed || loading) return

    setQuestion('')
    const history = messages.slice(-6).map(({ role, body }) => ({ role, body }))
    setMessages((current) => [...current, { id: `user-${Date.now()}`, role: 'user', body: trimmed }])

    if (!online) {
      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          id: `assistant-${Date.now()}`,
          source: 'offline',
          body: 'You are offline. Log pH, EC, runoff, plant posture, and environment now; Catalyx will produce a stronger read when the connection returns.',
        },
      ])
      return
    }

    setLoading(true)
    try {
      const { context, evidenceLabel: nextEvidenceLabel } = await buildCopilotContext({
        question: trimmed,
        conversationHistory: history,
        proDepth: proDepth && canUseProDepth,
      })
      setEvidenceLabel(nextEvidenceLabel)
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      const payload = (await response.json()) as CopilotResponsePayload
      const topInsight = payload.insights[0]
      const body = topInsight
        ? `${payload.summary}\n\nNext: ${topInsight.action}\n\nWhy: ${topInsight.why}`
        : payload.summary
      setMessages((current) => [...current, { id: `assistant-${Date.now()}`, role: 'assistant', body, question: trimmed, source: payload.source, saveStatus: 'idle' }])
    } catch {
      setMessages((current) => [
        ...current,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          source: 'rule',
          question: trimmed,
          saveStatus: 'idle',
          body: 'Catalyx could not reach the AI route. Use a conservative move: hold feed changes, log pH/EC/runoff, and check environment stability before adjusting.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    void askCopilot(question)
  }

  const sourceLabel = lastSource === 'openai' ? 'Live AI' : lastSource === 'offline' ? 'Offline' : 'Rule engine'

  async function saveAnswer(message: ChatMessage) {
    if (message.role !== 'assistant' || message.saveStatus === 'saved' || message.saveStatus === 'saving') return

    const timestamp = new Date().toISOString()
    const entry: JournalEntry = {
      id: `ai-${message.id}`,
      type: 'AI suggestion',
      title: journalTitle(message.question),
      body: [
        message.question ? `Question: ${message.question}` : '',
        `Answer: ${message.body}`,
        `Source: ${message.source ?? 'rule'}`,
        `Context: ${evidenceLabel}`,
      ].filter(Boolean).join('\n\n'),
      approved: true,
      source: 'generated',
      createdAt: timestamp,
      updatedAt: timestamp,
    }

    setMessages((current) => current.map((item) => (item.id === message.id ? { ...item, saveStatus: 'saving' } : item)))
    const existing = readLocalList<JournalEntry>(storageKeys.journalEntries)
    const withoutDuplicate = existing.filter((item) => item.id !== entry.id)
    writeLocalList(storageKeys.journalEntries, [entry, ...withoutDuplicate].slice(0, 80))
    const result = await saveJournalEntryToSupabase(entry).catch(() => null)
    setMessages((current) => current.map((item) => (
      item.id === message.id
        ? { ...item, saveStatus: result?.ok === false ? 'error' : 'saved', journalId: result?.entry?.id ?? entry.id }
        : item
    )))
  }

  function journalTitle(savedQuestion?: string) {
    if (!savedQuestion) return 'Catalyx AI coach answer'
    const cleaned = savedQuestion.replace(/\s+/g, ' ').trim()
    const shortened = cleaned.length > 56 ? `${cleaned.slice(0, 53)}...` : cleaned
    return `AI suggestion: ${shortened}`
  }

  return (
    <aside className="fixed bottom-4 right-4 z-50 w-[calc(100vw-2rem)] max-w-md">
      {open ? (
        <div className="overflow-hidden rounded-lg border border-[#c8f500]/35 bg-[#050707]/95 shadow-2xl shadow-[#c8f500]/10 backdrop-blur">
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${online ? 'animate-ping bg-[#c8f500]' : 'bg-[#ffd23f]'}`} />
                <span className={`relative inline-flex h-3 w-3 rounded-full ${online ? 'bg-[#c8f500]' : 'bg-[#ffd23f]'}`} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-black uppercase tracking-[0.16em] text-[#d9ff34]">Catalyx AI Coach</p>
                <p className="text-xs text-zinc-500">{online ? `${sourceLabel} / ${evidenceLabel}` : 'Offline fallback'}</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-md border border-white/10 px-2 py-1 text-xs font-black uppercase tracking-[0.12em] text-zinc-400 transition hover:border-[#c8f500]/50 hover:text-white"
              aria-label="Collapse AI coach"
            >
              Hide
            </button>
          </div>

          <div className="max-h-[52vh] space-y-3 overflow-y-auto p-4">
            {messages.slice(-6).map((message) => (
              <div
                key={message.id}
                className={`rounded-md border p-3 text-sm leading-6 ${
                  message.role === 'user'
                    ? 'ml-8 border-[#c8f500]/25 bg-[#c8f500]/10 text-[#efffb2]'
                    : 'mr-4 border-white/10 bg-black/35 text-zinc-300'
                }`}
              >
                <p className="whitespace-pre-line">{message.body}</p>
                {message.role === 'assistant' ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link href="/feed-log" className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300 hover:border-[#c8f500]/50 hover:text-[#d9ff34]">
                      Log feed
                    </Link>
                    <Link href="/check-in" className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300 hover:border-[#c8f500]/50 hover:text-[#d9ff34]">
                      Daily check-in
                    </Link>
                    <Link href="/feed-calculator" className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300 hover:border-[#c8f500]/50 hover:text-[#d9ff34]">
                      Calculator
                    </Link>
                    <Link href="/recovery" className="rounded-md border border-white/10 px-2 py-1 text-xs font-bold text-zinc-300 hover:border-[#c8f500]/50 hover:text-[#d9ff34]">
                      Recovery
                    </Link>
                    <button
                      type="button"
                      onClick={() => void saveAnswer(message)}
                      className="rounded-md border border-[#33d9ff]/25 px-2 py-1 text-xs font-bold text-[#8decff] hover:border-[#33d9ff]/60"
                    >
                      {message.saveStatus === 'saving' ? 'Saving...' : message.saveStatus === 'saved' ? 'Saved' : 'Save to journal'}
                    </button>
                    {message.saveStatus === 'saved' ? (
                      <Link href="/journal" className="rounded-md border border-[#c8f500]/25 px-2 py-1 text-xs font-bold text-[#d9ff34] hover:border-[#c8f500]/60">
                        Open journal
                      </Link>
                    ) : null}
                    {message.saveStatus === 'error' ? (
                      <span className="rounded-md border border-[#ff3b45]/25 px-2 py-1 text-xs font-bold text-[#ff9ca2]">
                        Local saved
                      </span>
                    ) : null}
                  </div>
                ) : null}
              </div>
            ))}
            {loading ? (
              <div className="mr-4 rounded-md border border-[#33d9ff]/25 bg-[#33d9ff]/10 p-3 text-sm font-semibold text-[#8decff]">
                Catalyx is reading your grow context...
              </div>
            ) : null}
          </div>

          <div className="border-t border-white/10 p-4">
            <div className="mb-3 flex flex-wrap gap-2">
              {starterQuestions.map((starter) => (
                <button
                  key={starter}
                  type="button"
                  onClick={() => void askCopilot(starter)}
                  className="rounded-md border border-white/10 px-3 py-2 text-xs font-bold text-zinc-300 transition hover:border-[#c8f500]/50 hover:text-[#d9ff34]"
                >
                  {starter}
                </button>
              ))}
            </div>
            <div className="mb-3 flex items-center justify-between gap-3 rounded-md border border-white/10 bg-black/30 px-3 py-2">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white">Pro depth</p>
                <p className="text-xs text-zinc-500">{canUseProDepth ? 'Adds deeper risk and confidence reads.' : 'Upgrade unlocks deeper analysis.'}</p>
              </div>
              {canUseProDepth ? (
                <button
                  type="button"
                  onClick={() => setProDepth((current) => !current)}
                  className={`rounded-md px-3 py-2 text-xs font-black uppercase tracking-[0.12em] ${proDepth ? 'bg-[#c8f500] text-black' : 'border border-white/10 text-zinc-300'}`}
                >
                  {proDepth ? 'On' : 'Off'}
                </button>
              ) : (
                <Link href="/pricing" className="rounded-md border border-[#c8f500]/40 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#d9ff34]">
                  Pro
                </Link>
              )}
            </div>
            <form onSubmit={handleSubmit} className="grid gap-2">
              <label htmlFor="catalyx-ai-question" className="sr-only">Ask Catalyx AI</label>
              <textarea
                id="catalyx-ai-question"
                value={question}
                onChange={(event) => setQuestion(event.target.value)}
                rows={2}
                placeholder="Ask about pH, EC, runoff, stage, stress..."
                className="resize-none rounded-md border border-white/10 bg-black px-3 py-3 text-sm text-white outline-none transition placeholder:text-zinc-600 focus:border-[#c8f500]/60"
              />
              <div className="flex items-center justify-between gap-3">
                <Link href="/copilot" className="text-xs font-bold uppercase tracking-[0.14em] text-zinc-500 transition hover:text-[#d9ff34]">
                  Full Copilot
                </Link>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black shadow-lg shadow-[#c8f500]/15 disabled:cursor-not-allowed disabled:opacity-45"
                >
                  Ask
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="ml-auto flex items-center gap-3 rounded-full border border-[#c8f500]/35 bg-[#050707]/95 px-4 py-3 text-left shadow-2xl shadow-[#c8f500]/10 backdrop-blur transition hover:border-[#c8f500]/70"
          aria-label="Open Catalyx AI coach"
        >
          <span className="relative flex h-3 w-3">
            <span className={`absolute inline-flex h-full w-full rounded-full opacity-60 ${online ? 'animate-ping bg-[#c8f500]' : 'bg-[#ffd23f]'}`} />
            <span className={`relative inline-flex h-3 w-3 rounded-full ${online ? 'bg-[#c8f500]' : 'bg-[#ffd23f]'}`} />
          </span>
          <span>
            <span className="block text-xs font-black uppercase tracking-[0.14em] text-[#d9ff34]">AI Coach</span>
            <span className="block text-xs text-zinc-500">{online ? 'Ask grow questions' : 'Offline fallback'}</span>
          </span>
        </button>
      )}
    </aside>
  )
}
