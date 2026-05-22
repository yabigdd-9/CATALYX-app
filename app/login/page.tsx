import AuthForm from '@/components/AuthForm'
import { PageHeader, ShellSection } from '@/components/catalyx-ui'

export default function LoginPage() {
  return (
    <ShellSection>
      <PageHeader title="Login" copy="Phase 1 authentication is Supabase-ready and falls back to local mock auth so the core grow experience works immediately." />
      <AuthForm mode="login" />
    </ShellSection>
  )
}

