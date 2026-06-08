'use client'

import { useEffect, useState } from 'react'
import type { CopilotResponsePayload } from '@/lib/ai-copilot'
import { buildCopilotContext } from '@/lib/copilot-context'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

export default function AICopilotPanel() {
  const [payload, setPayload] = useState<CopilotResponsePayload | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('saving')
  const [evidence, setEvidence] = useState({
    grow: 'seed',
    feedLogs: 'none',
    environmentLogs: 'none',
    journalEntries: 'none',
  })

  async function loadCopilot() {
    setStatus('saving')
    try {
      const { context } = await buildCopilotContext()
      setEvidence({
        grow: context.sourceSummary?.grow ?? 'seed',
        feedLogs: context.sourceSummary?.feedLogs ?? 'none',
        environmentLogs: context.sourceSummary?.environmentLogs ?? 'none',
        journalEntries: context.sourceSummary?.journalEntries ?? 'none',
      })
      const response = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(context),
      })
      const data = (await response.json()) as CopilotResponsePayload
      setPayload(data)
      setStatus('saved')
    } catch {
      setStatus('error')
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCopilot()
    }, 0)
    return () => window.clearTimeout(timer)
  }, [])

  return (
    <Panel className="mt-6 overflow-hidden border-[#33d9ff]/25">
      <div className="grid gap-5 p-5 lg:grid-cols-[0.85fr_1.15fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusPill tone={payload?.source === 'openai' ? 'lime' : 'blue'}>
              {payload?.source === 'openai' ? 'Live AI' : 'Rule engine'}
            </StatusPill>
            <StatusPill tone="blue">Free for everyone</StatusPill>
          </div>
          <h2 className="mt-4 text-3xl font-black text-white">AI grow read</h2>
          <p className="mt-3 text-sm leading-6 text-zinc-400">
            {payload?.summary ?? 'Catalyx is reading saved grow context and preparing a recommendation.'}
          </p>
          {payload?.source === 'rule' ? (
            <p className="mt-3 rounded-md border border-[#33d9ff]/25 bg-[#33d9ff]/10 p-3 text-sm leading-6 text-[#8decff]">
              AI remains available through the Catalyx rule engine. Live model responses activate when OPENAI_API_KEY is set on the server.
            </p>
          ) : null}
          <button onClick={loadCopilot} className="mt-5 rounded-md border border-[#33d9ff]/40 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-[#8decff]">
            Refresh AI read
          </button>
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              ['Grow', evidence.grow],
              ['Feed', evidence.feedLogs],
              ['Environment', evidence.environmentLogs],
              ['Journal', evidence.journalEntries],
            ].map(([label, source]) => (
              <span key={label} className="rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs font-bold uppercase tracking-[0.12em] text-zinc-400">
                {label}: {source}
              </span>
            ))}
          </div>
          <div className="mt-4">
            <SaveBanner
              status={status}
              message={
                status === 'saving'
                  ? 'Reading grow context...'
                  : status === 'saved'
                    ? payload?.source === 'openai'
                      ? 'Live AI read updated.'
                      : 'Rule-engine AI read updated.'
                    : 'AI route unavailable.'
              }
            />
          </div>
        </div>

        <div className="grid gap-3">
          {(payload?.insights ?? []).map((insight) => (
            <div key={insight.title} className="rounded-md border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="font-black text-white">{insight.title}</h3>
                <StatusPill tone={insight.severity === 'warning' ? 'amber' : insight.severity === 'stable' ? 'blue' : 'lime'}>
                  {insight.confidence} confidence
                </StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-300">{insight.action}</p>
              <details className="mt-3 rounded-md border border-white/10 bg-black/20 p-3">
                <summary className="cursor-pointer text-xs font-black uppercase tracking-[0.16em] text-[#c8f500]">Why this recommendation?</summary>
                <p className="mt-2 text-sm leading-6 text-zinc-500">{insight.why}</p>
              </details>
            </div>
          ))}
          {payload?.missingData?.length ? (
            <div className="rounded-md border border-[#ffd23f]/30 bg-[#ffd23f]/10 p-4">
              <p className="text-sm font-black text-white">To improve confidence</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">{payload.missingData.join(', ')}</p>
            </div>
          ) : null}
          {payload?.proSignals ? (
            <div className="rounded-md border border-[#c8f500]/25 bg-[#c8f500]/10 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm font-black text-white">Pro intelligence signals</p>
                <StatusPill tone={payload.proSignals.confidence === 'High' ? 'lime' : payload.proSignals.confidence === 'Medium' ? 'amber' : 'blue'}>
                  {payload.proSignals.confidence} confidence
                </StatusPill>
              </div>
              <div className="mt-3 grid gap-2 text-sm leading-6 text-zinc-300">
                <p>Runoff trend: {payload.proSignals.runoffTrend}</p>
                {payload.proSignals.environmentStatus ? <p>Environment: {payload.proSignals.environmentStatus}</p> : null}
                <p>Recovery trigger: {payload.proSignals.recoveryTrigger}</p>
                <p>Forecast: {payload.proSignals.forecast}</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </Panel>
  )
}
