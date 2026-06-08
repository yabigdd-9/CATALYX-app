import { NextResponse } from 'next/server'
import { importLegacyRewardSnapshot } from '@/lib/rewards-backend'
import { planToMembershipTier } from '@/lib/rewards'

export async function POST(request: Request) {
  let body: {
    userId?: string
    email?: string
    tier?: string
    legacyBalanceCx?: number
    legacyStoreCreditBalanceCents?: number
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid reward migration request.' }, { status: 400 })
  }

  const legacyBalanceCx = Math.max(0, Math.round(Number(body.legacyBalanceCx ?? 0)))
  const legacyStoreCreditBalanceCents = Math.max(0, Math.round(Number(body.legacyStoreCreditBalanceCents ?? 0)))

  try {
    const result = await importLegacyRewardSnapshot({
      userCandidate: body.userId,
      email: body.email,
      tier: planToMembershipTier(body.tier),
      legacyBalanceCx,
      legacyStoreCreditBalanceCents,
    })

    return NextResponse.json({
      ok: result.ok,
      source: result.source,
      migrated: result.migrated,
      skippedReason: result.skippedReason ?? null,
      wallet: result.wallet ?? null,
      appUserId: result.appUserId ?? '',
    })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Reward migration failed.' },
      { status: 503 }
    )
  }
}

export const runtime = 'nodejs'
