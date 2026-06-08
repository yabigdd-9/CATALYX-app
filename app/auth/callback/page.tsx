import { Suspense } from 'react'
import AuthCallback from '@/components/AuthCallback'
import { ShellSection } from '@/components/catalyx-ui'

export default function AuthCallbackPage() {
  return (
    <ShellSection>
      <Suspense fallback={null}>
        <AuthCallback />
      </Suspense>
    </ShellSection>
  )
}
