import UpdatePasswordForm from '@/components/UpdatePasswordForm'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function UpdatePasswordPage() {
  return (
    <ShellSection>
      <PageHeader title="Update password" copy="Set a new password after opening a secure reset link from Supabase Auth." />
      <UpdatePasswordForm />
    </ShellSection>
  )
}
