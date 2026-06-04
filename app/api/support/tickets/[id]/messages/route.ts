import { NextResponse } from 'next/server'
import { cleanString, jsonError, requirePortalUser } from '@/lib/portal-server'

type RouteContext = {
  params: Promise<{ id: string }>
}

export async function GET(request: Request, context: RouteContext) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response
  const { id } = await context.params

  const { data: ticket } = await guard.admin
    .from('support_tickets')
    .select('id')
    .eq('id', id)
    .eq('user_id', guard.appUser.id)
    .maybeSingle()

  if (!ticket) return jsonError('Ticket not found.', 404)

  const { data, error } = await guard.admin
    .from('support_ticket_messages')
    .select('id, ticket_id, user_id, author_role, body, internal, created_at')
    .eq('ticket_id', id)
    .eq('internal', false)
    .order('created_at', { ascending: true })

  if (error) return NextResponse.json({ ok: false, error: error.message, messages: [] }, { status: 500 })
  return NextResponse.json({ ok: true, messages: data ?? [] })
}

export async function POST(request: Request, context: RouteContext) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response
  const { id } = await context.params

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const message = cleanString(body.body, 4000)
  if (!message) return jsonError('Message body is required.')

  const { data: ticket } = await guard.admin
    .from('support_tickets')
    .select('id')
    .eq('id', id)
    .eq('user_id', guard.appUser.id)
    .maybeSingle()

  if (!ticket) return jsonError('Ticket not found.', 404)

  const { data, error } = await guard.admin
    .from('support_ticket_messages')
    .insert({
      ticket_id: id,
      user_id: guard.appUser.id,
      author_role: 'customer',
      body: message,
      internal: false,
    })
    .select('id, ticket_id, user_id, author_role, body, internal, created_at')
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  await guard.admin
    .from('support_tickets')
    .update({ status: 'open', last_message_preview: message.slice(0, 180), updated_at: new Date().toISOString() })
    .eq('id', id)

  await guard.admin.from('portal_events').insert({
    user_id: guard.appUser.id,
    event_type: 'ticket_replied',
    source: 'portal',
    metadata: { ticketId: id },
  })

  return NextResponse.json({ ok: true, message: data })
}

export const runtime = 'nodejs'
