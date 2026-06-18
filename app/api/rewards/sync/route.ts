import { NextResponse } from 'next/server'
import { syncBackendRewardBalance } from '@/lib/rewards-backend'
import { mapRewardWallet, requireRewardUser } from '@/lib/rewards-auth'

export async function POST(request: Request) {
  const guard = await requireRewardUser(request)
  if (guard.response || !guard.appUser || !guard.authUser) return guard.response

  try {
    const result = await syncBackendRewardBalance({
      userCandidate: String(guard.appUser.id),
      email: guard.authUser.email ?? guard.appUser.email ?? '',
      tier: guard.tier,
    })

    return NextResponse.json({
      ok: result.ok,
      source: result.source,
      wallet: mapRewardWallet(result.wallet),
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
