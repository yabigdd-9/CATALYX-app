import { NextResponse } from 'next/server'
import { createStripeCheckout } from '@/lib/stripe'

export async function POST(request: Request) {
  const form = await request.formData()
  const plan = form.get('plan') === 'yearly' ? 'yearly' : 'monthly'
  const userId = String(form.get('userId') ?? '')
  const email = String(form.get('email') ?? '')
  const url = await createStripeCheckout({
    plan,
    userId: userId || undefined,
    email: email || undefined,
  })
  return NextResponse.redirect(url, 303)
}
