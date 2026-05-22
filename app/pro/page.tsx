import Link from 'next/link'
import { PageHeader, Panel, ShellSection } from '@/components/catalyx-ui'

export default function ProPage() {
  return (
    <ShellSection>
      <PageHeader title="Professional cultivation advantage" copy="Catalyx Professional turns logs into confident action: predictive warnings, adaptive feed charts, Weekly Grow Reviews, mistake prevention, Recovery Mode, and outcome forecasting." action={<Link href="/pricing" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">View pricing</Link>} />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {['Prevent feeding mistakes before they happen.', 'Interpret runoff trends with confidence.', 'Know why every recommendation exists.', 'Adjust feed strength with stable data.', 'Recover from pH and EC instability.', 'Export a professional grow report.'].map((item) => (
          <Panel key={item} className="p-5">
            <h2 className="text-xl font-black">{item}</h2>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Built to make growers feel more capable every time they open Catalyx.</p>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}

