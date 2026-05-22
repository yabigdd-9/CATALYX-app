import FeedLogForm from '@/components/FeedLogForm'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function FeedLogPage() {
  return (
    <ShellSection className="pb-24 md:pb-8">
      <PageHeader title="Feed logging" copy="Phase 1 feed logging: autofill previous feed, record water litres, product amounts, EC, pH, runoff, notes, plant response, and save the result locally until Supabase persistence is connected." />
      <div className="mt-6">
        <FeedLogForm />
      </div>
    </ShellSection>
  )
}
