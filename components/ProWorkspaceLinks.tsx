import Link from 'next/link'
import { Panel, StatusPill } from '@/components/catalyx-ui'

const workspaces = [
  ['Weekly Review', '/weekly-review', 'Scores, changes, issues, and next-week actions.', 'lime'],
  ['Recovery', '/recovery', 'Stabilise runoff drift, stress, or correction events.', 'amber'],
  ['Forecast', '/forecast', 'Preview crop direction and dose-change scenarios.', 'blue'],
  ['Compare', '/compare', 'See whether this run is improving against benchmarks.', 'violet'],
] as const

export default function ProWorkspaceLinks({ className = '' }: { className?: string }) {
  return (
    <Panel className={`p-5 ${className}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <StatusPill tone="lime">Professional</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">Optimisation command center</h2>
        </div>
        <p className="max-w-xl text-sm leading-6 text-zinc-400">
          AI guidance is free. These subscriber tools turn recommendations into reviews, recovery plans, forecasts, and improvement tracking.
        </p>
      </div>
      <div className="mt-4 grid gap-3 md:grid-cols-4">
        {workspaces.map(([title, href, body, tone]) => (
          <Link key={href} href={href} className="rounded-md border border-white/10 bg-black/30 p-4 transition hover:border-[#c8f500]/40 hover:bg-[#c8f500]/10">
            <div className="flex items-center justify-between gap-3">
              <p className="font-black text-white">{title}</p>
              <StatusPill tone={tone}>{tone === 'lime' ? 'Review' : tone === 'amber' ? 'Stabilise' : tone === 'blue' ? 'Predict' : 'Improve'}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{body}</p>
          </Link>
        ))}
      </div>
    </Panel>
  )
}
