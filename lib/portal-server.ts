import 'server-only'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin, resolveAppUserId } from '@/lib/supabase-admin'

export async function requirePortalUser(request: Request) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return {
      admin: null,
      appUser: null,
      authUser: null,
      response: NextResponse.json(
        { ok: false, error: 'SUPABASE_SERVICE_ROLE_KEY is not configured on the server.' },
        { status: 503 }
      ),
    }
  }

  const token = request.headers.get('authorization')?.replace(/^Bearer\s+/i, '').trim()
  if (!token) {
    return {
      admin: null,
      appUser: null,
      authUser: null,
      response: NextResponse.json({ ok: false, error: 'Sign in required.' }, { status: 401 }),
    }
  }

  const { data, error } = await admin.auth.getUser(token)
  const authUser = data.user
  if (error || !authUser?.email) {
    return {
      admin: null,
      appUser: null,
      authUser: null,
      response: NextResponse.json({ ok: false, error: 'Invalid session.' }, { status: 401 }),
    }
  }

  let appUserId = await resolveAppUserId(admin, authUser.id, authUser.email)
  if (!appUserId) {
    const { data: created, error: createError } = await admin
      .from('users')
      .upsert({
        auth_user_id: authUser.id,
        email: authUser.email,
        full_name: authUser.user_metadata?.name ?? authUser.email.split('@')[0],
        subscription_status: 'free',
      }, { onConflict: 'auth_user_id' })
      .select('id, email, full_name, subscription_status')
      .single()

    if (createError || !created?.id) {
      return {
        admin: null,
        appUser: null,
        authUser: null,
        response: NextResponse.json(
          { ok: false, error: createError?.message ?? 'Could not create app user.' },
          { status: 500 }
        ),
      }
    }
    appUserId = String(created.id)
  }

  const { data: appUser, error: appUserError } = await admin
    .from('users')
    .select('id, email, full_name, subscription_status')
    .eq('id', appUserId)
    .single()

  if (appUserError || !appUser) {
    return {
      admin: null,
      appUser: null,
      authUser: null,
      response: NextResponse.json(
        { ok: false, error: appUserError?.message ?? 'App user not found.' },
        { status: 500 }
      ),
    }
  }

  return { admin, appUser, authUser, response: null }
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status })
}

export function cleanString(value: unknown, maxLength = 1000) {
  return typeof value === 'string' ? value.trim().slice(0, maxLength) : ''
}
