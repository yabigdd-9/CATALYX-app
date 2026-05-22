'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const router = useRouter()
  const { signIn, signUp, isConfigured } = useAuth()
  const [name, setName] = useState('Catalyx Grower')
  const [email, setEmail] = useState('grower@catalyx.local')
  const [password, setPassword] = useState('catalyx-demo-pass')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)

    const result = mode === 'signup' ? await signUp(name, email, password) : await signIn(email, password)
    setBusy(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push(mode === 'signup' ? '/onboarding' : '/dashboard')
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
            <input value={name} onChange={(event) => setName(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" required />
          </label>
        ) : null}
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Email
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" type="email" required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Password
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" type="password" required />
        </label>
        {error ? <p className="rounded-md border border-[#ff3b45]/30 bg-[#ff3b45]/10 p-3 text-sm text-[#ff9ca2]">{error}</p> : null}
        <button disabled={busy} className="rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Processing...' : mode === 'signup' ? 'Continue to onboarding' : 'Login to Grow OS'}
        </button>
        {!isConfigured ? (
          <p className="text-xs leading-5 text-zinc-500">
            Mock mode is active because Supabase keys are not configured. Phase 1 still works locally and will switch to Supabase automatically when env vars are added.
          </p>
        ) : null}
      </form>
    </Panel>
  )
}

