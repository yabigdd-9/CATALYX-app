import { mockProfile } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import SubscriptionPanel from '@/components/SubscriptionPanel'

export default function ProfilePage() {
  return (
    <ShellSection>
      <PageHeader title="Profile" copy="Account, grow style, experience level, goals, products owned, and subscription status." />
      <div className="mt-6">
        <SubscriptionPanel variant="summary" />
      </div>
      <Panel className="mt-6 p-6">
        <div className="flex flex-wrap justify-between gap-4">
          <div>
            <h2 className="text-3xl font-black">{mockProfile.name}</h2>
            <p className="mt-2 text-zinc-400">{mockProfile.growStyle} / {mockProfile.experience} / {mockProfile.goal}</p>
          </div>
          <StatusPill tone="lime">{mockProfile.subscription}</StatusPill>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {mockProfile.productsOwned.map((product) => (
            <div key={product} className="rounded-md border border-white/10 bg-black/30 p-4 font-bold">{product}</div>
          ))}
        </div>
      </Panel>
    </ShellSection>
  )
}
