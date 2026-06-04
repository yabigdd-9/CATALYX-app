import { supabaseAuth } from '@/lib/auth'
import { adminFetch } from '@/lib/admin-client'
import { readLocalList, readLocalObject, writeLocalList, writeLocalObject } from '@/lib/persistence'
import type { ProductOrderRow } from '@/lib/supabase-services'

export type { ProductOrderRow }

export type PortalRole = 'customer' | 'pro_customer' | 'stockist' | 'support_admin' | 'admin'
export type TicketStatus = 'open' | 'waiting_on_customer' | 'in_review' | 'resolved' | 'closed'
export type TicketPriority = 'low' | 'normal' | 'high' | 'urgent'
export type TicketCategory = 'general' | 'billing' | 'order' | 'technical' | 'grow_support' | 'access' | 'feature_request'
export type DocumentType = 'invoice' | 'feed_chart' | 'label_pdf' | 'guide' | 'account_file' | 'stockist_file'
export type PortalNotificationType = 'order' | 'billing' | 'support' | 'reward' | 'grow_os' | 'security'

export type CustomerProfile = {
  user_id: string
  role: PortalRole
  company_name: string | null
  phone: string | null
  preferred_contact_method: 'email' | 'phone' | 'sms'
  support_status: string
  notification_preferences: Record<string, boolean>
  created_at?: string
  updated_at?: string
}

export type SupportTicket = {
  id: string
  user_id: string
  product_order_id: string | null
  subject: string
  category: TicketCategory
  status: TicketStatus
  priority: TicketPriority
  last_message_preview: string | null
  created_at: string
  updated_at: string
}

export type SupportTicketMessage = {
  id: string
  ticket_id: string
  user_id: string | null
  author_role: 'customer' | 'support_admin' | 'admin'
  body: string
  internal: boolean
  created_at: string
}

export type CustomerDocument = {
  id: string
  user_id: string | null
  title: string
  document_type: DocumentType
  description: string | null
  public_url: string | null
  storage_bucket: string | null
  storage_path: string | null
  signed_url?: string | null
  is_private: boolean
  published: boolean
  created_at: string
}

export type PortalNotification = {
  id: string
  user_id: string
  notification_type: PortalNotificationType
  title: string
  body: string | null
  href: string | null
  read_at: string | null
  created_at: string
}

const localKeys = {
  profile: 'catalyx-portal-profile',
  tickets: 'catalyx-portal-tickets',
  messages: 'catalyx-portal-ticket-messages',
  notifications: 'catalyx-portal-notifications',
}

export const publicPortalDocuments: CustomerDocument[] = [
  {
    id: 'public-feed-chart',
    user_id: null,
    title: 'Catalyx master feed chart',
    document_type: 'feed_chart',
    description: 'Public nutrient reference for QR labels, product education, and feed planning.',
    public_url: '/feed-chart',
    storage_bucket: null,
    storage_path: null,
    is_private: false,
    published: true,
    created_at: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'public-product-guide',
    user_id: null,
    title: 'Product guide',
    document_type: 'guide',
    description: 'Browse Catalyx product roles, stage support, and usage context.',
    public_url: '/product-guide',
    storage_bucket: null,
    storage_path: null,
    is_private: false,
    published: true,
    created_at: '2026-06-01T00:00:00.000Z',
  },
  {
    id: 'public-label-assets',
    user_id: null,
    title: 'Label and QR assets',
    document_type: 'label_pdf',
    description: 'Public-facing label references and product QR support assets.',
    public_url: '/products',
    storage_bucket: null,
    storage_path: null,
    is_private: false,
    published: true,
    created_at: '2026-06-01T00:00:00.000Z',
  },
]

export function ticketStatusTone(status: TicketStatus) {
  if (status === 'resolved' || status === 'closed') return 'lime' as const
  if (status === 'waiting_on_customer' || status === 'in_review') return 'amber' as const
  return 'blue' as const
}

export function priorityTone(priority: TicketPriority) {
  if (priority === 'urgent' || priority === 'high') return 'red' as const
  if (priority === 'normal') return 'blue' as const
  return 'lime' as const
}

export function formatPortalDate(value?: string | null) {
  if (!value) return 'Date unavailable'
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return 'Date unavailable'
  return new Intl.DateTimeFormat('en-NZ', { dateStyle: 'medium', timeStyle: 'short' }).format(parsed)
}

export function formatPortalMoney(amount: number | null, currency: string | null) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return 'Amount unavailable'
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: (currency ?? 'NZD').toUpperCase(),
    minimumFractionDigits: 2,
  }).format(amount)
}

function defaultProfile(userId = 'local-user'): CustomerProfile {
  return {
    user_id: userId,
    role: 'customer',
    company_name: null,
    phone: null,
    preferred_contact_method: 'email',
    support_status: 'standard',
    notification_preferences: {
      billing: true,
      orders: true,
      support: true,
      rewards: true,
      grow_os: true,
      security: true,
    },
  }
}

async function portalJson<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await adminFetch(input, init)
  const payload = await response.json().catch(() => null) as { ok?: boolean; error?: string } | null
  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error ?? 'Portal request failed.')
  }
  return payload as T
}

export async function loadPortalProfile(): Promise<CustomerProfile> {
  if (!supabaseAuth) return readLocalObject<CustomerProfile>(localKeys.profile, defaultProfile())
  const { profile } = await portalJson<{ profile: CustomerProfile }>('/api/portal/profile')
  return profile
}

export async function savePortalProfile(input: Partial<CustomerProfile>): Promise<CustomerProfile> {
  if (!supabaseAuth) {
    const next = { ...readLocalObject<CustomerProfile>(localKeys.profile, defaultProfile()), ...input }
    writeLocalObject(localKeys.profile, next)
    return next
  }

  const { profile } = await portalJson<{ profile: CustomerProfile }>('/api/portal/profile', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
  return profile
}

export async function loadSupportTickets(): Promise<SupportTicket[]> {
  if (!supabaseAuth) return readLocalList<SupportTicket>(localKeys.tickets)
  const { tickets } = await portalJson<{ tickets: SupportTicket[] }>('/api/support/tickets')
  return tickets
}

export async function createSupportTicket(input: {
  subject: string
  body: string
  category: TicketCategory
  priority?: TicketPriority
  productOrderId?: string | null
}): Promise<SupportTicket> {
  const subject = input.subject.trim()
  const body = input.body.trim()
  if (!subject || !body) throw new Error('Ticket subject and message are required.')

  if (!supabaseAuth) {
    const now = new Date().toISOString()
    const ticket: SupportTicket = {
      id: `local-ticket-${Date.now()}`,
      user_id: 'local-user',
      product_order_id: input.productOrderId ?? null,
      subject,
      category: input.category,
      status: 'open',
      priority: input.priority ?? 'normal',
      last_message_preview: body.slice(0, 180),
      created_at: now,
      updated_at: now,
    }
    writeLocalList(localKeys.tickets, [ticket, ...readLocalList<SupportTicket>(localKeys.tickets)].slice(0, 30))
    writeLocalList(localKeys.messages, [
      {
        id: `local-message-${Date.now()}`,
        ticket_id: ticket.id,
        user_id: 'local-user',
        author_role: 'customer',
        body,
        internal: false,
        created_at: now,
      },
      ...readLocalList<SupportTicketMessage>(localKeys.messages),
    ])
    return ticket
  }

  const { ticket } = await portalJson<{ ticket: SupportTicket }>('/api/support/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      product_order_id: input.productOrderId ?? null,
      subject,
      category: input.category,
      priority: input.priority ?? 'normal',
      body,
    }),
  })
  return ticket
}

export async function addSupportTicketMessage(ticketId: string, body: string): Promise<SupportTicketMessage> {
  const messageBody = body.trim()
  if (!ticketId || !messageBody) throw new Error('Ticket and message are required.')
  if (!supabaseAuth) {
    const message: SupportTicketMessage = {
      id: `local-message-${Date.now()}`,
      ticket_id: ticketId,
      user_id: 'local-user',
      author_role: 'customer',
      body: messageBody,
      internal: false,
      created_at: new Date().toISOString(),
    }
    writeLocalList(localKeys.messages, [message, ...readLocalList<SupportTicketMessage>(localKeys.messages)])
    return message
  }

  const { message } = await portalJson<{ message: SupportTicketMessage }>(`/api/support/tickets/${ticketId}/messages`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ body: messageBody }),
  })
  return message
}

export async function loadCustomerDocuments(): Promise<CustomerDocument[]> {
  if (!supabaseAuth) return publicPortalDocuments
  const { documents } = await portalJson<{ documents: CustomerDocument[] }>('/api/documents')
  return documents
}

export async function loadPortalNotifications(): Promise<PortalNotification[]> {
  if (!supabaseAuth) {
    const fallback: PortalNotification[] = [
      {
        id: 'local-welcome',
        user_id: 'local-user',
        notification_type: 'grow_os',
        title: 'Portal ready',
        body: 'Billing, orders, support, rewards, documents, and Grow OS shortcuts now live in one place.',
        href: '/portal',
        read_at: null,
        created_at: new Date().toISOString(),
      },
    ]
    return readLocalList<PortalNotification>(localKeys.notifications, fallback)
  }
  const { notifications } = await portalJson<{ notifications: PortalNotification[] }>('/api/notifications')
  return notifications
}

export async function markPortalNotificationRead(notificationId: string): Promise<void> {
  if (!notificationId) return
  if (!supabaseAuth) {
    writeLocalList(
      localKeys.notifications,
      readLocalList<PortalNotification>(localKeys.notifications).map((item) =>
        item.id === notificationId ? { ...item, read_at: new Date().toISOString() } : item
      )
    )
    return
  }
  await portalJson('/api/notifications', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id: notificationId }),
  })
}

export async function logPortalEvent(eventType: string, metadata: Record<string, unknown> = {}) {
  if (!supabaseAuth) return
  await portalJson('/api/portal/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      event_type: eventType,
      source: 'portal',
      metadata,
    }),
  })
}

export async function loadPortalOrders(): Promise<ProductOrderRow[]> {
  if (!supabaseAuth) return []
  const { orders } = await portalJson<{ orders: ProductOrderRow[] }>('/api/portal/orders')
  return orders
}
