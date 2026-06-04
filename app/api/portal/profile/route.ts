import { NextResponse } from 'next/server'
import { cleanString, jsonError, requirePortalUser } from '@/lib/portal-server'

const defaultPreferences = {
  billing: true,
  orders: true,
  support: true,
  rewards: true,
  grow_os: true,
  security: true,
}

export async function GET(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser) return guard.response

  const { data, error } = await guard.admin
    .from('customer_profiles')
    .select('user_id, role, company_name, phone, preferred_contact_method, support_status, notification_preferences, created_at, updated_at')
    .eq('user_id', guard.appUser.id)
    .maybeSingle()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })

  return NextResponse.json({
    ok: true,
    profile: data ?? {
      user_id: guard.appUser.id,
      role: guard.appUser.subscription_status?.includes('professional') ? 'pro_customer' : 'customer',
      company_name: null,
      phone: null,
      preferred_contact_method: 'email',
      support_status: 'standard',
      notification_preferences: defaultPreferences,
    },
  })
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

  const preferred = cleanString(body.preferred_contact_method, 20)
  const { data: existing } = await guard.admin
    .from('customer_profiles')
    .select('role, support_status, notification_preferences')
    .eq('user_id', guard.appUser.id)
    .maybeSingle()

  const fallbackRole = guard.appUser.subscription_status?.includes('professional') ? 'pro_customer' : 'customer'
  const payload = {
    user_id: guard.appUser.id,
    role: String(existing?.role ?? fallbackRole),
    company_name: cleanString(body.company_name, 160) || null,
    phone: cleanString(body.phone, 40) || null,
    preferred_contact_method: ['email', 'phone', 'sms'].includes(preferred) ? preferred : 'email',
    support_status: String(existing?.support_status ?? 'standard'),
    notification_preferences:
      typeof body.notification_preferences === 'object' && body.notification_preferences
        ? body.notification_preferences
        : existing?.notification_preferences ?? defaultPreferences,
    updated_at: new Date().toISOString(),
  }

  const { data, error } = await guard.admin
    .from('customer_profiles')
    .upsert(payload, { onConflict: 'user_id' })
    .select('user_id, role, company_name, phone, preferred_contact_method, support_status, notification_preferences, created_at, updated_at')
    .single()

  if (error) return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true, profile: data })
}

export const runtime = 'nodejs'
