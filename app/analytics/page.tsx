import { feedLogs, scoreBreakdown } from '@/lib/catalyx'
import { MetricCard, PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'
import TrendChart from '@/components/TrendChart'
import ProGate from '@/components/ProGate'

const chartRows: Array<[string, number[], string, string]> = [
  ['Feed EC history', feedLogs.map((log) => log.ec), '#c8f500', 'input EC'],
  ['pH stability', feedLogs.map((log) => log.ph), '#33d9ff', '5.8-6.2 target'],
  ['Runoff EC trend', feedLogs.map((log) => log.runoffEc), '#ff8a1f', 'watch rising trend'],
  ['Product usage by week', [18, 22, 24, 21, 26, 28], '#9a5cff', 'ml trend'],
  ['Score trend', scoreBreakdown.slice(0, 6).map((score) => score.value), '#16d6c8', 'score /100'],
  ['Stage timeline', [1, 1, 2, 3, 3, 4], '#ffd23f', 'phase movement'],
]

export default function AnalyticsPage() {
  return (
    <ShellSection>
      <PageHeader title="Grow analytics" copy="Feed history, pH, EC, runoff, product usage, cost estimate, stability trends, score trends, photo timeline, stage timeline, and improvement suggestions." />
      <ProGate feature="Advanced grow analytics" reason="Analytics combines feed logs, runoff trends, score history, product usage, and stage movement into professional decision support.">
        <div className="mt-6 grid gap-4 md:grid-cols-4">
          {scoreBreakdown.slice(4).map((score) => (
            <MetricCard key={score.label} {...score} />
          ))}
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          {chartRows.map(([title, values, color, target], index) => (
            <Panel key={title} className="p-5">
              <div className="mt-4">
                <TrendChart title={title} values={values} color={color} target={target} />
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-400">
                {index === 2 ? 'Runoff is rising over three feeds. Maintain strength before increasing.' : 'Trend is stable enough to support the next recommendation.'}
              </p>
            </Panel>
          ))}
        </div>
        <Panel className="mt-6 overflow-hidden">
          <div className="border-b border-white/10 p-5">
            <h2 className="text-2xl font-black">Feed log table</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-left text-sm">
              <thead className="bg-white/[0.03] text-xs uppercase tracking-[0.16em] text-zinc-500">
                <tr><th className="p-4">Date</th><th className="p-4">Litres</th><th className="p-4">EC</th><th className="p-4">pH</th><th className="p-4">Runoff EC</th><th className="p-4">Response</th></tr>
              </thead>
              <tbody>{feedLogs.map((log) => <tr key={log.date} className="border-t border-white/10"><td className="p-4">{log.date}</td><td className="p-4">{log.litres}</td><td className="p-4">{log.ec}</td><td className="p-4">{log.ph}</td><td className="p-4">{log.runoffEc}</td><td className="p-4 text-zinc-400">{log.response}</td></tr>)}</tbody>
            </table>
          </div>
        </Panel>
      </ProGate>
    </ShellSection>
  )
}
