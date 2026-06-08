import { NextResponse } from 'next/server'
import { generateOpenAICopilot, ruleBasedCopilot, type CopilotContext } from '@/lib/ai-copilot'

export async function POST(request: Request) {
  try {
    const context = (await request.json()) as CopilotContext
    const payload = await generateOpenAICopilot(context)
    return NextResponse.json(payload)
  } catch {
    return NextResponse.json(ruleBasedCopilot())
  }
}
