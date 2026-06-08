'use client'

import { useEffect, useMemo, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

function resolveNextPath(next: string | null, fallback: string) {
  if (!next || !next.startsWith('/') || next.startsWith('//')) return fallback
  return next
}

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { signIn, signUp, isConfigured, user, loading } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const destination = useMemo(
    () => resolveNextPath(searchParams.get('next'), mode === 'signup' ? '/onboarding' : '/dashboard'),
    [mode, searchParams]
  )

  useEffect(() => {
    if (mode !== 'login' || loading || !user) return
    window.location.replace(destination)
  }, [destination, loading, mode, user])

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)

    const result = mode === 'signup' ? await signUp(name, email, password) : await signIn(email, password)
    setBusy(false)

    if (result.error) {
      setError(result.error)
      return
    }

    if (result.message) {
      setMessage(result.message)
      if (mode === 'signup' && isConfigured) return
    }
    if (mode === 'login') {
      window.location.assign(destination)
      return
    }
    router.push(destination)
  }

  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black">{mode === 'signup' ? 'Create grow account' : 'Access Grow OS'}</h2>
        <StatusPill tone={isConfigured ? 'lime' : 'blue'}>{isConfigured ? 'Supabase auth' : 'Mock auth'}</StatusPill>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        {mode === 'signup' ? (
          <label className="grid gap-2 text-sm font-semibold text-zinc-300">
            Name
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]"
              placeholder="Catalyx Grower"
              autoComplete="name"
              required
            />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Email
          <input
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]"
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Password
          <input
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]"
            type="password"
            placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
          />
        </label>
        {error ? <p className="rounded-md border border-[#ff3b45]/30 bg-[#ff3b45]/10 p-3 text-sm text-[#ff9ca2]">{error}</p> : null}
        {message ? <p className="rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 p-3 text-sm text-[#d9ff34]">{message}</p> : null}
        <button disabled={busy} className="rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Processing...' : mode === 'signup' ? 'Continue to onboarding' : 'Login to Grow OS'}
        </button>
        {mode === 'login' ? (
          <Link href="/forgot-password" className="text-sm font-semibold text-[#c8f500] hover:text-[#d9ff34]">
            Forgot password?
          </Link>
        ) : null}
        {!isConfigured ? (
          <p className="text-xs leading-5 text-zinc-500">
            Mock mode is active because Supabase keys are not configured. Phase 1 still works locally and will switch to Supabase automatically when env vars are added.
          </p>
        ) : null}
      </form>
    </Panel>
  )
}
