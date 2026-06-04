import 'server-only'

import { createClient, type SupabaseClient } from '@supabase/supabase-js'

function resolveSupabaseUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return undefined

  try {
    return new URL(trimmed).origin
  } catch {
    return trimmed.replace(/\/rest\/v1\/?$/i, '').replace(/\/+$/g, '') || undefined
  }
}

const supabaseUrl = resolveSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL)
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** True when URL + service role key are set (server env only — never expose the key to the client). */
export const hasSupabaseAdmin = Boolean(supabaseUrl && supabaseServiceRoleKey)

let adminClient: SupabaseClient | null = null

/**
 * Supabase client with service role — bypasses RLS.
 * Use only in Route Handlers / server actions (webhooks, admin writes).
 * Never import this module from Client Components.
 */
export function getSupabaseAdmin(): SupabaseClient | null {
  if (!hasSupabaseAdmin || !supabaseUrl || !supabaseServiceRoleKey) return null
  if (!adminClient) {
    adminClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }
  return adminClient
}

export function requireSupabaseAdmin(context: string): SupabaseClient {
  const client = getSupabaseAdmin()
  if (!client) {
    throw new Error(
      `${context} requires SUPABASE_SERVICE_ROLE_KEY (and NEXT_PUBLIC_SUPABASE_URL) in server env only. Do not use NEXT_PUBLIC_ for the service role key.`
    )
  }
  return client
}

export async function resolveAppUserId(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  candidate: string,
  email = ''
) {
  if (isUuid(candidate)) {
    const { data: byId } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('id', candidate)
      .maybeSingle()
    if (byId?.id) return byId.id
  }

  if (candidate) {
    const { data: byAuthId } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('auth_user_id', candidate)
      .maybeSingle()
    if (byAuthId?.id) return byAuthId.id
  }

  if (email) {
    const { data: byEmail } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()
    if (byEmail?.id) return byEmail.id
  }

  return ''
}

export async function findStripeCustomerIdForUser(
  supabaseAdmin: NonNullable<ReturnType<typeof getSupabaseAdmin>>,
  userCandidate: string
) {
  const appUserId = await resolveAppUserId(supabaseAdmin, userCandidate)
  if (!appUserId) return ''

  const { data } = await supabaseAdmin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', appUserId)
    .in('status', ['active', 'trialing', 'past_due'])
    .order('created_at', { ascending: false })
    .limit(10)

  return data?.map((row) => row.stripe_customer_id).find(isStripeCustomerId) ?? ''
}

function isStripeCustomerId(value?: string | null) {
  return Boolean(value?.startsWith('cus_') && !value.startsWith('cus_test_local'))
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}
