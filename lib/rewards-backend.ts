import 'server-only'

import { getSupabaseAdmin, resolveAppUserId } from '@/lib/supabase-admin'

type RewardTier = 'free' | 'monthly' | 'yearly'

const MINIMUM_CREDIT_ORDER_SUBTOTAL_CENTS = 6000
const STORE_CREDIT_VALUE_PER_100_CX: Record<RewardTier, number> = {
  free: 1,
  monthly: 1.5,
  yearly: 2,
}

const STORE_CREDIT_REWARD_MAP = {
  'store-credit-500': { title: '$5 Store Credit', costCx: 500, minimumTier: 'free' as const },
  'store-credit-1000': { title: '$10 Store Credit', costCx: 1000, minimumTier: 'free' as const },
  'store-credit-2500': { title: '$25 Store Credit', costCx: 2500, minimumTier: 'free' as const },
  'store-credit-5000': { title: '$50 Store Credit', costCx: 5000, minimumTier: 'free' as const },
  'store-credit-10000': { title: '$100 Store Credit', costCx: 10000, minimumTier: 'monthly' as const },
}

type StoreCreditRewardId = keyof typeof STORE_CREDIT_REWARD_MAP

type RewardWalletRow = {
  id: string
  user_id: string
  balance_cx: number
  tier: RewardTier
  store_credit_balance_cents: number
  pending_store_credit_cents: number
  lifetime_store_credit_earned_cents: number
  lifetime_store_credit_redeemed_cents: number
}

export type BackendRewardWalletSummary = {
  ok: boolean
  availableStoreCreditCents: number
  pendingStoreCreditCents: number
  storeCreditBalanceCents: number
  balanceCx: number
  tier: RewardTier
  appUserId: string
  source: 'supabase' | 'unavailable'
}

type RewardWalletContext = {
  wallet: RewardWalletRow
  appUserId: string
}

export async function getBackendRewardWallet({
  userCandidate,
  email,
}: {
  userCandidate?: string
  email?: string
}): Promise<BackendRewardWalletSummary> {
  const context = await getWalletContext({ userCandidate, email, createIfMissing: false })
  if (!context) {
    return {
      ok: false,
      availableStoreCreditCents: 0,
      pendingStoreCreditCents: 0,
      storeCreditBalanceCents: 0,
      balanceCx: 0,
      tier: 'free',
      appUserId: '',
      source: 'unavailable',
    }
  }

  return {
    ok: true,
    availableStoreCreditCents: Math.max(0, context.wallet.store_credit_balance_cents - context.wallet.pending_store_credit_cents),
    pendingStoreCreditCents: Math.max(0, context.wallet.pending_store_credit_cents),
    storeCreditBalanceCents: Math.max(0, context.wallet.store_credit_balance_cents),
    balanceCx: Math.max(0, context.wallet.balance_cx),
    tier: context.wallet.tier,
    appUserId: context.appUserId,
    source: 'supabase',
  }
}

export async function syncBackendRewardBalance({
  userCandidate,
  email,
  balanceCx,
  tier,
}: {
  userCandidate?: string
  email?: string
  balanceCx: number
  tier: RewardTier
}) {
  const context = await getWalletContext({ userCandidate, email, createIfMissing: true })
  if (!context) return { ok: false as const, source: 'unavailable' as const }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return { ok: false as const, source: 'unavailable' as const }

  const nextBalance = Math.max(0, Math.round(balanceCx))
  const { data, error } = await supabaseAdmin
    .from('cx_reward_wallets')
    .update({
      balance_cx: nextBalance,
      tier,
      last_synced_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', context.wallet.id)
    .select('id, user_id, balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents, lifetime_store_credit_earned_cents, lifetime_store_credit_redeemed_cents')
    .single()

  if (error) throw error
  return { ok: true as const, source: 'supabase' as const, wallet: mapWalletRow(data), appUserId: context.appUserId }
}

export async function issueBackendStoreCreditReward({
  userCandidate,
  email,
  rewardId,
  plan,
}: {
  userCandidate?: string
  email?: string
  rewardId: string
  plan?: string
}) {
  const reward = STORE_CREDIT_REWARD_MAP[rewardId as StoreCreditRewardId]
  if (!reward) throw new Error('Unsupported store-credit reward.')

  const tier = rewardTierFromPlan(plan)
  if (!tierMeetsMinimum(tier, reward.minimumTier)) {
    throw new Error('Upgrade required for this reward.')
  }

  const context = await getWalletContext({ userCandidate, email, createIfMissing: true })
  if (!context) throw new Error('Sign in before redeeming store credit.')

  if (context.wallet.balance_cx < reward.costCx) {
    throw new Error('Not enough CX yet.')
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('Backend reward wallet is unavailable.')

  const now = new Date().toISOString()
  const creditCents = cxToStoreCreditCents(reward.costCx, tier)
  const redemptionKey = `reward-${context.appUserId}-${rewardId}-${Date.now()}`

  const { data: redemptionRow, error: redemptionError } = await supabaseAdmin
    .from('cx_reward_redemptions')
    .insert({
      user_id: context.appUserId,
      reward_id: rewardId,
      reward_title: reward.title,
      reward_kind: 'store_credit',
      redemption_key: redemptionKey,
      cx_cost: reward.costCx,
      credit_cents: creditCents,
      tier_at_issue: tier,
      status: 'issued',
      metadata: {
        redemption_origin: 'rewards_hub',
      },
      updated_at: now,
    })
    .select('id')
    .single()

  if (redemptionError) throw redemptionError

  const { data: walletRow, error: walletError } = await supabaseAdmin
    .from('cx_reward_wallets')
    .update({
      balance_cx: Math.max(0, context.wallet.balance_cx - reward.costCx),
      tier,
      store_credit_balance_cents: context.wallet.store_credit_balance_cents + creditCents,
      lifetime_store_credit_earned_cents: context.wallet.lifetime_store_credit_earned_cents + creditCents,
      last_synced_at: now,
      updated_at: now,
    })
    .eq('id', context.wallet.id)
    .select('id, user_id, balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents, lifetime_store_credit_earned_cents, lifetime_store_credit_redeemed_cents')
    .single()

  if (walletError) throw walletError

  await writeLedgerEvent({
    userId: context.appUserId,
    walletId: context.wallet.id,
    redemptionId: String(redemptionRow.id),
    eventType: 'reward_issued',
    source: 'reward_redemption',
    pointsDelta: -reward.costCx,
    storeCreditDeltaCents: creditCents,
    title: reward.title,
    detail: `${creditCents} cents added to backend-tracked store credit.`,
    metadata: {
      reward_id: rewardId,
      tier,
    },
  })

  return {
    ok: true as const,
    creditCents,
    rewardTitle: reward.title,
    wallet: mapWalletRow(walletRow),
  }
}

export async function reserveBackendStoreCreditForCheckout({
  userCandidate,
  email,
  requestedCreditCents,
  subtotalCents,
}: {
  userCandidate?: string
  email?: string
  requestedCreditCents: number
  subtotalCents: number
}) {
  const requested = Math.max(0, Math.round(requestedCreditCents))
  if (!requested) {
    return {
      ok: true as const,
      appliedCreditCents: 0,
      rewardRedemptionId: '',
      wallet: null,
      appUserId: '',
    }
  }

  const context = await getWalletContext({ userCandidate, email, createIfMissing: false })
  if (!context) throw new Error('Sign in before using store credit.')

  if (subtotalCents < MINIMUM_CREDIT_ORDER_SUBTOTAL_CENTS) {
    throw new Error(`Store credit requires a subtotal of at least ${formatMoney(MINIMUM_CREDIT_ORDER_SUBTOTAL_CENTS)}.`)
  }

  const available = Math.max(0, context.wallet.store_credit_balance_cents - context.wallet.pending_store_credit_cents)
  if (available <= 0) throw new Error('No backend store credit is available.')

  const appliedCreditCents = Math.min(requested, available, subtotalCents)
  if (appliedCreditCents <= 0) {
    return {
      ok: true as const,
      appliedCreditCents: 0,
      rewardRedemptionId: '',
      wallet: context.wallet,
      appUserId: context.appUserId,
    }
  }

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) throw new Error('Backend reward wallet is unavailable.')

  const now = new Date().toISOString()
  const redemptionKey = `checkout-credit-${context.appUserId}-${Date.now()}`
  const { data: redemption, error: redemptionError } = await supabaseAdmin
    .from('cx_reward_redemptions')
    .insert({
      user_id: context.appUserId,
      reward_id: 'wallet-store-credit',
      reward_title: 'Wallet Store Credit',
      reward_kind: 'store_credit',
      redemption_key: redemptionKey,
      credit_cents: appliedCreditCents,
      tier_at_issue: context.wallet.tier,
      status: 'reserved',
      metadata: {
        subtotal_cents: subtotalCents,
      },
      updated_at: now,
    })
    .select('id')
    .single()

  if (redemptionError) throw redemptionError

  const { data: walletRow, error: walletError } = await supabaseAdmin
    .from('cx_reward_wallets')
    .update({
      pending_store_credit_cents: context.wallet.pending_store_credit_cents + appliedCreditCents,
      updated_at: now,
    })
    .eq('id', context.wallet.id)
    .select('id, user_id, balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents, lifetime_store_credit_earned_cents, lifetime_store_credit_redeemed_cents')
    .single()

  if (walletError) throw walletError

  await writeLedgerEvent({
    userId: context.appUserId,
    walletId: context.wallet.id,
    redemptionId: String(redemption.id),
    eventType: 'credit_reserved',
    source: 'checkout',
    storeCreditDeltaCents: -appliedCreditCents,
    title: 'Store credit reserved',
    detail: 'Store credit reserved for an active checkout session.',
    metadata: {
      subtotal_cents: subtotalCents,
    },
  })

  return {
    ok: true as const,
    appliedCreditCents,
    rewardRedemptionId: String(redemption.id),
    wallet: mapWalletRow(walletRow),
    appUserId: context.appUserId,
  }
}

export async function finalizeBackendStoreCreditCheckout({
  rewardRedemptionId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  productOrderId,
}: {
  rewardRedemptionId?: string
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  productOrderId?: string
}) {
  await mutateReservedStoreCredit({
    rewardRedemptionId,
    stripeCheckoutSessionId,
    stripePaymentIntentId,
    productOrderId,
    nextStatus: 'applied',
    releaseOnly: false,
  })
}

export async function releaseBackendStoreCreditCheckout({
  rewardRedemptionId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
}: {
  rewardRedemptionId?: string
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
}) {
  await mutateReservedStoreCredit({
    rewardRedemptionId,
    stripeCheckoutSessionId,
    stripePaymentIntentId,
    nextStatus: 'cancelled',
    releaseOnly: true,
  })
}

export async function restoreBackendStoreCreditFromRefund({
  stripePaymentIntentId,
  refundAmountCents,
}: {
  stripePaymentIntentId?: string
  refundAmountCents: number
}) {
  const paymentIntentId = stripePaymentIntentId ?? ''
  if (!paymentIntentId || refundAmountCents <= 0) return

  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  const { data: redemption } = await supabaseAdmin
    .from('cx_reward_redemptions')
    .select('id, user_id, product_order_id, credit_cents, status')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .eq('status', 'applied')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (!redemption?.user_id) return

  const creditCents = Math.min(Math.max(0, Math.round(refundAmountCents)), Number(redemption.credit_cents ?? 0))
  if (creditCents <= 0) return

  const walletContext = await getWalletContext({ userCandidate: redemption.user_id, createIfMissing: false })
  if (!walletContext) return

  const now = new Date().toISOString()
  await supabaseAdmin
    .from('cx_reward_wallets')
    .update({
      store_credit_balance_cents: walletContext.wallet.store_credit_balance_cents + creditCents,
      lifetime_store_credit_redeemed_cents: Math.max(0, walletContext.wallet.lifetime_store_credit_redeemed_cents - creditCents),
      updated_at: now,
    })
    .eq('id', walletContext.wallet.id)

  await supabaseAdmin
    .from('cx_reward_redemptions')
    .update({
      status: 'refunded',
      updated_at: now,
      metadata: {
        refund_amount_cents: creditCents,
      },
    })
    .eq('id', redemption.id)

  await writeLedgerEvent({
    userId: redemption.user_id,
    walletId: walletContext.wallet.id,
    redemptionId: String(redemption.id),
    productOrderId: redemption.product_order_id ? String(redemption.product_order_id) : undefined,
    stripePaymentIntentId: paymentIntentId,
    eventType: 'credit_restored',
    source: 'refund',
    storeCreditDeltaCents: creditCents,
    title: 'Store credit restored after refund',
    detail: 'Previously applied store credit was restored after a refund.',
    metadata: {
      refund_amount_cents: creditCents,
    },
  })
}

async function mutateReservedStoreCredit({
  rewardRedemptionId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  productOrderId,
  nextStatus,
  releaseOnly,
}: {
  rewardRedemptionId?: string
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  productOrderId?: string
  nextStatus: 'applied' | 'cancelled'
  releaseOnly: boolean
}) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  const targetRedemptionId = rewardRedemptionId ?? ''
  const redemptionQuery = supabaseAdmin
    .from('cx_reward_redemptions')
    .select('id, user_id, credit_cents, stripe_checkout_session_id, product_order_id')
    .eq('status', 'reserved')

  const redemptionResult = targetRedemptionId
    ? await redemptionQuery.eq('id', targetRedemptionId).maybeSingle()
    : await redemptionQuery.eq('stripe_checkout_session_id', stripeCheckoutSessionId ?? '').maybeSingle()

  const redemption = redemptionResult.data
  if (!redemption?.user_id) return

  const walletContext = await getWalletContext({ userCandidate: redemption.user_id, createIfMissing: false })
  if (!walletContext) return

  const creditCents = Math.max(0, Number(redemption.credit_cents ?? 0))
  const nextPending = Math.max(0, walletContext.wallet.pending_store_credit_cents - creditCents)
  const nextBalance = releaseOnly
    ? walletContext.wallet.store_credit_balance_cents
    : Math.max(0, walletContext.wallet.store_credit_balance_cents - creditCents)
  const nextRedeemed = releaseOnly
    ? walletContext.wallet.lifetime_store_credit_redeemed_cents
    : walletContext.wallet.lifetime_store_credit_redeemed_cents + creditCents
  const now = new Date().toISOString()

  await supabaseAdmin
    .from('cx_reward_wallets')
    .update({
      pending_store_credit_cents: nextPending,
      store_credit_balance_cents: nextBalance,
      lifetime_store_credit_redeemed_cents: nextRedeemed,
      updated_at: now,
    })
    .eq('id', walletContext.wallet.id)

  await supabaseAdmin
    .from('cx_reward_redemptions')
    .update({
      status: nextStatus,
      stripe_checkout_session_id: stripeCheckoutSessionId ?? redemption.stripe_checkout_session_id,
      stripe_payment_intent_id: stripePaymentIntentId ?? null,
      product_order_id: productOrderId ?? redemption.product_order_id,
      updated_at: now,
    })
    .eq('id', redemption.id)

  await writeLedgerEvent({
    userId: redemption.user_id,
    walletId: walletContext.wallet.id,
    redemptionId: String(redemption.id),
    productOrderId,
    stripeCheckoutSessionId,
    stripePaymentIntentId,
    eventType: releaseOnly ? 'credit_released' : 'credit_applied',
    source: releaseOnly ? 'checkout_release' : 'checkout',
    storeCreditDeltaCents: releaseOnly ? 0 : -creditCents,
    title: releaseOnly ? 'Store credit released' : 'Store credit applied',
    detail: releaseOnly ? 'Reserved store credit was released back to the wallet.' : 'Reserved store credit was applied to a paid order.',
  })
}

async function getWalletContext({
  userCandidate,
  email,
  createIfMissing,
}: {
  userCandidate?: string
  email?: string
  createIfMissing: boolean
}): Promise<RewardWalletContext | null> {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return null

  const appUserId = await resolveAppUserId(supabaseAdmin, userCandidate ?? '', email ?? '')
  if (!appUserId) return null

  const existing = await supabaseAdmin
    .from('cx_reward_wallets')
    .select('id, user_id, balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents, lifetime_store_credit_earned_cents, lifetime_store_credit_redeemed_cents')
    .eq('user_id', appUserId)
    .maybeSingle()

  if (existing.data) {
    return {
      wallet: mapWalletRow(existing.data),
      appUserId,
    }
  }

  if (!createIfMissing) return null

  const { data, error } = await supabaseAdmin
    .from('cx_reward_wallets')
    .insert({
      user_id: appUserId,
      balance_cx: 0,
      tier: 'free',
      store_credit_balance_cents: 0,
      pending_store_credit_cents: 0,
      lifetime_store_credit_earned_cents: 0,
      lifetime_store_credit_redeemed_cents: 0,
    })
    .select('id, user_id, balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents, lifetime_store_credit_earned_cents, lifetime_store_credit_redeemed_cents')
    .single()

  if (error) throw error

  return {
    wallet: mapWalletRow(data),
    appUserId,
  }
}

async function writeLedgerEvent({
  userId,
  walletId,
  redemptionId,
  productOrderId,
  stripeCheckoutSessionId,
  stripePaymentIntentId,
  eventType,
  source,
  pointsDelta = 0,
  storeCreditDeltaCents = 0,
  title,
  detail,
  metadata = {},
}: {
  userId: string
  walletId?: string
  redemptionId?: string
  productOrderId?: string
  stripeCheckoutSessionId?: string
  stripePaymentIntentId?: string
  eventType: string
  source: string
  pointsDelta?: number
  storeCreditDeltaCents?: number
  title: string
  detail: string
  metadata?: Record<string, string | number | boolean>
}) {
  const supabaseAdmin = getSupabaseAdmin()
  if (!supabaseAdmin) return

  await supabaseAdmin.from('cx_reward_ledger').insert({
    user_id: userId,
    wallet_id: walletId ?? null,
    redemption_id: redemptionId ?? null,
    product_order_id: productOrderId ?? null,
    stripe_checkout_session_id: stripeCheckoutSessionId ?? null,
    stripe_payment_intent_id: stripePaymentIntentId ?? null,
    event_type: eventType,
    source,
    points_delta: pointsDelta,
    store_credit_delta_cents: storeCreditDeltaCents,
    title,
    detail,
    metadata,
  })
}

function mapWalletRow(row: Record<string, unknown>): RewardWalletRow {
  return {
    id: String(row.id ?? ''),
    user_id: String(row.user_id ?? ''),
    balance_cx: Number(row.balance_cx ?? 0),
    tier: rewardTierFromPlan(String(row.tier ?? 'free')),
    store_credit_balance_cents: Number(row.store_credit_balance_cents ?? 0),
    pending_store_credit_cents: Number(row.pending_store_credit_cents ?? 0),
    lifetime_store_credit_earned_cents: Number(row.lifetime_store_credit_earned_cents ?? 0),
    lifetime_store_credit_redeemed_cents: Number(row.lifetime_store_credit_redeemed_cents ?? 0),
  }
}

function rewardTierFromPlan(plan?: string) {
  if (plan === 'yearly' || plan === 'professional_yearly') return 'yearly'
  if (plan === 'monthly' || plan === 'professional_monthly' || plan === 'professional') return 'monthly'
  return 'free'
}

function tierMeetsMinimum(current: RewardTier, minimum: RewardTier) {
  const order: RewardTier[] = ['free', 'monthly', 'yearly']
  return order.indexOf(current) >= order.indexOf(minimum)
}

function cxToStoreCreditCents(costCx: number, tier: RewardTier) {
  return Math.max(0, Math.round(costCx * STORE_CREDIT_VALUE_PER_100_CX[tier]))
}

function formatMoney(cents: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(cents / 100)
}
