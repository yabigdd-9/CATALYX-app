'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function UpdatePasswordForm() {
  const router = useRouter()
  const { updatePassword, isConfigured, loading, user } = useAuth()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setMessage(null)
    if (password.length < 8) {
      setError('Use at least 8 characters.')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match.')
      return
    }
    setBusy(true)
    const result = await updatePassword(password)
    setBusy(false)
    if (result.error) {
      setError(result.error)
      return
    }
    setMessage(result.message ?? 'Password updated.')
    window.setTimeout(() => router.push('/account'), 650)
  }

  if (loading) {
    return (
      <Panel className="mx-auto mt-6 max-w-xl p-6 animate-pulse">
        <div className="h-4 w-28 rounded bg-white/10" />
        <div className="mt-4 h-10 rounded bg-white/10" />
        <div className="mt-3 h-10 rounded bg-white/10" />
        <div className="mt-4 h-12 rounded bg-white/10" />
      </Panel>
    )
  }

  if (!user && isConfigured) {
    return (
      <Panel className="mx-auto mt-6 max-w-xl p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-2xl font-black">Set new password</h2>
          <StatusPill tone="amber">Session required</StatusPill>
        </div>
        <p className="text-sm leading-6 text-zinc-400">
          The reset link did not restore your session. Open the latest password reset email again, then return here.
        </p>
        <Link href="/forgot-password" className="mt-4 inline-block text-sm font-semibold text-[#c8f500] hover:text-[#d9ff34]">
          Send a new reset link
        </Link>
      </Panel>
    )
  }

  return (
    <Panel className="mx-auto mt-6 max-w-xl p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black">Set new password</h2>
        <StatusPill tone={isConfigured ? 'lime' : 'blue'}>{isConfigured ? 'Supabase auth' : 'Mock mode'}</StatusPill>
      </div>
      <form onSubmit={submit} className="grid gap-4">
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          New password
          <input value={password} onChange={(event) => setPassword(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" type="password" required />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-zinc-300">
          Confirm password
          <input value={confirm} onChange={(event) => setConfirm(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" type="password" required />
        </label>
        {error ? <p className="rounded-md border border-[#ff3b45]/30 bg-[#ff3b45]/10 p-3 text-sm text-[#ff9ca2]">{error}</p> : null}
        {message ? <p className="rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 p-3 text-sm text-[#d9ff34]">{message}</p> : null}
        <button disabled={busy} className="rounded-md bg-[#c8f500] px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-black disabled:cursor-wait disabled:opacity-60">
          {busy ? 'Updating...' : 'Update password'}
        </button>
        <Link href="/account" className="text-sm font-semibold text-zinc-400 hover:text-white">Back to account</Link>
      </form>
    </Panel>
  )
}
