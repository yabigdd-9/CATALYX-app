import { NextResponse } from 'next/server'
import { cleanString, jsonError, requirePortalUser } from '@/lib/portal-server'

export async function POST(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  let body: Record<string, unknown>
  try {
    body = await request.json()
  } catch {
    return jsonError('Invalid JSON body')
  }

  const eventType = cleanString(body.event_type, 120)
  if (!eventType) return jsonError('Missing event_type')

  const { error } = await guard.admin.from('portal_events').insert({
    user_id: guard.appUser.id,
    event_type: eventType,
    source: cleanString(body.source, 80) || 'portal',
    metadata: typeof body.metadata === 'object' && body.metadata ? body.metadata : {},
  })

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}

export const runtime = 'nodejs'
