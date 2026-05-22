import { NextResponse } from 'next/server'
import { createStripePortal, stripeConfig } from '@/lib/stripe'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: Request) {
  const form = await request.formData().catch(() => null)
  const userId = String(form?.get('userId') ?? '')
  let customerId = String(form?.get('customerId') ?? '')

  if (!customerId && userId && supabaseAdmin) {
    const { data } = await supabaseAdmin
      .from('subscriptions')
      .select('stripe_customer_id')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()
    customerId = data?.stripe_customer_id ?? ''
  }

  const url = await createStripePortal(customerId || undefined).catch(() => `${stripeConfig.siteUrl}/profile?portal=configuration-error`)
  return NextResponse.redirect(url || `${stripeConfig.siteUrl}/profile?mockPortal=1`, 303)
}
