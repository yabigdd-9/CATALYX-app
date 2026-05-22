import { checkIns, feedLogs } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function JournalPage() {
  return (
    <ShellSection>
      <PageHeader title="Smart grow journal" copy="Feed logs, daily check-ins, photo observations, suggested entries, plant response, and week-by-week context in one fast timeline." />
      <div className="mt-6 grid gap-4">
        {[...feedLogs.map((log) => ({ type: 'Feed', title: `${log.date} feed`, body: `${log.litres} L, EC ${log.ec}, pH ${log.ph}, runoff EC ${log.runoffEc}. Response: ${log.response}.` })), ...checkIns.map((check) => ({ type: 'Check-in', title: `${check.date} plant read`, body: `${check.leaf}; growth ${check.growth}; stress ${check.stress}/5; environment ${check.environment}/100.` }))].map((entry) => (
          <Panel key={entry.title} className="p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f500]">{entry.type}</p>
            <h2 className="mt-2 text-xl font-black">{entry.title}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">{entry.body}</p>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}

