import { NextResponse } from 'next/server'
import { cleanString, jsonError, requirePortalUser } from '@/lib/portal-server'

export async function GET(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  const { data, error } = await guard.admin
    .from('portal_notifications')
    .select('id, user_id, notification_type, title, body, href, read_at, created_at')
    .eq('user_id', guard.appUser.id)
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ ok: false, error: error.message, notifications: [] }, { status: 500 })
  return NextResponse.json({ ok: true, notifications: data ?? [] })
}

export async function PATCH(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const notificationId = cleanString(body.id, 80)
  if (!notificationId) return jsonError('Notification id is required.')

  const { error } = await guard.admin
    .from('portal_notifications')
    .update({ read_at: new Date().toISOString() })
    .eq('id', notificationId)
    .eq('user_id', guard.appUser.id)

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  await guard.admin.from('portal_events').insert({
    user_id: guard.appUser.id,
    event_type: 'notification_read',
    source: 'portal',
    metadata: { notificationId },
  })

  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
