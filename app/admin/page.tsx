import { labNotes, products, protocols, universityLessons } from '@/lib/catalyx'
import { PageHeader, Panel, ShellSection, StatusPill } from '@/components/catalyx-ui'
import AdminEditor from '@/components/AdminEditor'
import AdminFeatureFlags from '@/components/AdminFeatureFlags'
import CXRewardsAdminPanel from '@/components/CXRewardsAdminPanel'
import PortalAdminPanel from '@/components/PortalAdminPanel'

const adminAreas = [
  'Products',
  'Colour themes',
  'Feed chart values',
  'Protocols',
  'Recipes',
  'Tips',
  'Catalyx University lessons',
  'Lab Notes',
  'App announcements',
  'Free vs Professional feature access',
  'Users',
  'Subscriptions',
  'Pricing copy',
  'Product education',
  'Stage recommendations',
]

export default function AdminPage() {
  return (
    <ShellSection>
      <PageHeader title="Admin control centre" copy="Manage product education, feed values, protocols, feature access, lessons, announcements, users, subscriptions, pricing copy, and stage recommendations." />
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {adminAreas.map((area, index) => (
          <Panel key={area} className="p-5">
            <div className="flex items-start justify-between gap-3">
              <h2 className="font-black">{area}</h2>
              <StatusPill tone={index % 2 ? 'blue' : 'lime'}>Editable</StatusPill>
            </div>
            <p className="mt-3 text-sm leading-6 text-zinc-400">Mock-backed admin editor ready to connect to Supabase row-level permissions.</p>
          </Panel>
        ))}
      </div>
      <Panel className="mt-6 p-5">
        <h2 className="text-2xl font-black">Seeded content summary</h2>
        <p className="mt-3 text-sm text-zinc-400">{products.length} products, {protocols.length} protocols, {universityLessons.length} lessons, and {labNotes.length} lab notes are available in the app data layer.</p>
      </Panel>
      <AdminFeatureFlags />
      <PortalAdminPanel />
      <CXRewardsAdminPanel />
      <div className="mt-6">
        <AdminEditor />
      </div>
    </ShellSection>
  )
}
