import type { Medium, Stage } from '@/lib/catalyx'
import { generateLiveProSignals } from '@/lib/pro-insights'

export type FeedAdvisorInput = {
  stage: Stage
  medium: Medium
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
  recentLogs?: Array<{ ec?: number; ph?: number; runoffEc?: number; runoffPh?: number }>
}

export type FeedAdvisorResult = {
  headline: string
  nextSteps: string[]
  warnings: string[]
  feedingSuggestion: string
  confidence: 'High' | 'Medium' | 'Low'
}

export function adviseAfterFeedLog(input: FeedAdvisorInput): FeedAdvisorResult {
  const warnings: string[] = []
  if (input.ph < 5.5 || input.ph > 6.5) warnings.push('Input pH is outside the usual 5.5–6.5 band — correct before the next feed.')
  if (input.runoffPh < 5.3 || input.runoffPh > 6.8) warnings.push('Runoff pH drift may affect nutrient availability even when input pH looks fine.')
  if (input.runoffEc - input.ec > 0.35) warnings.push('Runoff EC is elevated above input — hold strength and log the next runoff before increasing.')
  if (input.ec > 2.2 && input.medium === 'soil') warnings.push('Feed strength looks high for soil — consider a lighter solution or longer dryback.')

  const signals = generateLiveProSignals({ feedLogs: input.recentLogs ?? [{ ec: input.ec, ph: input.ph, runoffEc: input.runoffEc, runoffPh: input.runoffPh }] })
  const nextSteps: string[] = []

  if (signals.runoffTrend === 'rising') {
    nextSteps.push('Hold EC steady on the next feed and capture runoff EC + pH within 30 minutes of irrigation.')
    nextSteps.push('Avoid stacking PK-X and extra traces until two stable runoff readings return.')
  } else if (signals.runoffTrend === 'falling') {
    nextSteps.push('Recovery trend is improving — maintain routine and do not rebound with a large EC jump.')
  } else {
    nextSteps.push('Log leaf posture and flower swell tomorrow to confirm the plant agrees with this feed strength.')
  }

  if (input.response.toLowerCase().includes('tip')) {
    nextSteps.push('Reduce optional additives this cycle and prioritise plain water dryback if media stays wet.')
  }

  if (input.stage === 'flush') {
    nextSteps.push('Track runoff EC daily until it approaches input EC before considering any additive return.')
  }

  const feedingSuggestion = `For ${input.stage.replace('-', ' ')} in ${input.medium}: ${signals.forecast} Base suggestion — keep Catalyx stage products aligned with the feed calculator and adjust only one variable per feed.`

  return {
    headline: warnings.length ? 'Review this feed before pushing again' : 'Feed logged — here is what Catalyx suggests next',
    nextSteps: nextSteps.slice(0, 4),
    warnings,
    feedingSuggestion,
    confidence: signals.confidence as FeedAdvisorResult['confidence'],
  }
}
