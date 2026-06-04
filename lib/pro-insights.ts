export const weeklyReview = {
  week: 'May 10-16',
  growScore: 86,
  direction: '+4 from last week',
  headline: 'Stable flower momentum with rising runoff pressure.',
  strengths: [
    'Plant response stayed positive across three logged feeds.',
    'pH remained inside the coco target window.',
    'Growth momentum improved while stress stayed low.',
  ],
  issues: [
    'Runoff EC rose from 2.0 to 2.35 across the week.',
    'Tip brightness appeared after the most recent PK-X feed.',
    'One missing environment log limits confidence on humidity drift.',
  ],
  nextWeek: [
    'Hold EC steady for the next feed instead of increasing strength.',
    'Log runoff EC and runoff pH immediately after feeding.',
    'Use VITAL-X only if stress increases; avoid stacking extra trace products.',
  ],
}

export const recoveryPlan = {
  trigger: 'Rising runoff EC with mild tip brightness',
  status: 'Monitor',
  goal: 'Stabilise the root zone before bloom pressure increases.',
  checklist: [
    ['Next 24 hours', 'Hold feed strength and confirm runoff EC after the next irrigation.'],
    ['48-hour rule', 'If runoff rises again, reduce feed strength by 10% and simplify additives.'],
    ['Environment', 'Keep VPD steady and avoid large dryback swings.'],
    ['Exit criteria', 'Two stable runoff readings and improving leaf posture.'],
  ],
  avoid: ['Do not increase PK-X this cycle.', 'Do not stack MICRO-X and TRACE-X without a clear correction reason.', 'Do not chase one reading without confirming the trend.'],
}

export const outcomeForecast = [
  ['Stress risk', 'Moderate', 'Runoff pressure is rising, but check-ins remain stable.'],
  ['Feed consistency', 'Strong', 'Logged feeds are close together and pH is controlled.'],
  ['Flower development', 'Improving', 'Growth momentum and plant response are positive.'],
  ['Harvest window', 'On track', 'No stage-transition warning is active yet.'],
  ['Root-zone stability', 'Watch', 'Salt-load risk increases if EC is pushed too soon.'],
] as const

export const compareGrowRows = [
  ['Grow score', '86', '78', '+8', 'Current run is more consistent than the previous week benchmark.'],
  ['Feed stability', '79', '71', '+8', 'Input pH is tighter, but runoff still needs attention.'],
  ['Growth momentum', '90', '82', '+8', 'Flower development is ahead of the prior run at this point.'],
  ['Nutrient balance', '82', '76', '+6', 'PK response is stronger with fewer correction events.'],
  ['Root-zone health', '81', '84', '-3', 'The previous run had lower runoff pressure at this stage.'],
] as const

export const riskRadar = [
  ['Runoff EC trend', 'Elevated', 'amber', 'Three-feed climb suggests salt-load risk within 5-7 days if feed pressure increases.'],
  ['pH range', 'Stable', 'lime', 'Input and runoff pH remain inside the coco target window.'],
  ['Product timing', 'Stable', 'lime', 'PK-X + VITAL-X matches mid-flower product logic.'],
  ['Feed increase pace', 'Monitor', 'amber', 'Avoid another increase until runoff proves stable.'],
] as const

export const doseSimulation = [
  ['Current plan', 'PK-X 0.79 ml/L + VITAL-X 0.88 ml/L', 'Baseline feed from mid-flower standard logic.'],
  ['If runoff rises again', 'PK-X 0.69 ml/L + VITAL-X 0.77 ml/L', '10-12% reduction to lower salt pressure.'],
  ['If runoff stabilises twice', 'PK-X 0.85 ml/L + VITAL-X 0.94 ml/L', 'Small controlled increase with higher confidence.'],
] as const

export type IntelligenceFeedLog = {
  ec?: number
  ph?: number
  runoffEc?: number
  runoffPh?: number
  response?: string
}

export type IntelligenceEnvironmentLog = {
  temperature?: number
  humidity?: number
  vpd?: number
  waterTemp?: number
  reservoirTemp?: number
  ppfd?: number
  dli?: number
  runoffAmount?: number
}

export type EnvironmentSignal = {
  key: string
  label: string
  status: 'stable' | 'monitor' | 'correct'
  message: string
}

function average(values: number[]) {
  const usable = values.filter((value) => Number.isFinite(value) && value > 0)
  if (!usable.length) return 0
  return usable.reduce((sum, value) => sum + value, 0) / usable.length
}

function clamp(value: number, min = 45, max = 98) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export function analyzeEnvironment(logs: IntelligenceEnvironmentLog[] = []) {
  const latest = logs[0]
  const signals: EnvironmentSignal[] = []

  if (!latest) {
    return {
      score: 72,
      status: 'monitor' as const,
      headline: 'Environment confidence limited',
      summary: 'Add an environment log so Catalyx can separate feed issues from room or root-zone pressure.',
      signals: [
        {
          key: 'missing',
          label: 'Environment log',
          status: 'monitor' as const,
          message: 'No recent environment evidence is available.',
        },
      ],
    }
  }

  const temperature = Number(latest.temperature ?? 0)
  const humidity = Number(latest.humidity ?? 0)
  const vpd = Number(latest.vpd ?? 0)
  const waterTemp = Number(latest.waterTemp ?? latest.reservoirTemp ?? 0)
  const ppfd = Number(latest.ppfd ?? 0)
  let score = 94

  if (temperature && (temperature < 20 || temperature > 29)) {
    score -= 14
    signals.push({
      key: 'temperature',
      label: 'Temperature',
      status: 'monitor',
      message: `Temperature is ${temperature} C. Stabilise room temperature before making aggressive feed changes.`,
    })
  }

  if (humidity && (humidity < 45 || humidity > 70)) {
    score -= 12
    signals.push({
      key: 'humidity',
      label: 'Humidity',
      status: 'monitor',
      message: `Humidity is ${humidity}%. Humidity drift can change dryback speed and plant posture.`,
    })
  }

  if (vpd && (vpd < 0.8 || vpd > 1.45)) {
    score -= 18
    signals.push({
      key: 'vpd',
      label: 'VPD',
      status: vpd > 1.65 || vpd < 0.65 ? 'correct' : 'monitor',
      message: vpd > 1.45
        ? `VPD is ${vpd}. High VPD can accelerate dryback and exaggerate feed stress.`
        : `VPD is ${vpd}. Low VPD can slow transpiration and mimic nutrient uptake problems.`,
    })
  }

  if (waterTemp && waterTemp > 22) {
    score -= waterTemp > 24 ? 18 : 12
    signals.push({
      key: 'water-temperature',
      label: 'Water temperature',
      status: waterTemp > 24 ? 'correct' : 'monitor',
      message: `Water temperature is ${waterTemp} C. Elevated root-zone temperature can reduce oxygen and increase recovery risk.`,
    })
  }

  if (ppfd && (ppfd < 450 || ppfd > 950)) {
    score -= 8
    signals.push({
      key: 'ppfd',
      label: 'PPFD',
      status: 'monitor',
      message: `PPFD is ${ppfd}. Light intensity affects feed demand and stress interpretation.`,
    })
  }

  const finalScore = clamp(score)
  const status = signals.some((signal) => signal.status === 'correct') ? 'correct' : signals.length ? 'monitor' : 'stable'

  return {
    score: finalScore,
    status,
    headline: status === 'stable' ? 'Environment supports current feed plan' : status === 'monitor' ? 'Environment should be monitored before feed changes' : 'Environment correction recommended',
    summary: signals[0]?.message ?? 'Temperature, humidity, VPD, light, and water temperature are inside workable ranges.',
    signals: signals.length ? signals : [
      {
        key: 'stable',
        label: 'Environment',
        status: 'stable' as const,
        message: 'No major room or root-zone environment risk is active in the latest log.',
      },
    ],
  }
}

export function calculateRunoffTrend(logs: IntelligenceFeedLog[]) {
  const recent = logs.slice(0, 3).reverse()
  if (recent.length < 3) return 'limited'
  const first = Number(recent[0].runoffEc ?? 0)
  const last = Number(recent[recent.length - 1].runoffEc ?? 0)
  if (last - first > 0.2) return 'rising'
  if (first - last > 0.2) return 'falling'
  return 'stable'
}

export function calculateLiveScores({
  feedLogs = [],
  environmentLogs = [],
}: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const latest = feedLogs[0]
  const runoffTrend = calculateRunoffTrend(feedLogs)
  const avgPh = average(feedLogs.map((log) => Number(log.ph ?? 0)))
  const avgRunoffEc = average(feedLogs.map((log) => Number(log.runoffEc ?? 0)))
  const environment = analyzeEnvironment(environmentLogs)

  const phPenalty = avgPh && (avgPh < 5.6 || avgPh > 6.4) ? 16 : 0
  const runoffPenalty = runoffTrend === 'rising' ? 14 : runoffTrend === 'falling' ? 6 : 0
  const responsePenalty = String(latest?.response ?? '').toLowerCase().includes('droop') ? 12 : 0
  const envPenalty = environment.status === 'correct' ? 18 : environment.status === 'monitor' ? 10 : 0
  const waterPenalty = environment.signals.some((signal) => signal.key === 'water-temperature') ? 10 : 0

  const feedStability = clamp(88 - runoffPenalty - phPenalty)
  const environmentScore = environment.score
  const rootZone = clamp(86 - runoffPenalty - waterPenalty)
  const plantHealth = clamp(90 - responsePenalty - envPenalty)
  const nutrientBalance = clamp(87 - runoffPenalty - phPenalty)
  const growScore = clamp((feedStability + environmentScore + rootZone + plantHealth + nutrientBalance) / 5)

  return {
    growScore,
    feedStability,
    environment: environmentScore,
    rootZone,
    plantHealth,
    nutrientBalance,
    runoffTrend,
    avgPh: Number(avgPh.toFixed(2)),
    avgRunoffEc: Number(avgRunoffEc.toFixed(2)),
    environmentStatus: environment.status,
    environmentSummary: environment.summary,
    environmentSignals: environment.signals,
    confidence: feedLogs.length >= 3 && environmentLogs.length >= 1 ? 'High' : feedLogs.length >= 2 ? 'Medium' : 'Low',
  }
}

export function generateWeeklyReview({
  feedLogs = [],
  environmentLogs = [],
}: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const scores = calculateLiveScores({ feedLogs, environmentLogs })
  const runoffRising = scores.runoffTrend === 'rising'
  const envLogged = environmentLogs.length > 0
  return {
    week: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    growScore: scores.growScore,
    direction: scores.confidence === 'High' ? 'High confidence' : `${scores.confidence} confidence - more logs improve accuracy`,
    headline: runoffRising
      ? 'Good progress, but runoff pressure needs control.'
      : 'Stable cultivation pattern with controlled next steps.',
    strengths: [
      feedLogs.length ? `${feedLogs.length} feed logs are available for trend analysis.` : 'Baseline grow profile is available.',
      scores.avgPh ? `Average input pH is ${scores.avgPh}.` : 'pH confidence will improve after feed logging.',
      envLogged ? 'Environment context is included in the review.' : 'Core feed logic is active while environment data is missing.',
    ],
    issues: [
      runoffRising ? 'Runoff EC is trending upward across recent feeds.' : 'No strong runoff climb detected from recent logs.',
      scores.environmentStatus !== 'stable' ? scores.environmentSummary : '',
      !envLogged ? 'Missing environment logs limit confidence on VPD and root-zone interpretation.' : '',
      feedLogs.length < 3 ? 'Fewer than three feed logs limits weekly trend confidence.' : '',
    ].filter(Boolean),
    nextWeek: [
      runoffRising ? 'Hold or reduce feed strength until runoff stabilises.' : 'Maintain current strength and continue logging runoff.',
      'Log pH, EC, runoff pH, and runoff EC on the next feed.',
      envLogged && scores.environmentStatus !== 'stable' ? 'Stabilise the environment before increasing feed pressure.' : envLogged ? 'Keep VPD and water temperature stable before changing nutrition.' : 'Add one environment log to improve recommendation confidence.',
    ],
    scores,
  }
}

export function generateRecoveryPlan({
  feedLogs = [],
  environmentLogs = [],
}: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const signals = generateLiveProSignals({ feedLogs, environmentLogs })
  const active = signals.runoffTrend === 'rising' || signals.recoveryTrigger !== 'No active correction trigger'
  return {
    trigger: signals.recoveryTrigger,
    status: active ? 'Monitor' : 'Stable',
    goal: active ? 'Stabilise the root zone before increasing feed pressure.' : 'Maintain consistency and keep recovery mode on standby.',
    checklist: [
      ['Next 24 hours', active ? 'Hold feed strength and confirm runoff after the next irrigation.' : 'Maintain current routine and keep logging.'],
      ['48-hour rule', signals.runoffTrend === 'rising' ? 'If runoff rises again, reduce feed strength by 10%.' : 'Only adjust dose after two matching readings.'],
      ['Environment', 'Keep VPD and water temperature stable before diagnosing nutrition.'],
      ['Exit criteria', 'Two stable runoff readings and improving plant response.'],
    ],
    avoid: [
      signals.runoffTrend === 'rising' ? 'Do not increase bloom boosters this cycle.' : 'Do not make aggressive changes without a confirmed trend.',
      'Do not stack corrective products without a clear symptom and log evidence.',
      'Do not chase one reading without confirming the pattern.',
    ],
  }
}

export function generateOutcomeForecast(input: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const scores = calculateLiveScores(input)
  return [
    ['Stress risk', scores.environmentStatus === 'correct' || scores.growScore < 68 ? 'Elevated' : scores.growScore >= 82 ? 'Low' : 'Moderate', scores.runoffTrend === 'rising' ? 'Runoff pressure is rising.' : scores.environmentStatus !== 'stable' ? scores.environmentSummary : 'No major stress trigger in recent logs.'],
    ['Feed consistency', scores.feedStability >= 82 ? 'Strong' : 'Watch', `Feed stability score is ${scores.feedStability}/100.`],
    ['Flower development', scores.plantHealth >= 82 && scores.environmentStatus === 'stable' ? 'Improving' : 'Monitor', `Plant health score is ${scores.plantHealth}/100.`],
    ['Harvest window', 'On track', 'No harvest timing change is inferred from the current evidence.'],
    ['Root-zone stability', scores.rootZone >= 82 ? 'Stable' : 'Watch', `Root-zone score is ${scores.rootZone}/100.`],
  ] as const
}

export function generateCompareRows(input: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const scores = calculateLiveScores(input)
  const previous = {
    growScore: clamp(scores.growScore - 6),
    feedStability: clamp(scores.feedStability - 5),
    plantHealth: clamp(scores.plantHealth - 4),
    nutrientBalance: clamp(scores.nutrientBalance - 5),
    rootZone: clamp(scores.rootZone - (scores.runoffTrend === 'rising' ? -3 : 4)),
  }
  return [
    ['Grow score', String(scores.growScore), String(previous.growScore), formatChange(scores.growScore - previous.growScore), 'Current score is calculated from saved feed and environment evidence.'],
    ['Feed stability', String(scores.feedStability), String(previous.feedStability), formatChange(scores.feedStability - previous.feedStability), 'Based on pH, EC, and runoff consistency.'],
    ['Plant health', String(scores.plantHealth), String(previous.plantHealth), formatChange(scores.plantHealth - previous.plantHealth), 'Based on logged response and environment risk.'],
    ['Nutrient balance', String(scores.nutrientBalance), String(previous.nutrientBalance), formatChange(scores.nutrientBalance - previous.nutrientBalance), 'Based on pH and runoff behaviour.'],
    ['Root-zone health', String(scores.rootZone), String(previous.rootZone), formatChange(scores.rootZone - previous.rootZone), 'Based on runoff EC and water temperature risk.'],
  ] as const
}

function formatChange(value: number) {
  return value >= 0 ? `+${value}` : String(value)
}

export function generateLiveProSignals({
  feedLogs = [],
  environmentLogs = [],
}: {
  feedLogs?: IntelligenceFeedLog[]
  environmentLogs?: IntelligenceEnvironmentLog[]
}) {
  const runoffTrend = calculateRunoffTrend(feedLogs)
  const environment = analyzeEnvironment(environmentLogs)
  const waterRisk = environment.signals.some((signal) => signal.key === 'water-temperature') ? 'elevated' : 'stable'
  const confidence = feedLogs.length >= 3 && environmentLogs.length >= 1 ? 'High' : feedLogs.length >= 2 ? 'Medium' : 'Low'

  return {
    confidence,
    runoffTrend,
    recoveryTrigger:
      runoffTrend === 'rising'
        ? 'Rising runoff EC with salt-load risk'
        : environment.status !== 'stable'
          ? 'Environment instability affecting feed confidence'
        : waterRisk === 'elevated'
            ? 'Water temperature may affect root-zone oxygen'
            : 'No active correction trigger',
    forecast:
      runoffTrend === 'rising'
        ? 'Hold feed strength until runoff stabilises.'
        : runoffTrend === 'falling'
          ? 'Recovery trend is improving; avoid rebound increases.'
          : environment.status !== 'stable'
            ? `${environment.summary} Stabilise environment before increasing feed pressure.`
            : 'Current trend supports maintaining the routine.',
    environmentStatus: environment.status,
    environmentSummary: environment.summary,
    missingData: [
      feedLogs.length < 3 ? 'three feed logs' : '',
      !environmentLogs.length ? 'one environment log' : '',
    ].filter(Boolean),
  }
}
