import { readLocalList, writeLocalList } from '@/lib/persistence'
import { hasActiveRewardUnlock } from '@/lib/rewards'
import type { SubscriptionPlanKey } from '@/lib/subscriptions'

export type PlanTier = 'free' | 'professional'

export type FeatureFlagRecord = {
  featureKey: string
  label: string
  planRequired: PlanTier
  enabled: boolean
  description: string
}

export const defaultFeatureFlags: FeatureFlagRecord[] = [
  { featureKey: 'basic_grow_tracker', label: 'Grow tracker', planRequired: 'free', enabled: true, description: 'Create and track grows, stages, and health notes.' },
  { featureKey: 'basic_feed_calculator', label: 'Feed calculator', planRequired: 'free', enabled: true, description: 'Stage-based ml/L calculator with safety bands.' },
  { featureKey: 'basic_feed_reminders', label: 'Feed reminders', planRequired: 'free', enabled: true, description: 'Calendar reminders for feeds and check-ins.' },
  { featureKey: 'basic_product_info', label: 'Product info', planRequired: 'free', enabled: true, description: 'Catalogue cards with purpose, when to use, and dose preview.' },
  { featureKey: 'limited_photo_uploads', label: 'Photo uploads', planRequired: 'free', enabled: true, description: 'Basic photo logging with limited timeline depth.' },
  { featureKey: 'ai_copilot_daily_guidance', label: 'AI Copilot (basic)', planRequired: 'free', enabled: true, description: 'Daily next-action guidance for all signed-in users.' },
  { featureKey: 'advanced_feed_charts', label: 'Advanced feed charts', planRequired: 'professional', enabled: true, description: 'Adaptive charts by medium, runoff trend, and stress.' },
  { featureKey: 'full_product_education', label: 'Full product education', planRequired: 'professional', enabled: true, description: 'Deep guides: mixing, compatibility, overuse, deficiency.' },
  { featureKey: 'plant_photo_timeline', label: 'Plant photo timeline', planRequired: 'professional', enabled: true, description: 'Stage-linked photo history and comparison.' },
  { featureKey: 'ec_ph_runoff_analytics', label: 'EC / pH / runoff analytics', planRequired: 'professional', enabled: true, description: 'Trend interpretation and salt-load warnings.' },
  { featureKey: 'inventory_tracking', label: 'Inventory tracking', planRequired: 'professional', enabled: true, description: 'Usage, days left, and reorder timing on My Shelf.' },
  { featureKey: 'stage_recommendations', label: 'Stage recommendations', planRequired: 'professional', enabled: true, description: 'Stage-based product and feed suggestions from logs.' },
  { featureKey: 'deficiency_troubleshooting', label: 'Deficiency guides', planRequired: 'professional', enabled: true, description: 'Lockout vs deficiency decision trees.' },
  { featureKey: 'custom_reminders', label: 'Custom reminders', planRequired: 'professional', enabled: true, description: 'Feed, flush, and environment reminder templates.' },
  { featureKey: 'export_grow_journal_pdf', label: 'Export grow journal PDF', planRequired: 'professional', enabled: true, description: 'Professional PDF export of journal and feeds.' },
  { featureKey: 'weekly_grow_reviews', label: 'Weekly Grow Review', planRequired: 'professional', enabled: true, description: 'Monday score movement and next-week plan.' },
  { featureKey: 'recovery_playbooks', label: 'Recovery Playbooks', planRequired: 'professional', enabled: true, description: '48-hour correction plans with exit criteria.' },
  { featureKey: 'outcome_forecasting', label: 'Outcome forecasting', planRequired: 'professional', enabled: true, description: '7-day crop direction from consistency signals.' },
  { featureKey: 'compare_my_grow', label: 'Compare My Grow', planRequired: 'professional', enabled: true, description: 'Benchmark current run against prior grows.' },
  { featureKey: 'full_catalyx_intelligence', label: 'Catalyx Intelligence depth', planRequired: 'professional', enabled: true, description: 'Evidence stack, dose simulator, and risk radar.' },
]

const storageKey = 'catalyx-feature-flags'

export function readFeatureFlags(): FeatureFlagRecord[] {
  const stored = readLocalList<FeatureFlagRecord>(storageKey)
  if (!stored.length) return defaultFeatureFlags
  const storedKeys = new Set(stored.map((row) => row.featureKey))
  const merged = [
    ...stored,
    ...defaultFeatureFlags.filter((row) => !storedKeys.has(row.featureKey)),
  ]
  return merged
}

export function writeFeatureFlags(flags: FeatureFlagRecord[]) {
  writeLocalList(storageKey, flags)
}

export function resolveFeatureAccess(
  featureKey: string,
  userPlan: SubscriptionPlanKey | 'professional' = 'free',
  flags: FeatureFlagRecord[] = readFeatureFlags(),
  userId = 'guest'
) {
  const flag = flags.find((row) => row.featureKey === featureKey)
  if (!flag || !flag.enabled) {
    return { allowed: false, preview: false, planRequired: 'professional' as PlanTier, source: 'locked' as const }
  }
  if (flag.planRequired === 'free') {
    return { allowed: true, preview: false, planRequired: 'free' as PlanTier, source: 'free' as const }
  }
  if (userPlan === 'professional' || userPlan === 'professional_monthly' || userPlan === 'professional_yearly') {
    return { allowed: true, preview: false, planRequired: flag.planRequired, source: 'plan' as const }
  }
  if (hasActiveRewardUnlock(featureKey, userId)) {
    return { allowed: true, preview: false, planRequired: flag.planRequired, source: 'reward' as const }
  }
  return { allowed: false, preview: true, planRequired: flag.planRequired, source: 'locked' as const }
}
