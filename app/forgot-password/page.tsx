import PasswordResetForm from '@/components/PasswordResetForm'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function ForgotPasswordPage() {
  return (
    <ShellSection>
      <PageHeader title="Reset password" copy="Request a secure Supabase password reset email for your Catalyx Labs account." />
      <PasswordResetForm />
    </ShellSection>
  )
}
