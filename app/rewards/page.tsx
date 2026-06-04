import type { Metadata } from 'next'
import RewardsExchangePanel from '@/components/RewardsExchangePanel'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export const metadata: Metadata = {
  title: 'CATALYX CX Rewards',
  description: 'Earn CX through purchases, activity, daily check-ins, and engagement, then unlock digital rewards, boosts, store credit, and premium Catalyx value.',
}

export default function RewardsPage() {
  return (
    <ShellSection>
      <PageHeader
        title="CATALYX CX Rewards"
        copy="Earn CX through purchases, check-ins, grow activity, and referrals. Spend it on digital upgrades first, then boosts, store credit, and selected limited physical rewards."
      />
      <RewardsExchangePanel className="mt-6" variant="full" />
    </ShellSection>
  )
}

