import type { ProductKey } from '@/lib/catalyx'

export type ProProductAlias = {
  keys: ProductKey[]
  aliases: string[]
  role: string
  whenToUse: string
  doNotMix: string
  beginnerDose: string
  proDose: string
  overuseSigns: string[]
  deficiencySigns: string[]
  storage: string
  compatibility: string
  weeklyTips: Record<string, string>
}

export const proProductGuides: ProProductAlias[] = [
  {
    keys: ['ax-pro'],
    aliases: ['A-X', 'Grow Base A', 'A-X PRO'],
    role: 'Vegetative base Part A — calcium, nitrogen, and iron backbone.',
    whenToUse: 'Every veg feed and any base-feed cycle where structural growth is the priority.',
    doNotMix: 'Never combine concentrate with B-X concentrate. Dilute each into water separately.',
    beginnerDose: '1.2–1.8 ml/L until runoff and leaf colour stay stable for three feeds.',
    proDose: '2.4–3.0 ml/L only when runoff EC is flat and canopy colour is even.',
    overuseSigns: ['Dark clawing', 'Tip burn on new growth', 'Runoff EC climbing without yield gain'],
    deficiencySigns: ['Pale new growth', 'Weak internodes', 'Slow veg momentum'],
    storage: 'Cool, dark, sealed. Avoid heat above 30°C.',
    compatibility: 'Always paired with B-X PRO. Add supplements after both parts are diluted.',
    weeklyTips: {
      vegetative: 'Hold A/B ratio steady; increase only after two stable runoff readings.',
      'early-flower': 'Transition toward bloom supplements — do not keep pushing veg strength.',
    },
  },
  {
    keys: ['bx-pro'],
    aliases: ['B-X', 'Grow Base B', 'B-X PRO'],
    role: 'Vegetative base Part B — phosphorus, potassium, and magnesium support.',
    whenToUse: 'With A-X PRO during veg and stable base-feed windows.',
    doNotMix: 'Do not pre-mix A and B concentrates. Silica (Struct-X style) before bases if used.',
    beginnerDose: '1.2–1.8 ml/L matched to Part A.',
    proDose: '2.4–3.0 ml/L when salt trend is stable and VPD is controlled.',
    overuseSigns: ['Burnt tips', 'Tight inter-nodes with dark leaves', 'Runoff EC spike'],
    deficiencySigns: ['Purple stems', 'Weak flower sites later', 'Slow phosphorus uptake signs'],
    storage: 'Same as Part A — sealed, dark, cool.',
    compatibility: 'Second part after A-X is fully diluted in the tank.',
    weeklyTips: {
      vegetative: 'If runoff rises, reduce both A and B together — not one side only.',
      flush: 'Drop to flush protocol before stacking finish products.',
    },
  },
  {
    keys: ['root-x'],
    aliases: ['Root-X', 'ROOT-X'],
    role: 'Root establishment and early stress recovery support.',
    whenToUse: 'Seedling through early veg; light doses after transplant or repot.',
    doNotMix: 'Avoid stacking with aggressive PK at first root-set week.',
    beginnerDose: '0.2–0.4 ml/L in first two weeks after transplant.',
    proDose: '0.7–1.0 ml/L when media is sterile and runoff is stable.',
    overuseSigns: ['Soft tips with no gain in root mass', 'Odd oily sheen on media surface'],
    deficiencySigns: ['Slow root-out time', 'Wilting soon after watering'],
    storage: 'Use within 12 months of opening; keep cap tight.',
    compatibility: 'Safe with VITAL-X in seedling; reduce if runoff EC rises.',
    weeklyTips: {
      seedling: 'Low EC, consistent moisture — roots before bloom pressure.',
      vegetative: 'Taper if canopy is already dark green and runoff is climbing.',
    },
  },
  {
    keys: ['micro-x', 'trace-x'],
    aliases: ['Balance-X', 'Calmag', 'MICRO-X', 'TRACE-X'],
    role: 'Micronutrient and balance layer — iron, calcium routing, trace support.',
    whenToUse: 'When using RO water, coco, or when new growth shows trace washout.',
    doNotMix: 'Do not pour undiluted into concentrated PK — dilute in sequence.',
    beginnerDose: '0.3–0.6 ml/L MICRO-X; add TRACE-X only when deficiency is confirmed.',
    proDose: 'Up to 1.4 ml/L combined trace pressure only with stable pH and flat runoff.',
    overuseSigns: ['Bronze spotting with high EC', 'Lockout masked as deficiency'],
    deficiencySigns: ['Interveinal chlorosis on new leaves', 'Weak calyx formation'],
    storage: 'Protect from light and keep trace products sealed to avoid contamination.',
    compatibility: 'After bases, before PK in most Catalyx sequences.',
    weeklyTips: {
      'mid-flower': 'If tips bronze with rising EC, hold traces and simplify the tank.',
      flush: 'Often unnecessary in final flush week unless RO + coco.',
    },
  },
  {
    keys: ['vital-x'],
    aliases: ['Bloom-X', 'VITAL-X', 'VITAL-X bloom support'],
    role: 'Mid-flower bloom support and stress buffering.',
    whenToUse: 'Mid flower when swell is increasing and stress is low.',
    doNotMix: 'Avoid stacking with heavy PK the same day runoff EC rises.',
    beginnerDose: '0.3–0.5 ml/L with stable runoff.',
    proDose: '0.9–1.3 ml/L when VPD and runoff are both stable.',
    overuseSigns: ['Tip brightness after feed', 'Delayed dryback'],
    deficiencySigns: ['Flat flower swell', 'Pale upper canopy under strong light'],
    storage: 'Cool storage; shake before use if separated.',
    compatibility: 'Pairs with PK-X in mid flower; hold if recovery mode is active.',
    weeklyTips: {
      'mid-flower': 'Best results when PK is stable first — do not chase swell with both at once.',
      'late-flower': 'Reduce before RIPEN-X finish phase.',
    },
  },
  {
    keys: ['pk-x'],
    aliases: ['PK-X', 'Ignite-X', 'PK booster'],
    role: 'Phosphorus-potassium pressure for early and mid flower.',
    whenToUse: 'Early flower onset through mid flower when runoff is stable.',
    doNotMix: 'Do not stack with aggressive trace + PK same feed after runoff rise.',
    beginnerDose: '0.15–0.3 ml/L first week of flower.',
    proDose: '0.5–0.8 ml/L only after two stable runoff EC readings.',
    overuseSigns: ['Tip burn', 'Runoff EC jump', 'Dark greasy leaves'],
    deficiencySigns: ['Small flowers', 'Slow calyx swell', 'Weak PK response'],
    storage: 'Standard liquid storage; crystallisation means temperature swing.',
    compatibility: 'After bases; before RIPEN-X in late flower.',
    weeklyTips: {
      'early-flower': 'Introduce gradually — one increase per stable runoff cycle.',
      'mid-flower': 'Hold strength if runoff climbed in the last two feeds.',
    },
  },
  {
    keys: ['ripen-x'],
    aliases: ['Fade-X', 'RIPEN-X', 'finish'],
    role: 'Late-flower finish and fade support.',
    whenToUse: 'Late flower when trichome maturity and fade timing match your goal.',
    doNotMix: 'Avoid with high PK same week — choose finish OR push, not both.',
    beginnerDose: '0.5–0.8 ml/L for controlled fade.',
    proDose: '1.2–1.5 ml/L only with stable pH and no active lockout.',
    overuseSigns: ['Rapid leaf fade with stalled swell', 'Runoff pH drift'],
    deficiencySigns: ['Green calyx late in cycle', 'No fade progression'],
    storage: 'Use within season; do not freeze.',
    compatibility: 'TRACE-X optional; simplify tank before flush.',
    weeklyTips: {
      'late-flower': 'Match fade speed to environment — hot rooms fade faster.',
      flush: 'Transition to FLUSH-X within the planned flush window.',
    },
  },
  {
    keys: ['flush-x'],
    aliases: ['Flush-X', 'FLUSH-X'],
    role: 'Final flush and salt reduction.',
    whenToUse: 'Scheduled flush week or corrective salt reduction.',
    doNotMix: 'No PK, no PK boosters, no bloom additives in the same tank.',
    beginnerDose: '0.2–0.5 ml/L with plain water rhythm.',
    proDose: 'Up to 0.6 ml/L with monitored runoff drop.',
    overuseSigns: ['Excessive yellowing before swell completes'],
    deficiencySigns: ['High runoff EC entering flush week'],
    storage: 'Standard; label flush dates on bottle.',
    compatibility: 'Water + FLUSH-X only during flush protocol.',
    weeklyTips: {
      flush: 'Log runoff EC daily until input and runoff converge.',
    },
  },
]

export function guideForProduct(productId: ProductKey) {
  return proProductGuides.find((guide) => guide.keys.includes(productId))
}

export function weeklyStageTip(productId: ProductKey, stage: string) {
  const guide = guideForProduct(productId)
  if (!guide) return null
  return guide.weeklyTips[stage] ?? Object.values(guide.weeklyTips)[0] ?? null
}
