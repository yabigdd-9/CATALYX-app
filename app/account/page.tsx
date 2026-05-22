import AccountSettings from '@/components/AccountSettings'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function AccountPage() {
  return (
    <ShellSection>
      <PageHeader title="Account settings" copy="Manage sign-in state, subscription plan, billing actions, and account-level access." />
      <AccountSettings />
    </ShellSection>
  )
}
