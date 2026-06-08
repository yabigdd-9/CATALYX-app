'use client'

import { useAuth } from '@/components/AuthProvider'
import { Panel, StatusPill } from '@/components/catalyx-ui'

export default function AdminAccessPanel() {
  const { user, loading, isConfigured } = useAuth()

  return (
    <Panel className="mt-6 border-[#ffd23f]/25 p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <StatusPill tone={user ? 'lime' : 'amber'}>{loading ? 'Checking access' : user ? 'Signed in' : 'Admin sign-in required'}</StatusPill>
          <h2 className="mt-3 text-2xl font-black text-white">Protected admin routes</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Admin API reads and writes now require a valid Supabase session plus either `app_metadata.role = admin` or an email listed in `CATALYX_ADMIN_EMAILS`.
          </p>
        </div>
        <StatusPill tone={isConfigured ? 'blue' : 'red'}>{isConfigured ? 'Supabase auth configured' : 'Auth env missing'}</StatusPill>
      </div>
    </Panel>
  )
}
