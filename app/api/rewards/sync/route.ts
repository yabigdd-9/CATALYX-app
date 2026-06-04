import { NextResponse } from 'next/server'
import { syncBackendRewardBalance } from '@/lib/rewards-backend'

export async function POST(request: Request) {
  let body: { userId?: string; email?: string; balanceCx?: number; tier?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: 'Invalid reward sync request.' }, { status: 400 })
  }

  const balanceCx = Math.max(0, Math.round(Number(body.balanceCx ?? 0)))
  const tier = body.tier === 'yearly' || body.tier === 'monthly' ? body.tier : 'free'

  try {
    const result = await syncBackendRewardBalance({
      userCandidate: body.userId,
      email: body.email,
      balanceCx,
      tier,
    })

    return NextResponse.json({ ok: result.ok, source: result.source })
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : 'Reward sync failed.' },
      { status: 503 }
    )
  }
}

export const runtime = 'nodejs'
