import { activeGrow, recommendationEngine, scoreBreakdown } from '@/lib/catalyx'
import { analyzeEnvironment, generateLiveProSignals } from '@/lib/pro-insights'

export type CopilotContext = {
  question?: string
  conversationHistory?: Array<{ role: 'assistant' | 'user'; body: string }>
  proDepth?: boolean
  grow?: Record<string, unknown>
  feedLogs?: Array<Record<string, unknown>>
  environmentLogs?: Array<Record<string, unknown>>
  dailyCheckIns?: Array<Record<string, unknown>>
  journalEntries?: Array<Record<string, unknown>>
  onboarding?: Record<string, unknown>
  reminders?: Array<Record<string, unknown>>
  sourceSummary?: {
    grow: 'supabase' | 'local' | 'seed'
    feedLogs: 'supabase' | 'local' | 'none'
    environmentLogs: 'supabase' | 'local' | 'none'
    dailyCheckIns?: 'supabase' | 'local' | 'none'
    journalEntries: 'supabase' | 'local' | 'none'
  }
}

export type CopilotInsight = {
  title: string
  action: string
  why: string
  confidence: 'High' | 'Medium' | 'Low'
  severity: 'recommended' | 'warning' | 'stable'
}

export type CopilotResponsePayload = {
  source: 'openai' | 'rule'
  summary: string
  insights: CopilotInsight[]
  missingData: string[]
  proSignals?: {
    confidence: string
    runoffTrend: string
    recoveryTrigger: string
    forecast: string
    environmentStatus?: string
    environmentSummary?: string
  }
}

const SYSTEM_PROMPT = [
  'You are Catalyx Copilot, a premium plant nutrition and cultivation optimisation assistant.',
  'Use a professional, concise, scientific tone. Do not use gimmicky language.',
  'Give practical cultivation guidance only. Remind the user to follow local laws and product label directions when relevant.',
  'Always answer: what matters, what changed, what to do next, why it matters, and whether confidence is limited.',
  'Base recommendations only on provided context. If data is missing or inconsistent, say confidence is limited instead of guessing.',
  'Use conversationHistory to answer follow-up questions without repeating unnecessary setup.',
  'If proDepth is true, include deeper risk interpretation, confidence limits, and the next evidence to collect.',
  'Treat Supabase-sourced grow, feed, and environment records as the highest-confidence evidence. Treat local-only data as useful but less durable.',
  'Do not invent photos, lab measurements, product ownership, or prior history that is not in the provided context.',
  'Use only current Catalyx product names when naming products: A-X PRO, B-X PRO, MICRO-X, ROOT-X, VITAL-X, PK-X, RIPEN-X, TRACE-X, FLUSH-X.',
  'Return only valid JSON matching this shape: {"summary": string, "insights": [{"title": string, "action": string, "why": string, "confidence": "High"|"Medium"|"Low", "severity": "recommended"|"warning"|"stable"}], "missingData": string[]}.',
].join('\n')

export function ruleBasedCopilot(context: CopilotContext = {}): CopilotResponsePayload {
  const feedLogs = context.feedLogs ?? []
  const environmentLogs = context.environmentLogs ?? []
  const dailyCheckIns = context.dailyCheckIns ?? []
  const question = context.question?.toLowerCase() ?? ''
  const isFollowUp = Boolean(context.conversationHistory?.some((message) => message.role === 'assistant'))
  const proSignals = generateLiveProSignals({
    feedLogs: feedLogs as Array<{ runoffEc?: number; runoffPh?: number; ec?: number; ph?: number }>,
    environmentLogs: environmentLogs as Array<{ vpd?: number; waterTemp?: number; reservoirTemp?: number }>,
  })
  const hasEnoughFeeds = feedLogs.length >= 3
  const engine = recommendationEngine()
  const insights = engine.slice(0, 3).map((item) => ({
    title: item.title,
    action: item.action,
    why: item.why,
    confidence: item.confidence as CopilotInsight['confidence'],
    severity: item.severity as CopilotInsight['severity'],
  }))

  if (environmentLogs.length) {
    const environment = analyzeEnvironment(environmentLogs as Array<{ temperature?: number; humidity?: number; vpd?: number; waterTemp?: number; reservoirTemp?: number; ppfd?: number }>)
    insights.push({
      title: environment.status === 'stable' ? 'Environment supports feed interpretation' : 'Environment affecting feed confidence',
      action: environment.status === 'stable' ? 'Maintain environment stability while reviewing feed response.' : 'Stabilise the environment before increasing nutrient strength.',
      why: environment.summary,
      confidence: environmentLogs.length >= 2 ? 'High' : 'Medium',
      severity: environment.status === 'stable' ? 'stable' : 'warning',
    })
  }

  if (question.includes('log') || question.includes('today') || question.includes('check')) {
    insights.unshift({
      title: 'Today’s highest-value logs',
      action: 'Log leaf colour, droop, growth speed, stress level, pH, EC, runoff pH/EC, temperature, humidity, VPD, and one photo if possible.',
      why: 'These fields let Catalyx separate feed pressure, root-zone drift, and environment stress instead of treating every symptom as a nutrient issue.',
      confidence: dailyCheckIns.length || feedLogs.length || environmentLogs.length ? 'Medium' : 'Low',
      severity: 'recommended',
    })
  } else if (question.includes('ph') || question.includes('ec') || question.includes('runoff') || question.includes('feed')) {
    insights.unshift({
      title: 'Question read: feed stability',
      action: 'Check pH, EC, and runoff trend before changing dose strength. If runoff EC is rising, hold or reduce strength instead of pushing additives.',
      why: 'Feed questions need recent input and output values. EC and pH only become reliable when compared with runoff and plant response.',
      confidence: hasEnoughFeeds ? 'High' : 'Medium',
      severity: 'recommended',
    })
  } else if (question.includes('root') || question.includes('water') || question.includes('dryback') || question.includes('watering')) {
    insights.unshift({
      title: 'Question read: root-zone stability',
      action: 'Check dryback speed, runoff amount, water temperature, reservoir temperature, and root-zone response before adjusting nutrition.',
      why: 'Watering rhythm and root-zone temperature can mimic nutrient issues. Stabilising the root zone improves the reliability of every feed decision.',
      confidence: environmentLogs.length ? 'Medium' : 'Low',
      severity: 'recommended',
    })
  } else if (question.includes('product') || question.includes('bottle') || question.includes('mix') || question.includes('dose')) {
    insights.unshift({
      title: 'Question read: product timing',
      action: 'Use products by stage and avoid aggressive dose jumps. Keep A-X PRO and B-X PRO concentrates separate, then add stage products after the base is diluted.',
      why: 'Catalyx product logic is stage-led. Correct timing and mixing order prevent avoidable feed instability.',
      confidence: 'Medium',
      severity: 'recommended',
    })
  } else if (question.includes('droop') || question.includes('stress') || question.includes('curl') || question.includes('yellow')) {
    insights.unshift({
      title: 'Question read: stress signal',
      action: 'Log a daily check-in and inspect environment before assuming a nutrient issue. Stabilise temperature, humidity, VPD, and root-zone temperature first.',
      why: 'Visible stress can be caused by environment, watering rhythm, or feed pressure. Separating those signals prevents overcorrecting.',
      confidence: environmentLogs.length ? 'Medium' : 'Low',
      severity: 'warning',
    })
  } else if (question.includes('stage') || question.includes('flower') || question.includes('veg') || question.includes('flush')) {
    insights.unshift({
      title: 'Question read: stage timing',
      action: 'Match the recipe to the current stage and avoid introducing stage-specific products too early.',
      why: 'Catalyx stage logic changes product pressure between vegetative, flower, late flower, and flush windows.',
      confidence: 'Medium',
      severity: 'recommended',
    })
  }

  if (context.proDepth) {
    insights.unshift({
      title: 'Professional depth active',
      action: 'Use the answer as an optimisation read: compare feed trend, root-zone stability, environment pressure, and recent check-in signals before changing dose.',
      why: 'Professional mode weighs multiple evidence streams together so Catalyx can reduce overcorrection risk and explain confidence more clearly.',
      confidence: feedLogs.length || environmentLogs.length || dailyCheckIns.length ? 'Medium' : 'Low',
      severity: 'recommended',
    })
  }

  return {
    source: 'rule',
    summary: context.question
      ? `Catalyx read ${isFollowUp ? 'this follow-up' : 'your question'} and matched it against saved grow signals. ${hasEnoughFeeds ? 'Recent feed evidence is improving confidence.' : 'Logging three feed events will make this answer stronger.'}`
      : hasEnoughFeeds
        ? `Catalyx is using ${context.sourceSummary?.feedLogs ?? 'saved'} feed history and current grow context to produce conservative next actions.`
        : 'Catalyx is using baseline grow logic. Save at least three feed logs to improve recommendation confidence.',
    insights: insights.slice(0, 5),
    missingData: [
      !hasEnoughFeeds ? 'Three recent feed logs' : '',
      !dailyCheckIns.length ? 'Daily check-in' : '',
      !environmentLogs.length ? 'Environment log' : '',
      !(context.journalEntries?.length) ? 'Approved journal entries' : '',
    ].filter(Boolean),
    proSignals,
  }
}

export async function generateOpenAICopilot(context: CopilotContext): Promise<CopilotResponsePayload> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return ruleBasedCopilot(context)

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: process.env.OPENAI_MODEL ?? 'gpt-5.2',
      instructions: SYSTEM_PROMPT,
      input: JSON.stringify({
        activeGrow,
        scores: scoreBreakdown,
        userContext: context,
      }),
      max_output_tokens: 900,
    }),
  })

  if (!response.ok) return ruleBasedCopilot(context)

  const data = await response.json()
  const outputText = extractOutputText(data)
  if (!outputText) return ruleBasedCopilot(context)

  try {
    const parsed = JSON.parse(outputText) as Omit<CopilotResponsePayload, 'source'>
    return {
      source: 'openai',
      summary: typeof parsed.summary === 'string' ? parsed.summary : 'Catalyx generated an AI grow read from the available context.',
      insights: normalizeInsights(parsed.insights).slice(0, 5),
      missingData: Array.isArray(parsed.missingData) ? parsed.missingData.filter((item): item is string => typeof item === 'string') : [],
      proSignals: generateLiveProSignals({
        feedLogs: context.feedLogs as Array<{ runoffEc?: number; runoffPh?: number; ec?: number; ph?: number }>,
        environmentLogs: context.environmentLogs as Array<{ vpd?: number; waterTemp?: number; reservoirTemp?: number }>,
      }),
    }
  } catch {
    return ruleBasedCopilot(context)
  }
}

function normalizeInsights(value: unknown): CopilotInsight[] {
  if (!Array.isArray(value)) return []
  return value
    .filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === 'object')
    .map((item) => ({
      title: typeof item.title === 'string' ? item.title : 'Cultivation recommendation',
      action: typeof item.action === 'string' ? item.action : 'Maintain stable logging and review the latest feed response.',
      why: typeof item.why === 'string' ? item.why : 'Recommendation confidence depends on feed, runoff, environment, and check-in consistency.',
      confidence: isConfidence(item.confidence) ? item.confidence : 'Low',
      severity: isSeverity(item.severity) ? item.severity : 'recommended',
    }))
}

function isConfidence(value: unknown): value is CopilotInsight['confidence'] {
  return value === 'High' || value === 'Medium' || value === 'Low'
}

function isSeverity(value: unknown): value is CopilotInsight['severity'] {
  return value === 'recommended' || value === 'warning' || value === 'stable'
}

function extractOutputText(data: unknown) {
  if (!data || typeof data !== 'object') return ''
  const direct = (data as { output_text?: unknown }).output_text
  if (typeof direct === 'string') return direct

  const output = (data as { output?: unknown }).output
  if (!Array.isArray(output)) return ''

  return output
    .flatMap((item) => {
      const content = (item as { content?: unknown }).content
      return Array.isArray(content) ? content : []
    })
    .map((part) => {
      const text = (part as { text?: unknown }).text
      return typeof text === 'string' ? text : ''
    })
    .join('')
}
