import Link from 'next/link'
import { PageHeader, Panel } from '../../components/catalyx-ui'

export default function OfflinePage() {
  return (
    <div className="mx-auto flex min-h-[70vh] w-full max-w-4xl flex-col justify-center px-4 py-16">
      <PageHeader
        title="Catalyx is waiting for connection."
        copy="Core cached pages can still open, but live grow data, account actions, and saved logs need Supabase access."
      />
      <Panel className="mt-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-md border border-[#c8f500]/30 bg-[#c8f500]/10 text-[#c8f500]">
            <span className="text-lg font-black" aria-hidden>
              !
            </span>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold uppercase tracking-[0.16em] text-zinc-500">Connection required</p>
            <p className="mt-2 text-lg font-semibold text-white">
              Reconnect to sync feed logs, onboarding changes, reminders, and product shelf updates.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black"
          >
            Dashboard
          </Link>
        </div>
      </Panel>
    </div>
  )
}
