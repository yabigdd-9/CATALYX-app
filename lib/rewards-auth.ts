import 'server-only'

import { NextResponse } from 'next/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { requirePortalUser } from '@/lib/portal-server'
import { planToMembershipTier, type CxMembershipTier } from '@/lib/rewards'

type WalletRow = {
  balance_cx?: number | null
  tier?: string | null
  store_credit_balance_cents?: number | null
  pending_store_credit_cents?: number | null
}

export async function requireRewardUser(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.admin || !guard.appUser || !guard.authUser) {
    return {
      admin: null,
      appUser: null,
      authUser: null,
      tier: 'free' as CxMembershipTier,
      response: guard.response ?? NextResponse.json({ ok: false, error: 'Sign in required.' }, { status: 401 }),
    }
  }

  const tier = await loadAuthoritativeRewardTier(guard.admin, String(guard.appUser.id))
  return { admin: guard.admin, appUser: guard.appUser, authUser: guard.authUser, tier, response: null }
}

export function mapRewardWallet(wallet?: WalletRow | null) {
  if (!wallet) return null
  const tier = wallet.tier === 'yearly' || wallet.tier === 'monthly' ? wallet.tier : 'free'
  return {
    balanceCx: Math.max(0, Number(wallet.balance_cx ?? 0)),
    tier,
    storeCreditBalanceCents: Math.max(0, Number(wallet.store_credit_balance_cents ?? 0)),
    pendingStoreCreditCents: Math.max(0, Number(wallet.pending_store_credit_cents ?? 0)),
  }
}

async function loadAuthoritativeRewardTier(admin: SupabaseClient, appUserId: string): Promise<CxMembershipTier> {
  const { data: planRow } = await admin
    .from('user_plan')
    .select('plan')
    .eq('user_id', appUserId)
    .maybeSingle()

  const directPlan = String(planRow?.plan ?? '')
  if (directPlan) return planToMembershipTier(directPlan)

  const { data: subscription } = await admin
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', appUserId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  const active = ['active', 'trialing'].includes(String(subscription?.status ?? ''))
  return active ? planToMembershipTier(String(subscription?.plan ?? 'free')) : 'free'
}
