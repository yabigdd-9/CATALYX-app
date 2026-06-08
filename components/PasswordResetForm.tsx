'use client'

import Link from 'next/link'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function PasswordResetForm() {
  const { resetPassword, isConfigured } = useAuth()
  const [email, setEmail] = useState('grower@catalyx.local')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setBusy(true)
    setError(null)
    setMessage(null)
    const result = await resetPassword(email)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setMessage(result.message ?? 'Password reset email sent.')
  }

  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Reset password</h2>
        <StatusPill tone={isConfigured ? 'lime' : 'blue'}>{isConfigured ? 'Supabase email' : 'Mock mode'}</StatusPill>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Account email
          <input value={email} onChange={(event) => setEmail(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" type="email" required />
        </label>
        {error ? <p className="rounded-md border border-[#ff3b45]/30 bg-[#ff3b45]/10 p-3 text-sm text-[#ff9ca2]">{error}</p> : null}
        {message ? <p className="rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 p-3 text-sm text-[#d9ff34]">{message}</p> : null}
        <button disabled={busy} className="rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Sending...' : 'Send reset link'}
        </button>
        <Link href="/login" className="text-sm font-semibold text-zinc-400 hover:text-white">Back to login</Link>
      </form>
    </Panel>
  )
}
