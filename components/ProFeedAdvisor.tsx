'use client'

import { useMemo } from 'react'
import type { Medium, Stage } from '@/lib/catalyx'
import { adviseAfterFeedLog } from '@/lib/pro-feed-advisor'
import ProGate from '@/components/ProGate'
import { Panel, StatusPill } from '@/components/catalyx-ui'

type ProFeedAdvisorProps = {
  stage: Stage
  medium: Medium
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
}

export default function ProFeedAdvisor(props: ProFeedAdvisorProps) {
  const { ec, medium, ph, response, runoffEc, runoffPh, stage } = props
  const advice = useMemo(
    () => adviseAfterFeedLog({ ec, medium, ph, response, runoffEc, runoffPh, stage }),
    [ec, medium, ph, response, runoffEc, runoffPh, stage]
  )

  return (
    <ProGate
      featureKey="stage_recommendations"
      feature="What to do next"
      reason="After each feed log, Catalyx Pro interprets pH, EC, runoff, stage, and plant response — then tells you the safest next move."
      preview
    >
      <Panel className="border-[#8decff]/25 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Pro feed advisor</p>
            <h3 className="mt-2 text-xl font-black text-white">{advice.headline}</h3>
          </div>
          <StatusPill tone={advice.confidence === 'High' ? 'lime' : advice.confidence === 'Medium' ? 'blue' : 'amber'}>
            {advice.confidence} confidence
          </StatusPill>
        </div>
        <p className="mt-4 text-sm leading-6 text-zinc-300">{advice.feedingSuggestion}</p>
        {advice.warnings.length ? (
          <div className="mt-4 grid gap-2">
            {advice.warnings.map((warning) => (
              <div key={warning} className="rounded-md border border-[#ff8a1f]/30 bg-[#ff8a1f]/10 p-3 text-sm text-zinc-300">
                {warning}
              </div>
            ))}
          </div>
        ) : null}
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-zinc-300">
          {advice.nextSteps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </Panel>
    </ProGate>
  )
}
