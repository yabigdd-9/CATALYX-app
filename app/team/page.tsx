import Image from 'next/image'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import type { TeamMember } from '@/types'

const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Dion',
    role: 'Founder & CEO',
    bio: 'Leads the product vision, commercial direction, and how the Catalyx range is positioned for growers and stockists.',
    image: '/team/john.svg',
    email: 'dion@catalyxlabs.co.nz',
  },
  {
    id: '2',
    name: 'Robert',
    role: 'CTO',
    bio: 'Owns the app, technical systems, and the product experience that connects storefront, checkout, and Grow OS workflows.',
    image: '/team/jane.svg',
    email: 'robert@catalyxlabs.co.nz',
  },
  {
    id: '3',
    name: 'Daena',
    role: 'Product Manager',
    bio: 'Keeps the customer path clear across kits, education, rollout details, and operational handoff points.',
    image: '/team/mike.svg',
    email: 'daena@catalyxlabs.co.nz',
  },
]

export default function TeamPage() {
  return (
    <ShellSection>
      <PageHeader
        title="Catalyx team"
        copy="The public launch path should make it obvious who is behind the system and where to go when a customer needs help."
      />

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        {teamMembers.map((member) => (
          <Panel key={member.id} className="flex h-full flex-col overflow-hidden">
            <div className="relative h-64 border-b border-white/10 bg-[radial-gradient(circle_at_50%_20%,rgba(200,245,0,0.14),transparent_42%),linear-gradient(180deg,#0b0f10_0%,#050707_100%)]">
              <Image src={member.image} alt={member.name} fill className="object-contain p-8" />
            </div>
            <div className="flex flex-1 flex-col p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-[#c8f500]">Catalyx team</p>
                  <h2 className="mt-3 text-2xl font-black text-white">{member.name}</h2>
                </div>
                <StatusPill tone="blue">{member.role}</StatusPill>
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-300">{member.bio}</p>
              <div className="mt-auto pt-6">
                <a
                  href={`mailto:${member.email}`}
                  className="inline-flex w-full items-center justify-center rounded-md border border-white/15 bg-white/5 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white"
                >
                  {member.email}
                </a>
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </ShellSection>
  )
}
