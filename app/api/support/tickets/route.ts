import { NextResponse } from 'next/server'
import { cleanString, jsonError, requirePortalUser } from '@/lib/portal-server'

const categories = new Set(['general', 'billing', 'order', 'technical', 'grow_support', 'access', 'feature_request'])
const priorities = new Set(['low', 'normal', 'high', 'urgent'])

export async function GET(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  const { data, error } = await guard.admin
    .from('support_tickets')
    .select('id, user_id, product_order_id, subject, category, status, priority, last_message_preview, created_at, updated_at')
    .eq('user_id', guard.appUser.id)
    .order('updated_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: error.message, tickets: [] }, { status: 500 })
  return NextResponse.json({ ok: true, tickets: data ?? [] })
}

export async function POST(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const subject = cleanString(body.subject, 180)
  const message = cleanString(body.body, 4000)
  const category = cleanString(body.category, 40)
  const priority = cleanString(body.priority, 20)
  const productOrderId = cleanString(body.product_order_id, 80) || null
  if (!subject || !message) return jsonError('Ticket subject and message are required.')

  if (productOrderId) {
    const { data: order } = await guard.admin
      .from('product_orders')
      .select('id')
      .eq('id', productOrderId)
      .eq('user_id', guard.appUser.id)
      .maybeSingle()

    if (!order) return jsonError('Order not found for this account.', 404)
  }

  const { data: ticket, error: ticketError } = await guard.admin
    .from('support_tickets')
    .insert({
      user_id: guard.appUser.id,
      product_order_id: productOrderId,
      subject,
      category: categories.has(category) ? category : 'general',
      priority: priorities.has(priority) ? priority : 'normal',
      last_message_preview: message.slice(0, 180),
    })
    .select('id, user_id, product_order_id, subject, category, status, priority, last_message_preview, created_at, updated_at')
    .single()

  if (ticketError || !ticket) {
    return NextResponse.json({ ok: false, error: ticketError?.message ?? 'Ticket could not be created.' }, { status: 500 })
  }

  const { error: messageError } = await guard.admin.from('support_ticket_messages').insert({
    ticket_id: ticket.id,
    user_id: guard.appUser.id,
    author_role: 'customer',
    body: message,
    internal: false,
  })

  if (messageError) return NextResponse.json({ ok: false, error: messageError.message }, { status: 500 })

  await guard.admin.from('portal_events').insert({
    user_id: guard.appUser.id,
    event_type: 'ticket_created',
    source: 'portal',
    metadata: { ticketId: ticket.id, category: ticket.category },
  })

  return NextResponse.json({ ok: true, ticket })
}

export const runtime = 'nodejs'
