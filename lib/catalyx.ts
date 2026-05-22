export type Stage = 'seedling' | 'vegetative' | 'early-flower' | 'mid-flower' | 'late-flower' | 'flush'
export type Medium = 'hydro' | 'coco' | 'soil'
export type Experience = 'beginner' | 'standard' | 'professional'
export type RunoffTrend = 'stable' | 'rising' | 'falling'
export type StressLevel = 'low' | 'moderate' | 'high'
export type GrowMode =
  | 'Beginner Mode'
  | 'Professional Cultivation Mode'
  | 'Yield Mode'
  | 'Quality Mode'
  | 'Speed Mode'
  | 'Low Maintenance Mode'
  | 'Recovery Mode'

export type OnboardingSetup = {
  medium: Medium
  experience: Experience
  stage: Stage
  feedingStyle: 'safe' | 'standard' | 'aggressive'
  delivery: 'hand-water' | 'automated'
  environment: 'easy' | 'moderate' | 'difficult'
  mode: GrowMode
  configuredAt?: string
}

export type ProductKey =
  | 'ax-pro'
  | 'bx-pro'
  | 'micro-x'
  | 'root-x'
  | 'vital-x'
  | 'pk-x'
  | 'ripen-x'
  | 'trace-x'
  | 'iron-x'
  | 'flush-x'

export type CatalyxProduct = {
  id: ProductKey
  name: string
  purpose: string
  theme: string
  accent: string
  stages: Stage[]
  dose: Record<Experience, [number, number]>
  when: string
  why: string
  how: string
  watchFor: string[]
  overuse: string[]
  deficiency: string[]
  compatibility: string
  storage: string
  shelfLife: string
  mixing: string
  tips: string[]
}

export const stageLabels: Record<Stage, string> = {
  seedling: 'Seedling',
  vegetative: 'Vegetative',
  'early-flower': 'Early Flower',
  'mid-flower': 'Mid Flower',
  'late-flower': 'Late Flower',
  flush: 'Flush',
}

export const mediumLabels: Record<Medium, string> = {
  hydro: 'Hydro',
  coco: 'Coco',
  soil: 'Soil',
}

export const experienceLabels: Record<Experience, string> = {
  beginner: 'Beginner',
  standard: 'Standard',
  professional: 'Professional',
}

export const stageOrder: Stage[] = ['seedling', 'vegetative', 'early-flower', 'mid-flower', 'late-flower', 'flush']
export const mediumOrder: Medium[] = ['hydro', 'coco', 'soil']
export const experienceOrder: Experience[] = ['beginner', 'standard', 'professional']

export const products: CatalyxProduct[] = [
  {
    id: 'ax-pro',
    name: 'A-X PRO',
    purpose: 'Base nutrient A',
    theme: 'Acid / Lime Green',
    accent: '#c8f500',
    stages: ['vegetative'],
    dose: { beginner: [1.2, 1.8], standard: [1.8, 2.4], professional: [2.4, 3] },
    when: 'Use as the paired Part A base during vegetative growth and base-feed periods.',
    why: 'Supports structural growth with calcium, nitrogen, and iron balance.',
    how: 'Forms the mineral backbone of the feed when paired with B-X PRO.',
    watchFor: ['Strong green growth', 'Stable EC response', 'Leaf tip burn after aggressive increases'],
    overuse: ['Dark clawing foliage', 'Elevated runoff EC', 'Tip burn on new growth'],
    deficiency: ['Pale new growth', 'Weak stems', 'Slow vegetative momentum'],
    compatibility: 'Always pair with B-X PRO. Add supplements after base nutrients are diluted.',
    storage: 'Store sealed in a cool, dark location away from direct light.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Add A-X PRO to water first, mix thoroughly, then add B-X PRO separately.',
    tips: ['Keep A and B concentrates separate.', 'Increase gradually when runoff is stable.'],
  },
  {
    id: 'bx-pro',
    name: 'B-X PRO',
    purpose: 'Base nutrient B',
    theme: 'Deep Green',
    accent: '#1f8f4d',
    stages: ['vegetative'],
    dose: { beginner: [1.2, 1.8], standard: [1.8, 2.4], professional: [2.4, 3] },
    when: 'Use with A-X PRO as the paired base nutrient system.',
    why: 'Completes the base profile with phosphorus, potassium, magnesium, and sulfur.',
    how: 'Balances energy transfer, metabolism, and canopy expansion alongside A-X PRO.',
    watchFor: ['Even canopy color', 'Stable pH after mixing', 'Salt buildup in dryback-heavy media'],
    overuse: ['Runoff EC climbing', 'Leaf edge stress', 'Reduced uptake response'],
    deficiency: ['Weak growth rate', 'Lower leaf fade', 'Reduced vigor'],
    compatibility: 'Designed to run with A-X PRO. Compatible with MICRO-X and ROOT-X in vegetative feeds.',
    storage: 'Keep cap sealed and avoid contamination from measuring tools.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Never combine concentrates directly. Dilute A-X PRO before adding B-X PRO.',
    tips: ['Match A-X PRO and B-X PRO ml/L for predictable base balance.', 'Log EC after pH correction.'],
  },
  {
    id: 'micro-x',
    name: 'MICRO-X',
    purpose: 'Trace + micros',
    theme: 'Electric Blue',
    accent: '#2ea8ff',
    stages: ['vegetative'],
    dose: { beginner: [0.2, 0.4], standard: [0.4, 0.7], professional: [0.7, 1] },
    when: 'Use when vegetative growth needs trace and micronutrient balance.',
    why: 'Micronutrient availability supports chlorophyll, enzyme function, and resilient growth.',
    how: 'Adds a targeted trace profile that complements the A-X PRO and B-X PRO base.',
    watchFor: ['Interveinal color', 'New growth tone', 'pH drift after additions'],
    overuse: ['Metallic stress symptoms', 'Unexpected EC increase', 'Micro lockout signals'],
    deficiency: ['Interveinal yellowing', 'Patchy new growth', 'Reduced vigor'],
    compatibility: 'Best with vegetative base feeds. Use TRACE-X for bloom trace support.',
    storage: 'Store away from heat and keep the bottle closed.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Add after base nutrients are diluted and mixed.',
    tips: ['Use lower rates in soil.', 'Do not stack with TRACE-X unless correcting a clear issue.'],
  },
  {
    id: 'root-x',
    name: 'ROOT-X',
    purpose: 'Root stimulator',
    theme: 'Cyan / Teal',
    accent: '#16d6c8',
    stages: ['seedling', 'vegetative'],
    dose: { beginner: [0.5, 0.8], standard: [0.8, 1.2], professional: [1.2, 1.6] },
    when: 'Use at seedling, transplant, and early vegetative establishment.',
    why: 'A stronger root zone improves uptake consistency and recovery from stress.',
    how: 'Supports root initiation, root mass, and early establishment response.',
    watchFor: ['Root-zone moisture', 'Transplant response', 'New shoot vigor'],
    overuse: ['Biofilm risk in warm reservoirs', 'Unnecessary EC contribution', 'Soft growth in low light'],
    deficiency: ['Slow establishment', 'Weak transplant recovery', 'Poor dryback response'],
    compatibility: 'Pairs with VITAL-X in seedling and with base nutrients in vegetative feeds.',
    storage: 'Keep cool and shake before use if directed on the label.',
    shelfLife: 'Best used within 12 months of opening.',
    mixing: 'Add after base nutrients in established feeds or into mild seedling solution.',
    tips: ['Use consistently during the first two weeks.', 'Watch reservoir temperature in hydro.'],
  },
  {
    id: 'vital-x',
    name: 'VITAL-X',
    purpose: 'Vitamins + stress support',
    theme: 'Purple / Violet',
    accent: '#9a5cff',
    stages: ['seedling', 'mid-flower'],
    dose: { beginner: [0.3, 0.6], standard: [0.6, 1], professional: [1, 1.4] },
    when: 'Use during seedling establishment, stress windows, and mid-flower support.',
    why: 'Stress support helps keep growth consistent when environment or feed pressure changes.',
    how: 'Provides vitality support that stabilises plant response during demanding phases.',
    watchFor: ['Leaf posture', 'Recovery speed', 'Mid-flower stress signals'],
    overuse: ['Soft growth', 'Unnecessary additive stacking', 'EC creep'],
    deficiency: ['Poor recovery from stress', 'Slowed growth after environmental swings'],
    compatibility: 'Pairs with ROOT-X in seedling and PK-X in mid flower.',
    storage: 'Store sealed and protected from heat.',
    shelfLife: 'Best used within 12 months of opening.',
    mixing: 'Add after base or bloom products are fully diluted.',
    tips: ['Useful after heat events.', 'In Recovery Mode, prioritise stability over higher dose.'],
  },
  {
    id: 'pk-x',
    name: 'PK-X',
    purpose: 'Bloom booster',
    theme: 'Orange',
    accent: '#ff8a1f',
    stages: ['early-flower', 'mid-flower'],
    dose: { beginner: [0.3, 0.5], standard: [0.5, 0.9], professional: [0.9, 1.3] },
    when: 'Introduce gradually in early flower and maintain through mid flower as appropriate.',
    why: 'Bloom demand increases phosphorus and potassium requirements during flower formation.',
    how: 'Adds bloom-focused PK support without replacing disciplined base-feed control.',
    watchFor: ['Leaf tip response', 'Flower set', 'Runoff EC trend'],
    overuse: ['Tip burn', 'Runoff EC climbing', 'Calcium or magnesium antagonism'],
    deficiency: ['Weak flower set', 'Slow bloom momentum', 'Poor bulking response'],
    compatibility: 'Pairs with TRACE-X in early flower and VITAL-X in mid flower.',
    storage: 'Store closed in a cool, dry place.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Add after base nutrients and before final pH adjustment.',
    tips: ['Do not jump dose sharply at transition.', 'Reduce if runoff EC rises over multiple feeds.'],
  },
  {
    id: 'ripen-x',
    name: 'RIPEN-X',
    purpose: 'Late flower finisher',
    theme: 'Red',
    accent: '#ff3b45',
    stages: ['late-flower'],
    dose: { beginner: [0.4, 0.7], standard: [0.7, 1.1], professional: [1.1, 1.5] },
    when: 'Use in late flower when finishing strategy replaces bloom push strategy.',
    why: 'Late flower benefits from cleaner finishing and reduced nitrogen-heavy feeding.',
    how: 'Supports ripening emphasis while preparing for final flush timing.',
    watchFor: ['Natural fade', 'Harvest window', 'Runoff EC'],
    overuse: ['Over-accelerated fade', 'Stress near finish', 'Harsh EC pressure'],
    deficiency: ['Delayed finish', 'Weak late flower expression'],
    compatibility: 'Pairs with TRACE-X in late flower. Transition to FLUSH-X during flush.',
    storage: 'Store sealed and away from light.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Use in late flower feeds after checking current runoff condition.',
    tips: ['Do not use as a rescue product for unstable root zones.', 'Prepare flush plan early.'],
  },
  {
    id: 'trace-x',
    name: 'TRACE-X',
    purpose: 'Trace mineral support',
    theme: 'Yellow / Gold',
    accent: '#ffd23f',
    stages: ['early-flower', 'late-flower'],
    dose: { beginner: [0.15, 0.3], standard: [0.3, 0.5], professional: [0.5, 0.8] },
    when: 'Use during early flower transition and late flower trace support windows.',
    why: 'Bloom-phase trace balance supports metabolism, flower quality, and consistency.',
    how: 'Provides trace mineral support when bloom products alter nutrient demand.',
    watchFor: ['New growth tone', 'Flower development', 'Stacking with other micros'],
    overuse: ['Micro excess symptoms', 'Unexpected pH movement', 'Leaf spotting'],
    deficiency: ['Pale new growth', 'Uneven bloom response', 'Reduced vitality'],
    compatibility: 'Pairs with PK-X in early flower and RIPEN-X in late flower.',
    storage: 'Keep sealed, cool, and out of direct light.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Add after core feed products are diluted.',
    tips: ['Use measured rates; trace products are not “more is better.”', 'Avoid stacking with MICRO-X without a reason.'],
  },
  {
    id: 'iron-x',
    name: 'IRON-X',
    purpose: 'Iron supplement',
    theme: 'Gunmetal / Silver',
    accent: '#a8b3bd',
    stages: ['seedling', 'vegetative', 'early-flower', 'mid-flower', 'late-flower'],
    dose: { beginner: [0.1, 0.2], standard: [0.2, 0.4], professional: [0.4, 0.6] },
    when: 'Use as a corrective or support supplement when iron-related symptoms are present.',
    why: 'Iron availability is critical for chlorophyll formation and healthy new growth.',
    how: 'Targets iron support without changing the full nutrient program.',
    watchFor: ['Interveinal chlorosis', 'Root-zone pH', 'Overcorrection'],
    overuse: ['Dark spotting', 'Micronutrient imbalance', 'Lockout risk'],
    deficiency: ['Yellowing new growth', 'Pale tips', 'Slow recovery after pH drift'],
    compatibility: 'Use only when indicated by symptoms or pH history.',
    storage: 'Keep tightly sealed and away from contamination.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Add at corrective rates after primary products are diluted.',
    tips: ['Check pH before assuming deficiency.', 'Use Recovery Mode if lockout risk is present.'],
  },
  {
    id: 'flush-x',
    name: 'FLUSH-X',
    purpose: 'Flush solution',
    theme: 'Aqua / Bright Blue',
    accent: '#33d9ff',
    stages: ['flush'],
    dose: { beginner: [0.5, 0.8], standard: [0.8, 1.2], professional: [1.2, 1.5] },
    when: 'Use during the final flush window or when a root-zone cleanup is required.',
    why: 'Final flush strategy helps reduce excess salts and stabilise finish quality.',
    how: 'Supports root-zone cleanup and a disciplined transition out of feeding.',
    watchFor: ['Runoff EC decline', 'Plant fade', 'Harvest timing'],
    overuse: ['Premature nutrient depletion', 'Overwatering stress', 'Unnecessary flush duration'],
    deficiency: ['Not applicable as a feed nutrient', 'Use is timing-based rather than deficiency-based'],
    compatibility: 'Use during flush after finishing products are complete.',
    storage: 'Store sealed in a cool location.',
    shelfLife: 'Best used within 18 months of opening.',
    mixing: 'Mix into clean water and monitor runoff response.',
    tips: ['Start based on stage and harvest estimate.', 'Track runoff EC during the flush window.'],
  },
]

export const stageProducts: Record<Stage, ProductKey[]> = {
  seedling: ['root-x', 'vital-x'],
  vegetative: ['ax-pro', 'bx-pro', 'micro-x', 'root-x'],
  'early-flower': ['pk-x', 'trace-x'],
  'mid-flower': ['pk-x', 'vital-x'],
  'late-flower': ['ripen-x', 'trace-x'],
  flush: ['flush-x'],
}

export const modes: GrowMode[] = [
  'Beginner Mode',
  'Professional Cultivation Mode',
  'Yield Mode',
  'Quality Mode',
  'Speed Mode',
  'Low Maintenance Mode',
  'Recovery Mode',
]

export const defaultOnboardingSetup: OnboardingSetup = {
  medium: 'coco',
  experience: 'beginner',
  stage: 'vegetative',
  feedingStyle: 'safe',
  delivery: 'hand-water',
  environment: 'moderate',
  mode: 'Beginner Mode',
}

export const mockProfile = {
  name: 'Mara Chen',
  growStyle: 'coco' as Medium,
  experience: 'standard' as Experience,
  goal: 'Quality Mode' as GrowMode,
  subscription: 'Catalyx Professional Monthly',
  productsOwned: ['A-X PRO', 'B-X PRO', 'MICRO-X', 'ROOT-X', 'VITAL-X', 'PK-X', 'TRACE-X'],
}

export const activeGrow = {
  id: 'grow-alpha',
  name: 'Run Alpha',
  strain: 'Aurora cultivar',
  startDate: '2026-04-04',
  stage: 'mid-flower' as Stage,
  medium: 'coco' as Medium,
  lightSchedule: '12 / 12',
  goal: 'Quality Mode' as GrowMode,
  feedingStyle: 'Measured runoff with adaptive EC',
  healthStatus: 'Stable with mild EC pressure',
  notes: 'Strong flower set; watch runoff trend after PK-X.',
}

export const feedLogs = [
  { date: 'May 10', litres: 18, ec: 1.8, ph: 5.9, runoffEc: 2.0, runoffPh: 6.1, response: 'Stable posture', products: ['PK-X', 'VITAL-X'] },
  { date: 'May 12', litres: 18, ec: 1.9, ph: 5.8, runoffEc: 2.2, runoffPh: 6.2, response: 'Slight tip brightness', products: ['PK-X', 'VITAL-X'] },
  { date: 'May 14', litres: 20, ec: 1.9, ph: 5.9, runoffEc: 2.35, runoffPh: 6.25, response: 'Good flower swell', products: ['PK-X', 'VITAL-X'] },
]

export const checkIns = [
  { date: 'May 14', leaf: 'Deep green', droop: 1, growth: 'Strong', stress: 2, environment: 84, pest: 'None', feel: 'Confident' },
  { date: 'May 15', leaf: 'Balanced', droop: 1, growth: 'Strong', stress: 1, environment: 88, pest: 'None', feel: 'Stable' },
  { date: 'May 16', leaf: 'Slight tip brightness', droop: 2, growth: 'Strong', stress: 3, environment: 82, pest: 'None', feel: 'Monitor runoff' },
]

export const reminders = [
  { title: 'Next feed', due: 'Today 6:00 PM', detail: 'Use adaptive mid-flower recommendation.' },
  { title: 'Daily check-in', due: 'Today', detail: 'Record leaf tone, droop, stress, and environment.' },
  { title: 'Photo week', due: 'Tomorrow', detail: 'Capture canopy and flower close-up for comparison.' },
  { title: 'Weekly review', due: 'Monday', detail: 'Generate Professional grow review.' },
]

export const scoreBreakdown = [
  { label: 'Catalyx Grow Score', value: 86, note: '+ stable pH, + consistent feeds, - runoff EC rising' },
  { label: 'Plant Health Score', value: 88, note: '+ strong posture, + low stress, - minor tip brightness' },
  { label: 'Feed Stability Score', value: 79, note: '+ pH range suitable, - EC trend elevated' },
  { label: 'Environment Consistency Score', value: 84, note: '+ VPD close, - humidity drift after lights on' },
  { label: 'Root Zone Health Rating', value: 81, note: 'Stable but monitoring salt load' },
  { label: 'Growth Momentum Rating', value: 90, note: 'Strong flower development trend' },
  { label: 'Nutrient Balance Rating', value: 82, note: 'PK response strong, avoid stacking trace too hard' },
  { label: 'Catalyx Performance Rating', value: 87, note: 'Outperforming previous week by 9%' },
]

export function getProduct(id: ProductKey) {
  return products.find((product) => product.id === id)!
}

export function productsForStage(stage: Stage) {
  return stageProducts[stage].map(getProduct)
}

export function doseFor(product: CatalyxProduct, experience: Experience, mode: GrowMode, medium: Medium) {
  const [low, high] = product.dose[experience]
  let target = (low + high) / 2
  if (mode === 'Beginner Mode' || mode === 'Recovery Mode') target = low
  if (mode === 'Yield Mode' || mode === 'Professional Cultivation Mode') target = high
  if (medium === 'soil') target *= 0.72
  if (medium === 'hydro') target *= 0.9
  return Number(target.toFixed(2))
}

export function calculateFeed(stage: Stage, litres: number, experience: Experience, mode: GrowMode, medium: Medium) {
  return productsForStage(stage).map((product) => {
    const mlPerL = doseFor(product, experience, mode, medium)
    return { product, mlPerL, totalMl: Number((mlPerL * litres).toFixed(1)) }
  })
}

const targetEcByStage: Record<Stage, Record<Experience, [number, number]>> = {
  seedling: { beginner: [0.4, 0.6], standard: [0.5, 0.8], professional: [0.6, 0.9] },
  vegetative: { beginner: [0.8, 1.2], standard: [1.2, 1.6], professional: [1.5, 1.9] },
  'early-flower': { beginner: [1.0, 1.4], standard: [1.4, 1.8], professional: [1.7, 2.1] },
  'mid-flower': { beginner: [1.1, 1.5], standard: [1.5, 1.9], professional: [1.8, 2.2] },
  'late-flower': { beginner: [0.9, 1.2], standard: [1.2, 1.6], professional: [1.4, 1.8] },
  flush: { beginner: [0.2, 0.5], standard: [0.2, 0.5], professional: [0.2, 0.6] },
}

const phByMedium: Record<Medium, [number, number]> = {
  hydro: [5.6, 6.1],
  coco: [5.7, 6.2],
  soil: [6.2, 6.7],
}

const mediumDoseModifier: Record<Medium, number> = {
  hydro: 0.9,
  coco: 1,
  soil: 0.72,
}

const runoffModifier: Record<RunoffTrend, number> = {
  stable: 1,
  rising: 0.88,
  falling: 1.06,
}

const stressModifier: Record<StressLevel, number> = {
  low: 1,
  moderate: 0.93,
  high: 0.82,
}

export type AdaptiveFeedInput = {
  stage: Stage
  litres: number
  experience: Experience
  mode: GrowMode
  medium: Medium
  runoffTrend?: RunoffTrend
  stressLevel?: StressLevel
}

export type AdaptiveFeedItem = {
  product: CatalyxProduct
  lowMlPerL: number
  highMlPerL: number
  baseMlPerL: number
  adaptiveMlPerL: number
  totalMl: number
}

export type AdaptiveFeedPlan = {
  items: AdaptiveFeedItem[]
  totalMl: number
  targetEc: [number, number]
  targetPh: [number, number]
  runoffTarget: string
  adjustmentPercent: number
  adjustmentLabel: string
  warnings: string[]
  instructions: string[]
}

function roundDose(value: number) {
  return Number(value.toFixed(2))
}

function clamp(value: number, low: number, high: number) {
  return Math.min(Math.max(value, low), high)
}

function modeModifier(mode: GrowMode) {
  if (mode === 'Beginner Mode' || mode === 'Recovery Mode') return 0.9
  if (mode === 'Yield Mode' || mode === 'Professional Cultivation Mode') return 1.08
  if (mode === 'Speed Mode') return 1.04
  if (mode === 'Low Maintenance Mode') return 0.92
  return 1
}

function stageInstruction(stage: Stage) {
  const instructions: Record<Stage, string> = {
    seedling: 'Keep EC low, avoid additive stacking, and prioritise root establishment over speed.',
    vegetative: 'Run A-X PRO and B-X PRO as the base, then add vegetative support products only after base nutrients are diluted.',
    'early-flower': 'Introduce bloom support gradually and avoid sharp EC jumps during transition.',
    'mid-flower': 'Hold feed strength steady unless runoff and plant response support a small increase.',
    'late-flower': 'Reduce nitrogen pressure and move toward finish quality instead of vegetative push.',
    flush: 'Use cleanup strategy, track runoff EC decline, and avoid reintroducing base nutrients.',
  }
  return instructions[stage]
}

export function calculateAdaptiveFeed({
  stage,
  litres,
  experience,
  mode,
  medium,
  runoffTrend = 'stable',
  stressLevel = 'low',
}: AdaptiveFeedInput): AdaptiveFeedPlan {
  const adjustment = mediumDoseModifier[medium] * runoffModifier[runoffTrend] * stressModifier[stressLevel] * modeModifier(mode)
  const adjustmentPercent = Math.round((adjustment - 1) * 100)
  const targetEc = targetEcByStage[stage][experience]
  const targetPh = phByMedium[medium]

  const items = productsForStage(stage).map((product) => {
    const [low, high] = product.dose[experience]
    const modeBase = doseFor(product, experience, mode, 'coco')
    const adjusted = modeBase * mediumDoseModifier[medium] * runoffModifier[runoffTrend] * stressModifier[stressLevel]
    const safetyLow = low * mediumDoseModifier[medium] * 0.75
    const safetyHigh = high * mediumDoseModifier[medium] * (experience === 'professional' ? 1.1 : 1)
    const adaptiveMlPerL = roundDose(clamp(adjusted, safetyLow, safetyHigh))

    return {
      product,
      lowMlPerL: roundDose(low * mediumDoseModifier[medium]),
      highMlPerL: roundDose(high * mediumDoseModifier[medium]),
      baseMlPerL: roundDose(modeBase * mediumDoseModifier[medium]),
      adaptiveMlPerL,
      totalMl: roundDose(adaptiveMlPerL * litres),
    }
  })

  const warnings = [
    runoffTrend === 'rising' ? 'Runoff EC is rising: hold or reduce feed strength until runoff stabilises.' : '',
    stressLevel === 'high' ? 'High plant stress: reduce feed pressure and prioritise environment stability.' : '',
    mode === 'Recovery Mode' ? 'Recovery Mode: avoid aggressive increases and simplify the next feed.' : '',
    stage === 'flush' ? 'Flush stage: do not stack base nutrients with FLUSH-X.' : '',
  ].filter(Boolean)

  return {
    items,
    totalMl: roundDose(items.reduce((sum, item) => sum + item.totalMl, 0)),
    targetEc,
    targetPh,
    runoffTarget:
      medium === 'hydro'
        ? 'Reservoir EC stable within 0.2 and pH corrected before drift compounds.'
        : 'Runoff EC no more than 0.3 above input and pH inside the medium range.',
    adjustmentPercent,
    adjustmentLabel: adjustmentPercent === 0 ? 'Baseline' : adjustmentPercent > 0 ? `+${adjustmentPercent}%` : `${adjustmentPercent}%`,
    warnings,
    instructions: [
      stageInstruction(stage),
      'Mix products one at a time into water. Never combine concentrates directly.',
      'If runoff rises twice in a row, reduce the next feed before increasing any product.',
    ],
  }
}

export function recommendationEngine({
  stage = activeGrow.stage,
  medium = activeGrow.medium,
  experience = mockProfile.experience,
  mode = mockProfile.goal,
  runoffTrend = 'rising',
}: {
  stage?: Stage
  medium?: Medium
  experience?: Experience
  mode?: GrowMode
  runoffTrend?: 'stable' | 'rising' | 'falling'
} = {}) {
  const stageSet = productsForStage(stage)
  const base = [
    {
      title: `${stageLabels[stage]} protocol active`,
      action: `Use ${stageSet.map((product) => product.name).join(' + ')} for the next feed.`,
      why: `The selected ${medium} growth stage maps to the official Catalyx ${stageLabels[stage]} product protocol.`,
      confidence: 'High',
      severity: 'recommended',
    },
    {
      title: runoffTrend === 'rising' ? 'Runoff EC elevated' : 'Feed values stable',
      action: runoffTrend === 'rising' ? 'Maintain current feed strength and reduce by 10% if runoff rises again.' : 'Maintain the same feed strength next time.',
      why: runoffTrend === 'rising' ? 'Runoff EC has risen over the last 3 feeds, indicating possible salt buildup.' : 'Input and runoff values are holding inside the target range.',
      confidence: feedLogs.length >= 3 ? 'High' : 'Medium',
      severity: runoffTrend === 'rising' ? 'warning' : 'stable',
    },
    {
      title: mode === 'Recovery Mode' ? 'Recovery Mode Activated' : 'Smart feed adjustment',
      action:
        mode === 'Recovery Mode'
          ? 'Simplify the next 48 hours: stable pH, moderate EC, measured runoff, and no aggressive additive increases.'
          : experience === 'beginner'
            ? 'Use the beginner dose band and avoid increasing EC until two stable feeds are logged.'
            : 'Suggested next-feed adjustment: hold EC steady and monitor leaf tips after PK-X.',
      why:
        mode === 'Recovery Mode'
          ? 'Recovery Mode reduces feed pressure and prioritises root-zone stability.'
          : 'Stage, experience level, runoff trend, and recent plant response support a conservative adjustment.',
      confidence: 'Medium',
      severity: mode === 'Recovery Mode' ? 'warning' : 'recommended',
    },
  ]

  if (stage === 'late-flower') {
    base.push({
      title: 'Late flower nitrogen risk',
      action: 'Prioritise RIPEN-X and avoid returning to nitrogen-heavy vegetative feeding.',
      why: 'Late flower stage favours finishing support over vegetative momentum.',
      confidence: 'High',
      severity: 'warning',
    })
  }

  if (stage === 'flush') {
    base.push({
      title: 'Flush window active',
      action: 'Transition to FLUSH-X and track runoff EC decline.',
      why: 'The selected stage is Flush, so finishing products should give way to root-zone cleanup.',
      confidence: 'High',
      severity: 'recommended',
    })
  }

  return base
}

export const protocols = [
  ['Starter Protocol', 'Seedlings and transplants', ['ROOT-X', 'VITAL-X'], 'Seedling', 'Faster establishment and lower transplant stress'],
  ['Performance Protocol', 'Dialed-in standard runs', ['A-X PRO', 'B-X PRO', 'MICRO-X', 'PK-X'], 'Vegetative to Mid Flower', 'Balanced momentum with controlled bloom support'],
  ['Heavy Yield Protocol', 'Experienced growers pushing biomass', ['A-X PRO', 'B-X PRO', 'PK-X', 'TRACE-X'], 'Early to Mid Flower', 'Higher bloom drive with runoff monitoring'],
  ['Terpene Protocol', 'Quality-focused finishing', ['VITAL-X', 'RIPEN-X', 'TRACE-X'], 'Mid to Late Flower', 'Cleaner finish and expression support'],
  ['Recovery Protocol', 'Stressed plants or root-zone instability', ['VITAL-X', 'IRON-X', 'FLUSH-X'], 'Any corrective window', 'Stabilise pH, runoff, and plant response'],
  ['Fast Veg Protocol', 'Short veg cycles', ['A-X PRO', 'B-X PRO', 'MICRO-X', 'ROOT-X'], 'Vegetative', 'Rapid canopy development'],
  ['Bloom Push Protocol', 'Flower transition', ['PK-X', 'TRACE-X'], 'Early Flower', 'Introduce bloom support gradually'],
  ['Flush & Finish Protocol', 'Final window', ['RIPEN-X', 'FLUSH-X'], 'Late Flower to Flush', 'Disciplined finish and cleanup'],
  ['Dense Flower Recipe', 'Flower density', ['PK-X', 'VITAL-X', 'TRACE-X'], 'Mid Flower', 'Strong flower swell with stress support'],
  ['Heat Stress Recipe', 'Environmental stress', ['VITAL-X', 'ROOT-X'], 'Any stage', 'Maintain vitality during hot cycles'],
  ['Easy Beginner Recipe', 'Simple safe feeding', ['A-X PRO', 'B-X PRO', 'ROOT-X'], 'Vegetative', 'Low-risk consistency'],
  ['Heavy Feed Recipe', 'Professional tuning', ['A-X PRO', 'B-X PRO', 'MICRO-X', 'PK-X'], 'Vegetative to Mid Flower', 'Aggressive output with strict monitoring'],
] as const

export const universityLessons = [
  'Nutrient fundamentals',
  'pH basics',
  'pH mastery',
  'EC / ppm explained',
  'Runoff explained',
  'Hydro vs coco vs soil',
  'Deficiency diagnosis',
  'Overfeeding signs',
  'Underfeeding signs',
  'Flowering optimisation',
  'Dryback strategy',
  'Root zone science',
  'Yield optimisation',
  'Flush timing',
  'Product mixing basics',
  'How to read runoff',
  'How Catalyx products work together',
  'Beginner feeding basics',
  'Professional feed tuning',
]

export const labNotes = [
  'Formulation philosophy: build predictable base nutrition before adding performance pressure.',
  'Nutrient science: stable uptake comes from balancing stage demand, root-zone pH, EC, and media behaviour.',
  'Product system logic: A-X PRO and B-X PRO create the base; stage products tune the growth window.',
  'Why ratios matter: a strong grow is not just more nutrient, it is the right nutrient at the right time.',
  'Why consistency matters: stable logs make every adjustment more confident.',
  'Why pH matters: drift can mimic deficiency by limiting nutrient availability.',
  'Why runoff trends matter: runoff shows what the root zone is becoming, not just what entered the pot.',
  'Professional cultivation concept: optimise by trend, not by reacting to a single reading.',
]
