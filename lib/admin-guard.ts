import 'server-only'

import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase-admin'

function configuredAdminEmails() {
  return new Set(
    (process.env.CATALYX_ADMIN_EMAILS ?? '')
      .split(',')
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean)
  )
}

export async function requireAdminRequest(request: Request) {
  const admin = getSupabaseAdmin()
  if (!admin) {
    return {
      admin: null,
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
      response: NextResponse.json({ ok: false, error: 'Admin sign-in required.' }, { status: 401 }),
    }
  }

  const { data, error } = await admin.auth.getUser(token)
  const user = data.user
  if (error || !user?.email) {
    return {
      admin: null,
      response: NextResponse.json({ ok: false, error: 'Invalid admin session.' }, { status: 401 }),
    }
  }

  const emails = configuredAdminEmails()
  const role = typeof user.app_metadata?.role === 'string' ? user.app_metadata.role : ''
  const isAdmin = role === 'admin' || emails.has(user.email.toLowerCase())

  if (!isAdmin) {
    return {
      admin: null,
      response: NextResponse.json({ ok: false, error: 'Admin access required.' }, { status: 403 }),
    }
  }

  return { admin, response: null }
}
