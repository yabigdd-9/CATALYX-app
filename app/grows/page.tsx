import { activeGrow, stageLabels } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function GrowsPage() {
  return (
    <ShellSection>
      <PageHeader title="Grow tracker" copy="Track grows, plants, tents, rooms, stages, mediums, light schedules, goals, feeding style, environment notes, health status, and journal notes." />
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Panel className="p-5">
          <h2 className="text-2xl font-black">Add grow</h2>
          <div className="mt-4 grid gap-3">
            {['Strain name', 'Start date', 'Light schedule', 'Grow goal', 'Feeding style', 'Environment notes', 'Health status', 'Notes'].map((field) => (
              <label key={field} className="grid gap-2 text-sm font-semibold text-zinc-300">
                {field}
                <input className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" placeholder={field} />
              </label>
            ))}
            <button className="rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Create grow</button>
          </div>
        </Panel>
        <Panel className="p-5">
          <div className="flex flex-wrap justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-zinc-500">Active grow</p>
              <h2 className="mt-2 text-3xl font-black">{activeGrow.name}</h2>
              <p className="mt-2 text-zinc-400">{activeGrow.strain}</p>
            </div>
            <StatusPill tone="lime">{stageLabels[activeGrow.stage]}</StatusPill>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-2">
            {Object.entries(activeGrow).filter(([key]) => !['id', 'name'].includes(key)).map(([key, value]) => (
              <div key={key} className="rounded-md border border-white/10 bg-black/30 p-4">
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-500">{key.replace(/([A-Z])/g, ' $1')}</p>
                <p className="mt-2 font-bold text-white">{String(value)}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>
    </ShellSection>
  )
}

