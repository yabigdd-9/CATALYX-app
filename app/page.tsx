import Link from 'next/link'
import {
  activeGrow,
  checkIns,
  feedLogs,
  productsForStage,
  recommendationEngine,
  reminders,
  scoreBreakdown,
} from '@/lib/catalyx'
import { MetricCard, MiniGraph, Panel, ProductAccent, ProductRail, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function Home() {
  const recommendations = recommendationEngine()
  const stageProducts = productsForStage(activeGrow.stage)

  return (
    <div className="min-h-screen bg-[#050707] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_72%_18%,rgba(200,245,0,0.16),transparent_30%),radial-gradient(circle_at_18%_80%,rgba(51,217,255,0.11),transparent_28%),linear-gradient(180deg,#050707_0%,#080b0c_100%)]" />
        <ShellSection className="relative grid min-h-[calc(100vh-76px)] content-center gap-8 pb-12 pt-10">
          <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
            <div>
              <h1 className="max-w-4xl text-5xl font-black uppercase leading-[0.94] tracking-[0.04em] text-white md:text-7xl">
                Precision cultivation made simple.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
                Catalyx Labs is a premium cultivation operating system that tells growers what to do today, what to feed, why it matters, and how to improve consistency.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link href="/dashboard" className="rounded-md bg-[#c8f500] px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-black shadow-lg shadow-[#c8f500]/20">
                  Open Grow OS
                </Link>
                <Link href="/feed-calculator" className="rounded-md border border-white/15 bg-white/5 px-6 py-4 text-center text-sm font-black uppercase tracking-[0.16em] text-white">
                  Calculate Feed
                </Link>
              </div>
            </div>

            <Panel className="overflow-hidden p-4">
              <div className="grid gap-4 md:grid-cols-[0.72fr_1.28fr]">
                <div className="space-y-3 border-b border-white/10 pb-4 md:border-b-0 md:border-r md:pb-0 md:pr-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-zinc-500">Grow command</p>
                  {['Dashboard', 'Check-in', 'Feed', 'Copilot', 'Analytics'].map((item, index) => (
                    <Link key={item} href={index === 0 ? '/dashboard' : `/${item.toLowerCase()}`} className={`block rounded-md px-3 py-3 text-sm font-semibold ${index === 0 ? 'bg-[#c8f500] text-black' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}>
                      {item}
                    </Link>
                  ))}
                  <div className="rounded-md border border-[#33d9ff]/30 bg-[#33d9ff]/10 p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-[#8decff]">Subscription</p>
                    <p className="mt-1 text-sm font-bold">Professional optimisation active</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Active grow</p>
                      <h2 className="mt-1 text-3xl font-black">{activeGrow.name}</h2>
                      <p className="mt-1 text-sm text-zinc-400">{activeGrow.stage.replace('-', ' ')} / {activeGrow.medium} / {activeGrow.lightSchedule}</p>
                    </div>
                    <StatusPill tone="lime">Catalyx Grow Score 86</StatusPill>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <MetricCard label="Plant health" value={88} note="Strong posture" accent="#16d6c8" />
                    <MetricCard label="Feed stability" value={79} note="Runoff EC rising" accent="#ff8a1f" />
                    <MetricCard label="Environment" value={84} note="VPD close" accent="#33d9ff" />
                  </div>
                  <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
                    <Panel className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Next feed recommendation</p>
                      <div className="mt-4 grid gap-2">
                        {stageProducts.map((product) => (
                          <ProductAccent key={product.id} product={product} compact />
                        ))}
                      </div>
                    </Panel>
                    <Panel className="p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">EC trend</p>
                      <MiniGraph color="#ff8a1f" />
                      <p className="mt-3 text-sm text-zinc-400">Runoff EC trend suggests possible salt buildup within 5-7 days.</p>
                    </Panel>
                  </div>
                </div>
              </div>
            </Panel>
          </div>
          <ProductRail />
        </ShellSection>
      </section>

      <ShellSection>
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-3xl font-black uppercase tracking-[0.08em]">What to do today</h2>
            <div className="mt-5 grid gap-3">
              {reminders.map((reminder) => (
                <Panel key={reminder.title} className="p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-bold text-white">{reminder.title}</p>
                      <p className="mt-1 text-sm text-zinc-400">{reminder.detail}</p>
                    </div>
                    <span className="text-sm font-semibold text-[#c8f500]">{reminder.due}</span>
                  </div>
                </Panel>
              ))}
            </div>
          </div>
          <div>
            <h2 className="text-3xl font-black uppercase tracking-[0.08em]">Catalyx Intelligence</h2>
            <div className="mt-5 grid gap-3">
              {recommendations.map((item) => (
                <Panel key={item.title} className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="font-bold text-white">{item.title}</h3>
                    <StatusPill tone={item.severity === 'warning' ? 'amber' : 'lime'}>{item.confidence}</StatusPill>
                  </div>
                  <p className="mt-2 text-sm text-zinc-300">{item.action}</p>
                  <details className="mt-3">
                    <summary className="cursor-pointer text-xs font-bold uppercase tracking-[0.16em] text-[#c8f500]">Why?</summary>
                    <p className="mt-2 text-sm leading-6 text-zinc-500">{item.why}</p>
                  </details>
                </Panel>
              ))}
            </div>
          </div>
        </div>
      </ShellSection>

      <ShellSection className="pt-0">
        <div className="grid gap-4 md:grid-cols-4">
          {scoreBreakdown.slice(0, 4).map((score) => (
            <MetricCard key={score.label} {...score} />
          ))}
        </div>
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Panel className="p-5">
            <h3 className="text-xl font-black">Weekly Catalyx Review</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Grow Score: 82/100. Excellent feed consistency and strong photo progression. Slight pH drift detected; reduce EC slightly next week and prepare for transition guidance.</p>
          </Panel>
          <Panel className="p-5">
            <h3 className="text-xl font-black">Current Grow Projection</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Feed consistency: High. Stress risk: Low. Flower development: Strong. Estimated harvest window: 18-24 days.</p>
          </Panel>
          <Panel className="p-5">
            <h3 className="text-xl font-black">Compare My Grow</h3>
            <p className="mt-3 text-sm leading-6 text-zinc-400">This grow is outperforming your last grow by +14% feed consistency and +22% photo progression based on current mock history.</p>
          </Panel>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          {feedLogs.map((log) => (
            <Panel key={log.date} className="p-4">
              <p className="text-sm font-bold text-white">{log.date} feed</p>
              <p className="mt-2 text-sm text-zinc-400">{log.litres} L / EC {log.ec} / pH {log.ph} / runoff EC {log.runoffEc}</p>
            </Panel>
          ))}
          {checkIns.map((check) => (
            <Panel key={check.date} className="p-4">
              <p className="text-sm font-bold text-white">{check.date} check-in</p>
              <p className="mt-2 text-sm text-zinc-400">{check.leaf}, growth {check.growth}, environment {check.environment}/100.</p>
            </Panel>
          ))}
        </div>
      </ShellSection>
    </div>
  )
}

