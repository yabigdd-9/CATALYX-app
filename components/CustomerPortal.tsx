'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { FormEvent, useEffect, useMemo, useState } from 'react'
import AccountOrderHistory from '@/components/AccountOrderHistory'
import RewardsExchangePanel from '@/components/RewardsExchangePanel'
import SubscriptionPanel from '@/components/SubscriptionPanel'
import { useAuth } from '@/components/AuthProvider'
import { EmptyState, MetricCard, PageHeader, Panel, SaveBanner, SkeletonPanel, StatusPill } from '@/components/catalyx-ui'
import {
  createSupportTicket,
  formatPortalDate,
  loadCustomerDocuments,
  loadPortalOrders,
  loadPortalNotifications,
  loadPortalProfile,
  loadSupportTickets,
  markPortalNotificationRead,
  priorityTone,
  savePortalProfile,
  ticketStatusTone,
  type CustomerDocument,
  type CustomerProfile,
  type PortalNotification,
  type ProductOrderRow,
  type SupportTicket,
  type TicketCategory,
} from '@/lib/portal'
import { isProfessionalLikePlan } from '@/lib/rewards'

const portalNav = [
  ['Overview', '/portal'],
  ['Orders', '/portal/orders'],
  ['Billing', '/portal/billing'],
  ['Support', '/portal/support'],
  ['Documents', '/portal/documents'],
  ['Notifications', '/portal/notifications'],
  ['Settings', '/portal/settings'],
]

function PortalFrame({
  title,
  copy,
  children,
}: {
  title: string
  copy: string
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <SkeletonPanel />
      </section>
    )
  }

  if (!user) {
    return (
      <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <PageHeader title="Customer portal" copy="Sign in to manage Catalyx billing, orders, support, documents, rewards, and Grow OS access." />
        <Panel className="mt-6 p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-black text-white">Sign in required</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                The customer portal is scoped to your Catalyx account so orders, support requests, documents, and rewards stay private.
              </p>
            </div>
            <StatusPill tone="amber">Protected</StatusPill>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/login?next=/portal" className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Login</Link>
            <Link href="/signup" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Create account</Link>
          </div>
        </Panel>
      </section>
    )
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <PageHeader title={title} copy={copy} />
      <div className="mt-5 flex gap-2 overflow-x-auto border-b border-white/10 pb-4">
        {portalNav.map(([label, href]) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={`shrink-0 rounded-md px-4 py-3 text-xs font-black uppercase tracking-[0.12em] transition ${
                active ? 'bg-[#c8f500] text-black' : 'border border-white/10 bg-black/20 text-zinc-300 hover:border-[#c8f500]/40 hover:text-white'
              }`}
            >
              {label}
            </Link>
          )
        })}
      </div>
      {children}
    </section>
  )
}

function statusText(value: string | null | undefined) {
  return value ? value.replace(/_/g, ' ') : 'processing'
}

export function PortalHome() {
  const { user } = useAuth()
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [orders, setOrders] = useState<ProductOrderRow[]>([])
  const [documents, setDocuments] = useState<CustomerDocument[]>([])
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [error, setError] = useState('')
  const isPro = isProfessionalLikePlan(user?.plan)

  useEffect(() => {
    let active = true
    Promise.all([
      loadSupportTickets(),
      loadPortalOrders(),
      loadCustomerDocuments(),
      loadPortalNotifications(),
    ])
      .then(([ticketRows, orderRows, documentRows, notificationRows]) => {
        if (!active) return
        setTickets(ticketRows)
        setOrders(orderRows)
        setDocuments(documentRows)
        setNotifications(notificationRows)
      })
      .catch((nextError) => {
        if (active) setError(nextError instanceof Error ? nextError.message : 'Could not load portal data.')
      })
    return () => {
      active = false
    }
  }, [])

  const openTickets = tickets.filter((ticket) => !['resolved', 'closed'].includes(ticket.status))
  const recentOrder = orders[0]
  const unread = notifications.filter((item) => !item.read_at)

  return (
    <PortalFrame title="Customer portal" copy="Your Catalyx account home for orders, billing, support, documents, rewards, and Grow OS shortcuts.">
      {error ? <div className="mt-5"><SaveBanner status="error" message={error} /></div> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Plan" value={isPro ? 'Pro' : 'Free'} note={isPro ? 'Catalyx Pro features are active.' : 'Core Grow OS access is active.'} accent="#c8f500" />
        <MetricCard label="Orders" value={orders.length} note={recentOrder ? `Latest order is ${statusText(recentOrder.status)}.` : 'No signed-in orders yet.'} accent="#33d9ff" />
        <MetricCard label="Support" value={openTickets.length} note={openTickets.length ? 'Open support conversations need attention.' : 'No active support blockers.'} accent="#ff8a1f" />
        <MetricCard label="Documents" value={documents.length} note="Guides, feed charts, labels, and account files." accent="#16d6c8" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Panel className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#c8f500]">Next best account action</p>
              <h2 className="mt-2 text-3xl font-black text-white">
                {openTickets[0] ? 'Check your active support request.' : recentOrder ? 'Review your latest order and receipt reference.' : 'Finish your first signed-in Catalyx order.'}
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-400">
                {openTickets[0]?.last_message_preview ?? recentOrder?.stripe_checkout_session_id ?? 'Start from the product range, then your portal will keep receipts and support history tied to your account.'}
              </p>
            </div>
            <StatusPill tone={openTickets[0] ? 'amber' : 'lime'}>{openTickets[0] ? 'Support active' : 'Account clear'}</StatusPill>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href={openTickets[0] ? '/portal/support' : recentOrder ? '/portal/orders' : '/products'} className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">
              {openTickets[0] ? 'Open support' : recentOrder ? 'View orders' : 'Shop products'}
            </Link>
            <Link href="/dashboard" className="rounded-md border border-white/15 px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Open Grow OS</Link>
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Notifications</p>
              <h2 className="mt-2 text-2xl font-black text-white">{unread.length} unread</h2>
            </div>
            <Link href="/portal/notifications" className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">View all</Link>
          </div>
          <div className="mt-4 grid gap-3">
            {(notifications.length ? notifications.slice(0, 3) : [
              { id: 'empty', title: 'No notifications yet', body: 'Billing, order, reward, support, and security updates will appear here.', notification_type: 'support', read_at: null, href: null, user_id: '', created_at: new Date().toISOString() },
            ]).map((item) => (
              <div key={item.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-white">{item.title}</p>
                  <StatusPill tone={item.read_at ? 'blue' : 'amber'}>{item.read_at ? 'read' : item.notification_type}</StatusPill>
                </div>
                <p className="mt-2 text-sm leading-6 text-zinc-400">{item.body}</p>
              </div>
            ))}
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <RewardsExchangePanel variant="compact" />
        <SubscriptionPanel />
      </div>
    </PortalFrame>
  )
}

export function PortalOrders() {
  return (
    <PortalFrame title="Portal orders" copy="Signed-in Catalyx product orders, receipt references, line items, and support actions.">
      <div className="mt-6">
        <AccountOrderHistory />
      </div>
    </PortalFrame>
  )
}

export function PortalBilling() {
  return (
    <PortalFrame title="Portal billing" copy="View current plan state in Catalyx and launch Stripe Billing Portal for payment methods, invoices, and subscription changes.">
      <div className="mt-6">
        <SubscriptionPanel variant="full" />
      </div>
    </PortalFrame>
  )
}

export function PortalSupport() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [category, setCategory] = useState<TicketCategory>('general')
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadSupportTickets().then(setTickets).catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load support tickets.'))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('saving')
    try {
      const ticket = await createSupportTicket({ subject, body, category })
      setTickets((current) => [ticket, ...current])
      setSubject('')
      setBody('')
      setCategory('general')
      setStatus('saved')
      setMessage('Support ticket created.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Support ticket could not be created.')
    }
  }

  return (
    <PortalFrame title="Portal support" copy="Create order, billing, technical, access, and grow-support tickets tied to your Catalyx account.">
      <div className="mt-6 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Panel className="p-6">
          <h2 className="text-2xl font-black text-white">Create support ticket</h2>
          <form onSubmit={submit} className="mt-5 grid gap-4">
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Subject
              <input value={subject} onChange={(event) => setSubject(event.target.value)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" required />
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Category
              <select value={category} onChange={(event) => setCategory(event.target.value as TicketCategory)} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                <option value="general">General</option>
                <option value="billing">Billing</option>
                <option value="order">Order</option>
                <option value="technical">Technical</option>
                <option value="grow_support">Grow support</option>
                <option value="access">Access</option>
                <option value="feature_request">Feature request</option>
              </select>
            </label>
            <label className="grid gap-2 text-sm font-semibold text-zinc-300">
              Message
              <textarea value={body} onChange={(event) => setBody(event.target.value)} rows={6} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" required />
            </label>
            <button className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Create ticket</button>
          </form>
          <div className="mt-4">
            <SaveBanner status={status} message={message} />
          </div>
        </Panel>

        <Panel className="p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Ticket history</p>
              <h2 className="mt-2 text-2xl font-black text-white">Recent support</h2>
            </div>
            <StatusPill tone="blue">{tickets.length} tickets</StatusPill>
          </div>
          <div className="mt-5 grid gap-3">
            {tickets.length ? tickets.map((ticket) => (
              <div key={ticket.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-black text-white">{ticket.subject}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{ticket.last_message_preview ?? 'Support message received.'}</p>
                    <p className="mt-2 text-xs uppercase tracking-[0.14em] text-zinc-500">{ticket.category} / {formatPortalDate(ticket.updated_at)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <StatusPill tone={ticketStatusTone(ticket.status)}>{ticket.status}</StatusPill>
                    <StatusPill tone={priorityTone(ticket.priority)}>{ticket.priority}</StatusPill>
                  </div>
                </div>
              </div>
            )) : (
              <EmptyState title="No support tickets" body="Create a ticket when you need billing, order, product, or Grow OS support." />
            )}
          </div>
        </Panel>
      </div>
    </PortalFrame>
  )
}

export function PortalDocuments() {
  const [documents, setDocuments] = useState<CustomerDocument[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    loadCustomerDocuments().then(setDocuments).catch((nextError) => setError(nextError instanceof Error ? nextError.message : 'Could not load documents.'))
  }, [])

  return (
    <PortalFrame title="Portal documents" copy="Public Catalyx references plus private customer documents served through signed Supabase Storage links.">
      {error ? <div className="mt-5"><SaveBanner status="error" message={error} /></div> : null}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {documents.map((document) => {
          const href = document.signed_url ?? document.public_url ?? '#'
          const disabled = href === '#'
          return (
            <Panel key={document.id} className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{document.document_type}</p>
                  <h2 className="mt-2 text-xl font-black text-white">{document.title}</h2>
                </div>
                <StatusPill tone={document.is_private ? 'amber' : 'blue'}>{document.is_private ? 'private' : 'public'}</StatusPill>
              </div>
              <p className="mt-3 text-sm leading-6 text-zinc-400">{document.description ?? 'Catalyx customer document.'}</p>
              {disabled ? (
                <span className="mt-5 inline-flex rounded-md border border-white/10 px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-zinc-500">Link pending</span>
              ) : (
                <Link href={href} className="mt-5 inline-flex rounded-md bg-[#c8f500] px-4 py-3 text-xs font-black uppercase tracking-[0.12em] text-black">Open document</Link>
              )}
            </Panel>
          )
        })}
      </div>
    </PortalFrame>
  )
}

export function PortalSettings() {
  const router = useRouter()
  const { user, signOut } = useAuth()
  const [profile, setProfile] = useState<CustomerProfile | null>(null)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')

  useEffect(() => {
    loadPortalProfile().then(setProfile).catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load profile.'))
  }, [])

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!profile) return
    setStatus('saving')
    try {
      const next = await savePortalProfile(profile)
      setProfile(next)
      setStatus('saved')
      setMessage('Portal profile saved.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Profile could not be saved.')
    }
  }

  async function handleSignOut() {
    await signOut()
    router.push('/login')
  }

  return (
    <PortalFrame title="Portal settings" copy="Manage customer profile details, contact preferences, password access, and session controls.">
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_0.8fr]">
        <Panel className="p-6">
          <h2 className="text-2xl font-black text-white">Customer profile</h2>
          {profile ? (
            <form onSubmit={submit} className="mt-5 grid gap-4">
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Company name
                <input value={profile.company_name ?? ''} onChange={(event) => setProfile({ ...profile, company_name: event.target.value })} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Phone
                <input value={profile.phone ?? ''} onChange={(event) => setProfile({ ...profile, phone: event.target.value })} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]" />
              </label>
              <label className="grid gap-2 text-sm font-semibold text-zinc-300">
                Preferred contact
                <select value={profile.preferred_contact_method} onChange={(event) => setProfile({ ...profile, preferred_contact_method: event.target.value as CustomerProfile['preferred_contact_method'] })} className="rounded-md border border-white/10 bg-black px-3 py-3 text-white outline-none focus:border-[#c8f500]">
                  <option value="email">Email</option>
                  <option value="phone">Phone</option>
                  <option value="sms">SMS</option>
                </select>
              </label>
              <button className="rounded-md bg-[#c8f500] px-5 py-3 text-sm font-black uppercase tracking-[0.12em] text-black">Save profile</button>
              <SaveBanner status={status} message={message} />
            </form>
          ) : (
            <SkeletonPanel />
          )}
        </Panel>

        <Panel className="p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Signed in as</p>
          <h2 className="mt-2 text-2xl font-black text-white">{user?.name}</h2>
          <p className="mt-2 text-sm text-zinc-400">{user?.email}</p>
          <div className="mt-5 grid gap-3">
            <Link href="/update-password" className="rounded-md border border-white/15 px-4 py-3 text-center text-sm font-black uppercase tracking-[0.12em] text-white">Update password</Link>
            <button onClick={handleSignOut} className="rounded-md border border-white/15 px-4 py-3 text-sm font-black uppercase tracking-[0.12em] text-white">Sign out</button>
          </div>
        </Panel>
      </div>
    </PortalFrame>
  )
}

export function PortalNotifications() {
  const [notifications, setNotifications] = useState<PortalNotification[]>([])
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const unreadCount = useMemo(() => notifications.filter((item) => !item.read_at).length, [notifications])

  useEffect(() => {
    loadPortalNotifications().then(setNotifications).catch((error) => setMessage(error instanceof Error ? error.message : 'Could not load notifications.'))
  }, [])

  async function markRead(notificationId: string) {
    setStatus('saving')
    try {
      await markPortalNotificationRead(notificationId)
      setNotifications((current) => current.map((item) => item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item))
      setStatus('saved')
      setMessage('Notification marked read.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Notification could not be updated.')
    }
  }

  return (
    <PortalFrame title="Portal notifications" copy="Billing, order, support, reward, Grow OS, and security updates for your Catalyx account.">
      <div className="mt-6">
        <Panel className="p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">Inbox</p>
              <h2 className="mt-2 text-2xl font-black text-white">{unreadCount} unread notifications</h2>
            </div>
            <StatusPill tone={unreadCount ? 'amber' : 'lime'}>{unreadCount ? 'Actionable' : 'Clear'}</StatusPill>
          </div>
          <div className="mt-4">
            <SaveBanner status={status} message={message} />
          </div>
          <div className="mt-5 grid gap-3">
            {notifications.length ? notifications.map((notification) => (
              <div key={notification.id} className="rounded-md border border-white/10 bg-black/30 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-zinc-500">{notification.notification_type}</p>
                    <h3 className="mt-2 font-black text-white">{notification.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-zinc-400">{notification.body}</p>
                  </div>
                  <StatusPill tone={notification.read_at ? 'blue' : 'amber'}>{notification.read_at ? 'read' : 'unread'}</StatusPill>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {notification.href ? <Link href={notification.href} className="rounded-md border border-white/15 px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-white">Open</Link> : null}
                  {!notification.read_at ? <button onClick={() => markRead(notification.id)} className="rounded-md bg-[#c8f500] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-black">Mark read</button> : null}
                </div>
              </div>
            )) : (
              <EmptyState title="No notifications yet" body="Portal updates will appear when billing, order, support, reward, Grow OS, or security events happen." />
            )}
          </div>
        </Panel>
      </div>
    </PortalFrame>
  )
}
