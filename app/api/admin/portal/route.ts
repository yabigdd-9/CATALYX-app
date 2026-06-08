import { NextResponse } from 'next/server'
import { cleanString, jsonError } from '@/lib/portal-server'
import { requireAdminRequest } from '@/lib/admin-guard'

export async function GET(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response
  const admin = guard.admin

  const [profiles, tickets, documents, notifications] = await Promise.all([
    admin
      .from('customer_profiles')
      .select('user_id, role, company_name, support_status, preferred_contact_method, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20),
    admin
      .from('support_tickets')
      .select('id, user_id, subject, category, status, priority, last_message_preview, created_at, updated_at')
      .order('updated_at', { ascending: false })
      .limit(20),
    admin
      .from('customer_documents')
      .select('id, user_id, title, document_type, published, is_private, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
    admin
      .from('portal_notifications')
      .select('id, user_id, notification_type, title, read_at, created_at')
      .order('created_at', { ascending: false })
      .limit(20),
  ])

  const error = [profiles, tickets, documents, notifications].find((result) => result.error)?.error
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    profiles: profiles.data ?? [],
    tickets: tickets.data ?? [],
    documents: documents.data ?? [],
    notifications: notifications.data ?? [],
  })
}

export async function PATCH(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const ticketId = cleanString(body.ticket_id, 80)
  const status = cleanString(body.status, 40)
  const priority = cleanString(body.priority, 20)
  if (!ticketId) return jsonError('ticket_id is required.')

  const patch: Record<string, string> = { updated_at: new Date().toISOString() }
  if (['open', 'waiting_on_customer', 'in_review', 'resolved', 'closed'].includes(status)) patch.status = status
  if (['low', 'normal', 'high', 'urgent'].includes(priority)) patch.priority = priority
  if (Object.keys(patch).length === 1) return jsonError('No valid ticket update was provided.')

  const { error } = await guard.admin.from('support_tickets').update(patch).eq('id', ticketId)
  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
