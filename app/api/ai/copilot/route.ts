import { NextResponse } from 'next/server'
import { generateOpenAICopilot, ruleBasedCopilot, type CopilotContext } from '@/lib/ai-copilot'
import { requirePortalUser } from '@/lib/portal-server'

export async function POST(request: Request) {
  const guard = await requirePortalUser(request)
  if (guard.response || !guard.appUser) return guard.response

  try {
    const context = (await request.json()) as CopilotContext
    const payload = await generateOpenAICopilot(context)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(ruleBasedCopilot())
  }
}

export const runtime = 'nodejs'
