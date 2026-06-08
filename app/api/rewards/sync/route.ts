import { NextResponse } from 'next/server'
import { syncBackendRewardBalance } from '@/lib/rewards-backend'
import { planToMembershipTier } from '@/lib/rewards'

export async function POST(request: Request) {
  let body: { userId?: string; email?: string; tier?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid reward sync request.' }, { status: 400 })
  }

  const tier = planToMembershipTier(body.tier)

  try {
    const result = await syncBackendRewardBalance({
      userCandidate: body.userId,
      email: body.email,
      tier,
    })

    return NextResponse.json({
      ok: result.ok,
      source: result.source,
      wallet: result.wallet ?? null,
      appUserId: result.appUserId ?? '',
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Reward sync failed.' },
      { status: 503 }
    )
  }
}

export const runtime = 'nodejs'
