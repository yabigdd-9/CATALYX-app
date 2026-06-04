import { NextResponse } from 'next/server'
import { issueBackendStoreCreditReward } from '@/lib/rewards-backend'

export async function POST(request: Request) {
  let body: { userId?: string; email?: string; rewardId?: string; plan?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid reward redemption request.' }, { status: 400 })
  }

  if (!body.rewardId) {
    return NextResponse.json({ ok: false, error: 'Reward ID is required.' }, { status: 400 })
  }

  try {
    const result = await issueBackendStoreCreditReward({
      userCandidate: body.userId,
      email: body.email,
      rewardId: body.rewardId,
      plan: body.plan,
    })

    return NextResponse.json({
      ok: true,
      creditCents: result.creditCents,
      rewardTitle: result.rewardTitle,
      wallet: {
        balanceCx: result.wallet.balance_cx,
        storeCreditBalanceCents: result.wallet.store_credit_balance_cents,
        pendingStoreCreditCents: result.wallet.pending_store_credit_cents,
        tier: result.wallet.tier,
      },
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Reward redemption failed.' },
      { status: 400 }
    )
  }
}

export const runtime = 'nodejs'
