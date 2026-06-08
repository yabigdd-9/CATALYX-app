import Link from 'next/link'
import { protocols } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'

export default function ProtocolsPage() {
  return (
    <ShellSection>
      <PageHeader title="Catalyx protocols" copy="Build workflows around the locked Catalyx kit system: Base Kit, Core Kit, Enhancement Kit, Final Stage Kit, Performance Kit, and Complete Kit." />
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {protocols.map(([name, audience, used, stage, benefit], index) => (
          <Panel key={name} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="text-xl font-black">{name}</h2>
              <StatusPill tone={index % 3 === 0 ? 'lime' : index % 3 === 1 ? 'blue' : 'violet'}>{stage}</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">For: {audience}. Expected benefit: {benefit}.</p>
            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-zinc-500">Products used</p>
            <p className="mt-2 font-bold text-white">{used.join(' + ')}</p>
            <div className="mt-4 rounded-md border border-[#ff8a1f]/30 bg-[#ff8a1f]/10 p-3 text-sm text-zinc-300">
              Warning: use the professional version only when pH, EC, runoff, and plant response are stable.
            </div>
            <Link href="/feed-calculator" className="mt-4 inline-flex rounded-md bg-[#c8f500] px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Open calculator</Link>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}
