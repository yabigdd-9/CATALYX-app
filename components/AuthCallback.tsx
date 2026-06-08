'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'
import { exchangeSupabaseSessionFromUrl } from '@/lib/supabase-auth-flow'

export default function AuthCallback() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { refreshUser } = useAuth()
  const [status, setStatus] = useState('Confirming your session.')

  useEffect(() => {
    let active = true
    async function finish() {
      const exchange = await exchangeSupabaseSessionFromUrl()
      if (exchange.error) {
        throw new Error(exchange.error)
      }
      await refreshUser()
      if (!active) return
      setStatus('Session confirmed. Redirecting.')
      const next = searchParams.get('next')
      const authType = searchParams.get('type')
      router.replace(next ?? (authType === 'recovery' ? '/update-password' : '/dashboard'))
    }
    finish().catch((error) => {
      if (!active) return
      setStatus(error instanceof Error ? error.message : 'Unable to confirm session.')
    })
    return () => {
      active = false
    }
  }, [refreshUser, router, searchParams])

  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6">
      <StatusPill tone="lime">Auth callback</StatusPill>
      <h2 className="mt-4 text-2xl font-black text-white">{status}</h2>
      <p className="mt-3 text-sm leading-6 text-zinc-400">Catalyx is restoring your account session and plan access.</p>
    </Panel>
  )
}
