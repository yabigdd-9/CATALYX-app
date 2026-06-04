export const catalyxProTagline =
  'Catalyx Pro is a premium grow assistant — weekly reviews, runoff intelligence, product-specific guides, and exports — not just a paywall.'

export const premiumFeatureSuites = [
  {
    title: 'Product-specific Pro guides',
    value: 'Deep education for A-X, B-X, Root-X, PK-X, Vital-X, Fade-X, Flush-X, and compatibility rules.',
    unlocks: ['What each product does', 'When and what not to mix', 'Beginner vs pro dose', 'Overuse and deficiency signs'],
  },
  {
    title: 'Weekly Grow Review',
    value: 'A Monday report that explains what improved, what slipped, and what to do next.',
    unlocks: ['Score movement', 'Feed consistency audit', 'Risk summary', 'Next-week action plan'],
  },
  {
    title: 'Root-Zone Risk Radar',
    value: 'Early warnings when runoff EC, pH drift, or stress signals point toward lockout or salt buildup.',
    unlocks: ['Runoff trend alerts', 'pH drift windows', 'Recovery triggers', 'Confidence level'],
  },
  {
    title: 'Dose Change Simulator',
    value: 'Preview how changing litres, EC pressure, mode, or stage affects the next feed before mixing.',
    unlocks: ['Before/after ml/L', 'Safety clamp', 'Product-specific impact', 'Why it changed'],
  },
  {
    title: 'Recovery Playbooks',
    value: 'Guided 48-hour correction plans for stressed plants, high runoff, drift, overfeeding, or lockout risk.',
    unlocks: ['Corrective feed plan', 'Hold/reduce rules', 'Observation checklist', 'Exit criteria'],
  },
  {
    title: 'Outcome Forecasting',
    value: 'Projected crop direction based on consistency, stage timing, plant response, and feed stability.',
    unlocks: ['7-day outlook', 'Yield risk', 'Quality risk', 'Confidence trend'],
  },
  {
    title: 'Professional Report Builder',
    value: 'Export a polished grow history for your own records, consultants, partners, or repeat-run comparison.',
    unlocks: ['PDF summary', 'Feed timeline', 'Charts', 'Recommendation history'],
  },
]

export const proCommandModules = [
  ['Action priority', 'Hold EC steady today; runoff is already 0.45 above input.'],
  ['Risk window', 'Salt-load risk could become visible within 5-7 days if feed pressure increases.'],
  ['Next best log', 'Capture runoff EC, runoff pH, leaf tip brightness, and flower swell after the next feed.'],
  ['Confidence booster', 'Two more stable logs unlock a higher-confidence bloom push recommendation.'],
] as const

export const proAnalyticsLayers = [
  ['Benchmarking', 'Compares current score movement against your previous week and stage expectation.'],
  ['Anomaly detection', 'Flags values that look normal alone but risky when combined with runoff and plant response.'],
  ['Cost and usage', 'Turns product ml usage into shelf-life, reorder timing, and per-week cost signals.'],
  ['Consistency scoring', 'Measures whether the grow is becoming more predictable, not just whether numbers look good.'],
  ['Stage readiness', 'Shows whether the plant response supports staying, pushing, recovering, or transitioning stage.'],
  ['Decision history', 'Keeps a record of what Catalyx recommended and what evidence caused the recommendation.'],
] as const

export const proReportSections = [
  'Executive grow summary',
  'Weekly Grow Review',
  'Feed, pH, EC, and runoff timeline',
  'Product usage and inventory impact',
  'Photo and journal highlights',
  'Mistake-prevention warnings',
  'Recovery events and corrective actions',
  'Next-week professional action plan',
]

export const silicaStructXNote = {
  title: 'Struct-X / Silica (compatibility)',
  body: 'When using silica-style products, add to water first, mix thoroughly, then add base nutrients. Never pour undiluted silica into concentrated A/B.',
}

export const subscriberProofPoints = [
  ['More confidence', 'Every Pro recommendation shows the evidence behind it.'],
  ['Fewer mistakes', 'Warnings appear before small drift becomes a correction problem.'],
  ['Less guesswork', 'Dose logic adapts to stage, medium, stress, runoff, and grow mode.'],
  ['Better records', 'Reports turn messy logs into a clean grow history.'],
] as const
