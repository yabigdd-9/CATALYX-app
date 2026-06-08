import { NextResponse } from 'next/server'
import { requireAdminRequest } from '@/lib/admin-guard'

type FeatureFlagRow = {
  feature_key: string
  plan_required: string
  enabled: boolean
}

export async function GET(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response
  const admin = guard.admin

  const { data, error } = await admin.from('feature_flags').select('feature_key, plan_required, enabled').order('feature_key')

  if (error) {
    return NextResponse.json({ ok: false, error: error.message, flags: [] }, { status: 500 })
  }

  return NextResponse.json({ ok: true, flags: data ?? [] })
}

export async function PATCH(request: Request) {
  const guard = await requireAdminRequest(request)
  if (guard.response || !guard.admin) return guard.response
  const admin = guard.admin

  let body: { flags?: FeatureFlagRow[] }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid JSON body' }, { status: 400 })
  }

  const flags = body.flags ?? []
  if (!flags.length) {
    return NextResponse.json({ ok: false, error: 'No flags provided' }, { status: 400 })
  }

  const { error } = await admin.from('feature_flags').upsert(flags, { onConflict: 'feature_key' })

  if (error) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true, updated: flags.length })
}

export const runtime = 'nodejs'
