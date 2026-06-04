import { NextResponse } from 'next/server'
import { createStripePortal, stripeConfig } from '@/lib/stripe'
import { findStripeCustomerIdForUser, getSupabaseAdmin } from '@/lib/supabase-admin'

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const userId = String(form?.get('userId') ?? '')
  let customerId = String(form?.get('customerId') ?? '')

  const supabaseAdmin = getSupabaseAdmin()
  if (!customerId && userId && supabaseAdmin) {
    customerId = await findStripeCustomerIdForUser(supabaseAdmin, userId)
  }

  if (!isPortalCustomerId(customerId)) {
    return NextResponse.redirect(`${stripeConfig.siteUrl}/account?billing=no-customer`, 303)
  }

  const url = await createStripePortal(customerId).catch(() => `${stripeConfig.siteUrl}/account?billing=portal-error`)
  return NextResponse.redirect(url || `${stripeConfig.siteUrl}/account?billing=portal-error`, 303)
}

function isPortalCustomerId(value?: string | null) {
  return Boolean(value?.startsWith('cus_') && !value.startsWith('cus_test_local'))
}
