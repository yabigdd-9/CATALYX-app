'use client'

import { useEffect, useState } from 'react'
import { adminFetch } from '@/lib/admin-client'
import { formatPortalDate, priorityTone, ticketStatusTone, type TicketPriority, type TicketStatus } from '@/lib/portal'
import { Panel, SaveBanner, StatusPill } from '@/components/catalyx-ui'

type AdminTicket = {
  id: string
  subject: string
  category: string
  status: TicketStatus
  priority: TicketPriority
  last_message_preview: string | null
  updated_at: string
}

type AdminDocument = {
  id: string
  title: string
  document_type: string
  published: boolean
  is_private: boolean
}

type AdminProfile = {
  user_id: string
  role: string
  company_name: string | null
  support_status: string
  preferred_contact_method: string
}

type AdminNotification = {
  id: string
  notification_type: string
  title: string
  read_at: string | null
}

export default function PortalAdminPanel() {
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [documents, setDocuments] = useState<AdminDocument[]>([])
  const [profiles, setProfiles] = useState<AdminProfile[]>([])
  const [notifications, setNotifications] = useState<AdminNotification[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('Portal operations are local until Supabase service role is configured.')

  useEffect(() => {
    let active = true

    void (async () => {
      try {
        const response = await adminFetch('/api/admin/portal')
        const payload = await response.json()
        if (!active) return
        if (!payload.ok) {
          setStatus('error')
          setMessage(payload.error ?? 'Could not load portal operations.')
          return
        }
        setTickets(payload.tickets ?? [])
        setDocuments(payload.documents ?? [])
        setProfiles(payload.profiles ?? [])
        setNotifications(payload.notifications ?? [])
        setStatus('saved')
        setMessage('Portal operations loaded from Supabase.')
      } catch {
        if (!active) return
        setStatus('error')
        setMessage('Could not reach portal admin API.')
      }
    })()

    return () => {
      active = false
    }
  }, [])

  async function updateTicket(ticketId: string, patch: Partial<Pick<AdminTicket, 'status' | 'priority'>>) {
    setStatus('saving')
    try {
      const response = await adminFetch('/api/admin/portal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticket_id: ticketId, ...patch }),
      })
      const payload = await response.json()
      if (!payload.ok) {
        setStatus('error')
        setMessage(payload.error ?? 'Ticket update failed.')
        return
      }
      const reload = await adminFetch('/api/admin/portal')
      const nextPayload = await reload.json()
      if (!nextPayload.ok) {
        setStatus('error')
        setMessage(nextPayload.error ?? 'Could not load portal operations.')
        return
      }
      setTickets(nextPayload.tickets ?? [])
      setDocuments(nextPayload.documents ?? [])
      setProfiles(nextPayload.profiles ?? [])
      setNotifications(nextPayload.notifications ?? [])
      setStatus('saved')
      setMessage('Portal operations loaded from Supabase.')
    } catch {
      setStatus('error')
      setMessage('Ticket update failed.')
    }
  }

  return (
    <Panel className="mt-6 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Customer portal operations</p>
          <h2 className="mt-2 text-2xl font-black text-white">Support, documents, customers, notifications</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-zinc-400">
            Review customer portal activity, triage support tickets, and confirm document/notification publishing state.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <StatusPill tone="amber">{tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status)).length} active tickets</StatusPill>
          <StatusPill tone="blue">{documents.length} documents</StatusPill>
          <StatusPill tone="lime">{profiles.length} profiles</StatusPill>
        </div>
      </div>

      <div className="mt-4">
        <SaveBanner status={status} message={message} />
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-3">
          {tickets.length ? tickets.map((ticket) => (
            <div key={ticket.id} className="rounded-md border border-white/10 bg-black/30 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-black text-white">{ticket.subject}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-400">{ticket.last_message_preview ?? 'No message preview.'}</p>
                  <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">{ticket.category} / {formatPortalDate(ticket.updated_at)}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <StatusPill tone={ticketStatusTone(ticket.status)}>{ticket.status}</StatusPill>
                  <StatusPill tone={priorityTone(ticket.priority)}>{ticket.priority}</StatusPill>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button onClick={() => updateTicket(ticket.id, { status: 'in_review' })} className="rounded-md border border-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">In review</button>
                <button onClick={() => updateTicket(ticket.id, { status: 'waiting_on_customer' })} className="rounded-md border border-white/15 px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Waiting</button>
                <button onClick={() => updateTicket(ticket.id, { status: 'resolved' })} className="rounded-md bg-[#c8f500] px-3 py-2 text-xs font-black uppercase tracking-[0.12em] text-black">Resolve</button>
              </div>
            </div>
          )) : (
            <div className="rounded-md border border-white/10 bg-black/30 p-4 text-sm text-zinc-400">No support tickets loaded.</div>
          )}
        </div>

        <div className="grid gap-3">
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <h3 className="font-black text-white">Document publishing</h3>
            <div className="mt-3 grid gap-2">
              {documents.slice(0, 5).map((document) => (
                <div key={document.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="text-zinc-300">{document.title}</span>
                  <StatusPill tone={document.published ? 'lime' : 'amber'}>{document.is_private ? 'private' : 'public'}</StatusPill>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <h3 className="font-black text-white">Customer profiles</h3>
            <div className="mt-3 grid gap-2">
              {profiles.slice(0, 5).map((profile) => (
                <div key={profile.user_id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="truncate text-zinc-300">{profile.company_name ?? profile.user_id}</span>
                  <StatusPill tone="blue">{profile.role}</StatusPill>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-md border border-white/10 bg-black/30 p-4">
            <h3 className="font-black text-white">Notifications</h3>
            <p className="mt-2 text-sm text-zinc-400">{notifications.filter((item) => !item.read_at).length} unread of {notifications.length} recent notifications.</p>
          </div>
        </div>
      </div>
    </Panel>
  )
}
