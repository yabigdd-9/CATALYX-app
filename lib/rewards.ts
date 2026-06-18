import { readLocalObject, storageKeys, writeLocalObject } from '@/lib/persistence'
import type { SubscriptionPlanKey } from '@/lib/subscriptions'

export type CxMembershipTier = 'free' | 'monthly' | 'yearly'
export type CxRewardCategory =
  | 'digital'
  | 'boosts'
  | 'store-credit'
  | 'subscriber-exclusive'
  | 'physical'
  | 'limited-time'
  | 'founder-rare'
export type CxRewardKind =
  | 'digital_unlock'
  | 'boost'
  | 'store_credit'
  | 'physical'
  | 'badge'
  | 'voucher'
export type CxRewardRarity = 'common' | 'uncommon' | 'rare' | 'very-rare' | 'ultra-rare'
export type CxLedgerEventType = 'earn' | 'spend' | 'adjustment' | 'expiry' | 'reversal' | 'refund' | 'bonus'
export type CxLedgerSource =
  | 'account'
  | 'purchase'
  | 'daily_check_in'
  | 'streak_bonus'
  | 'mission'
  | 'wheel'
  | 'achievement'
  | 'referral_signup'
  | 'referral_purchase'
  | 'reward_redemption'
  | 'admin'
  | 'refund'
export type CxLedgerStatus = 'approved' | 'pending' | 'expired' | 'cancelled' | 'reversed'
export type CxPlantStage = 'Seedling' | 'Vegetative' | 'Blooming' | 'Elite' | 'Legendary'

export type CxRewardDefinition = {
  id: string
  title: string
  description: string
  category: CxRewardCategory
  kind: CxRewardKind
  costCx: number
  rarity: CxRewardRarity
  oneTime?: boolean
  repeatable?: boolean
  consumable?: boolean
  permanent?: boolean
  featured?: boolean
  visible?: boolean
  active?: boolean
  limitedQuantity?: number | null
  redeemedCount?: number
  minimumTier?: CxMembershipTier
  milestoneStreakRequired?: number
  startAt?: string | null
  endAt?: string | null
  cooldownHours?: number
  perUserCap?: number
  label?: string
  accent: string
}

export type CxRewardConfig = {
  pointValuePer100Cx: Record<CxMembershipTier, number>
  purchaseEarnRate: number
  inactivityExpiryDays: number
  pointsExpiryWarningDays: number
  minimumStoreCreditRedemptionCx: number
  minimumCreditOrderSubtotalCents: number
  allowPromoStacking: boolean
  allowFreeShippingStacking: boolean
  allowSubscriptionCreditUse: boolean
  allowMultipleCreditRewardsPerOrder: boolean
  suspiciousFlagsEnabled: boolean
  rewardAuditEnabled: boolean
  reversePointsOnRefunds: boolean
  dailyCheckInSchedule: number[]
  streakMilestoneBonuses: Record<string, number>
  dailyFreeWheelSpins: number
  monthlySubscriberExtraWheelWeight: number
  yearlySubscriberExtraWheelWeight: number
}

export type CxWheelSlice = {
  id: string
  label: string
  rewardType: 'cx' | 'extra_spin' | 'free_shipping' | 'badge' | 'theme' | 'mystery_crate' | 'double_cx' | 'golden_ticket'
  cxAmount?: number
  rewardId?: string
  baseWeight: number
}

export type CxLedgerEntry = {
  id: string
  userId: string
  eventType: CxLedgerEventType
  source: CxLedgerSource
  status: CxLedgerStatus
  pointsDelta: number
  storeCreditDeltaCents: number
  seedTokenDelta: number
  title: string
  detail: string
  createdAt: string
  effectiveAt: string
  expiresAt?: string | null
  idempotencyKey: string
  metadata?: Record<string, string | number | boolean | null>
}

export type CxNotification = {
  id: string
  kind:
    | 'daily_check_in_available'
    | 'streak_at_risk'
    | 'reward_unlocked'
    | 'points_earned'
    | 'reward_redeemed'
    | 'wheel_ready'
    | 'upgrade_reminder'
    | 'seasonal_reward'
    | 'points_expiring'
  title: string
  body: string
  createdAt: string
}

export type CxAchievementDefinition = {
  id: string
  title: string
  description: string
  points: number
  badgeTitle?: string
}

export type CxAchievementState = {
  id: string
  unlockedAt: string
  badgeTitle?: string
}

export type CxMissionDefinition = {
  id: string
  title: string
  description: string
  target: number
  rewardCx: number
  accent: string
  progressKey: keyof CxMissionActivitySummary
}

export type CxMissionActivitySummary = {
  growUpdatesThisWeek: number
  feedSchedulesThisWeek: number
  checkInsThisWeek: number
  photoUploadsThisWeek: number
  journalEntriesThisWeek: number
}

export type CxMissionSnapshot = {
  id: string
  title: string
  description: string
  progress: number
  target: number
  rewardCx: number
  accent: string
  claimed: boolean
  readyToClaim: boolean
  weekKey: string
}

export type CxRewardProfile = {
  userId: string
  createdAt: string
  lastActivityAt: string
  referralCode: string
  currentStreak: number
  longestStreak: number
  lastCheckInDate: string | null
  streakMilestonesClaimed: number[]
  streakSaveCount: number
  extraWheelSpins: number
  lastFreeSpinAt: string | null
  pointsBoostMultiplier: number
  pointsBoostEndsAt: string | null
  storeCreditBalanceCents: number
  seedTokens: number
  plantXp: number
  plantStage: CxPlantStage
  achievements: CxAchievementState[]
  ownedRewards: Record<string, number>
  referredUsers: number
  referredPurchasers: number
  suspiciousFlags: string[]
  notifications: CxNotification[]
}

export type CxRewardUserRecord = {
  profile: CxRewardProfile
  ledger: CxLedgerEntry[]
}

export type CxRewardState = {
  version: 2
  users: Record<string, CxRewardUserRecord>
}

export type CxOrderSummary = {
  id: string
  amountTotal: number
  currency: string | null
  status: string | null
  createdAt: string
}

export type CxRewardsSnapshot = {
  tier: CxMembershipTier
  balanceCx: number
  earnedCx: number
  spentCx: number
  expiringCx: number
  inactivityWarningDate: string | null
  currentValueCents: number
  monthlyValueCents: number
  yearlyValueCents: number
  storeCreditBalanceCents: number
  streak: {
    current: number
    longest: number
    todayClaimed: boolean
    nextRewardCx: number
    nextMilestone: number | null
  }
  wheel: {
    canSpin: boolean
    extraSpins: number
    lastFreeSpinAt: string | null
  }
  referralCode: string
  achievements: CxAchievementState[]
  ownedRewards: Array<{ reward: CxRewardDefinition; quantity: number }>
  recommendedRewards: CxRewardDefinition[]
  availableRewards: CxRewardDefinition[]
  notifications: CxNotification[]
  recentLedger: CxLedgerEntry[]
  suspiciousFlags: string[]
  plantStage: CxPlantStage
  missions: CxMissionSnapshot[]
}

const DEFAULT_CONFIG: CxRewardConfig = {
  pointValuePer100Cx: {
    free: 1,
    monthly: 1.5,
    yearly: 2,
  },
  purchaseEarnRate: 1,
  inactivityExpiryDays: 365,
  pointsExpiryWarningDays: 30,
  minimumStoreCreditRedemptionCx: 500,
  minimumCreditOrderSubtotalCents: 6000,
  allowPromoStacking: false,
  allowFreeShippingStacking: true,
  allowSubscriptionCreditUse: false,
  allowMultipleCreditRewardsPerOrder: false,
  suspiciousFlagsEnabled: true,
  rewardAuditEnabled: true,
  reversePointsOnRefunds: true,
  dailyCheckInSchedule: [10, 15, 20, 25, 30, 40, 100],
  streakMilestoneBonuses: {
    '7': 100,
    '14': 250,
    '21': 500,
    '30': 1000,
  },
  dailyFreeWheelSpins: 1,
  monthlySubscriberExtraWheelWeight: 1.08,
  yearlySubscriberExtraWheelWeight: 1.18,
}

export const CX_PURCHASE_EARN_RATE = DEFAULT_CONFIG.purchaseEarnRate

const DEFAULT_WHEEL_SLICES: CxWheelSlice[] = [
  { id: 'wheel-10', label: '10 CX', rewardType: 'cx', cxAmount: 10, baseWeight: 34 },
  { id: 'wheel-25', label: '25 CX', rewardType: 'cx', cxAmount: 25, baseWeight: 25 },
  { id: 'wheel-50', label: '50 CX', rewardType: 'cx', cxAmount: 50, baseWeight: 13 },
  { id: 'wheel-100', label: '100 CX', rewardType: 'cx', cxAmount: 100, baseWeight: 6 },
  { id: 'wheel-spin', label: 'Extra spin', rewardType: 'extra_spin', baseWeight: 10 },
  { id: 'wheel-theme', label: 'Theme unlock', rewardType: 'theme', rewardId: 'theme-nocturne', baseWeight: 5 },
  { id: 'wheel-shipping', label: 'Free shipping', rewardType: 'free_shipping', rewardId: 'free-shipping-voucher', baseWeight: 4 },
  { id: 'wheel-crate', label: 'Mystery crate', rewardType: 'mystery_crate', rewardId: 'mystery-digital-crate', baseWeight: 2 },
  { id: 'wheel-golden', label: 'Golden Ticket', rewardType: 'golden_ticket', rewardId: 'golden-ticket', baseWeight: 1 },
]

export const CX_WEEKLY_MISSIONS: CxMissionDefinition[] = [
  {
    id: 'three-grow-updates',
    title: 'Log 3 grow updates',
    description: 'Capture three real grow actions this week across check-ins, feeds, environment logs, or journal work.',
    target: 3,
    rewardCx: 120,
    accent: '#c8f500',
    progressKey: 'growUpdatesThisWeek',
  },
  {
    id: 'one-feed-schedule',
    title: 'Complete 1 feed schedule',
    description: 'Record at least one real feed or feed-schedule completion this week.',
    target: 1,
    rewardCx: 90,
    accent: '#33d9ff',
    progressKey: 'feedSchedulesThisWeek',
  },
  {
    id: 'two-daily-checkins',
    title: 'Complete 2 daily check-ins',
    description: 'Keep the habit loop alive with two fast check-ins this week.',
    target: 2,
    rewardCx: 80,
    accent: '#16d6c8',
    progressKey: 'checkInsThisWeek',
  },
  {
    id: 'one-photo-upload',
    title: 'Upload 1 grow photo',
    description: 'Add one fresh progress photo to strengthen your evidence trail this week.',
    target: 1,
    rewardCx: 70,
    accent: '#9a5cff',
    progressKey: 'photoUploadsThisWeek',
  },
  {
    id: 'one-journal-entry',
    title: 'Approve 1 journal entry',
    description: 'Lock in one observation or suggested note this week to keep the record useful.',
    target: 1,
    rewardCx: 85,
    accent: '#ff8a1f',
    progressKey: 'journalEntriesThisWeek',
  },
]

const DEFAULT_REWARDS: CxRewardDefinition[] = [
  {
    id: 'premium-grow-guide',
    title: 'Premium Grow Guide',
    description: 'Unlock a deep Catalyx guide focused on steering, diagnosis, and recovery logic.',
    category: 'digital',
    kind: 'digital_unlock',
    costCx: 450,
    rarity: 'common',
    oneTime: true,
    permanent: true,
    featured: true,
    visible: true,
    active: true,
    accent: '#c8f500',
  },
  {
    id: 'advanced-feed-schedule',
    title: 'Advanced Feed Schedule',
    description: 'Unlock a higher-control feed schedule template for stage-specific pushes.',
    category: 'digital',
    kind: 'digital_unlock',
    costCx: 650,
    rarity: 'uncommon',
    oneTime: true,
    permanent: true,
    featured: true,
    visible: true,
    active: true,
    accent: '#33d9ff',
  },
  {
    id: 'theme-nocturne',
    title: 'Nocturne Theme',
    description: 'A premium dashboard skin for GrowOS with polished neon instrumentation.',
    category: 'digital',
    kind: 'digital_unlock',
    costCx: 500,
    rarity: 'rare',
    oneTime: true,
    permanent: true,
    visible: true,
    active: true,
    accent: '#9a5cff',
  },
  {
    id: 'profile-badge-vip',
    title: 'VIP Badge',
    description: 'A profile badge earned through sustained spend or manual admin grant.',
    category: 'founder-rare',
    kind: 'badge',
    costCx: 0,
    rarity: 'rare',
    oneTime: true,
    permanent: true,
    visible: true,
    active: true,
    accent: '#ffd23f',
  },
  {
    id: 'profile-badge-founder',
    title: 'Founder Badge',
    description: 'Reserved for early high-value customers and selected founder campaigns.',
    category: 'founder-rare',
    kind: 'badge',
    costCx: 0,
    rarity: 'ultra-rare',
    oneTime: true,
    permanent: true,
    visible: true,
    active: true,
    accent: '#ff8a1f',
  },
  {
    id: 'double-cx-24h',
    title: 'Double CX Boost',
    description: 'Double earned CX on eligible actions for the next 24 hours.',
    category: 'boosts',
    kind: 'boost',
    costCx: 900,
    rarity: 'rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    cooldownHours: 24,
    accent: '#16d6c8',
  },
  {
    id: 'extra-wheel-spin',
    title: 'Extra Grow Wheel Spin',
    description: 'Add one extra wheel spin to your inventory.',
    category: 'boosts',
    kind: 'boost',
    costCx: 200,
    rarity: 'common',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#c8f500',
  },
  {
    id: 'mystery-digital-crate',
    title: 'Mystery Digital Crate',
    description: 'A curated crate with a weighted chance of badges, boosts, credits, or cosmetic unlocks.',
    category: 'boosts',
    kind: 'boost',
    costCx: 800,
    rarity: 'very-rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#ff3b45',
  },
  {
    id: 'free-shipping-voucher',
    title: 'Free Shipping Voucher',
    description: 'Apply free shipping on a qualifying order when stacking rules allow it.',
    category: 'limited-time',
    kind: 'voucher',
    costCx: 900,
    rarity: 'rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#33d9ff',
  },
  {
    id: 'store-credit-500',
    title: '$5 Store Credit',
    description: 'Redeem 500 CX into tier-based store credit. Annual members receive the best value.',
    category: 'store-credit',
    kind: 'store_credit',
    costCx: 500,
    rarity: 'common',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#c8f500',
  },
  {
    id: 'store-credit-1000',
    title: '$10 Store Credit',
    description: 'Redeem 1,000 CX into tier-based store credit. Annual members receive the best value.',
    category: 'store-credit',
    kind: 'store_credit',
    costCx: 1000,
    rarity: 'common',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#16d6c8',
  },
  {
    id: 'store-credit-2500',
    title: '$25 Store Credit',
    description: 'Redeem 2,500 CX into tier-based store credit. Annual members receive the best value.',
    category: 'store-credit',
    kind: 'store_credit',
    costCx: 2500,
    rarity: 'uncommon',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#33d9ff',
  },
  {
    id: 'store-credit-5000',
    title: '$50 Store Credit',
    description: 'Redeem 5,000 CX into tier-based store credit. Annual members receive the best value.',
    category: 'store-credit',
    kind: 'store_credit',
    costCx: 5000,
    rarity: 'rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    accent: '#9a5cff',
  },
  {
    id: 'store-credit-10000',
    title: '$100 Store Credit',
    description: 'Redeem 10,000 CX into tier-based store credit. Annual members receive the best value.',
    category: 'store-credit',
    kind: 'store_credit',
    costCx: 10000,
    rarity: 'very-rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    minimumTier: 'monthly',
    accent: '#ffd23f',
  },
  {
    id: 'subscriber-theme-aurora',
    title: 'Aurora Subscriber Theme',
    description: 'A subscriber-only interface theme with premium motion and rarity framing.',
    category: 'subscriber-exclusive',
    kind: 'digital_unlock',
    costCx: 750,
    rarity: 'rare',
    oneTime: true,
    permanent: true,
    visible: true,
    active: true,
    minimumTier: 'monthly',
    accent: '#9a5cff',
  },
  {
    id: 'golden-ticket',
    title: 'Golden Ticket',
    description: 'A rare campaign placeholder for founder drops, merch, or early feature access.',
    category: 'founder-rare',
    kind: 'voucher',
    costCx: 5000,
    rarity: 'ultra-rare',
    repeatable: false,
    visible: true,
    active: true,
    limitedQuantity: 25,
    minimumTier: 'yearly',
    accent: '#ff8a1f',
  },
  {
    id: 'sticker-pack',
    title: 'Sticker Pack',
    description: 'A light physical reward used as a milestone extra, not the main reward path.',
    category: 'physical',
    kind: 'physical',
    costCx: 1800,
    rarity: 'rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    limitedQuantity: 250,
    accent: '#33d9ff',
  },
  {
    id: 'catalyx-cap',
    title: 'Catalyx Cap',
    description: 'Limited physical merch positioned as a higher-tier milestone reward.',
    category: 'physical',
    kind: 'physical',
    costCx: 5000,
    rarity: 'very-rare',
    repeatable: true,
    consumable: true,
    visible: true,
    active: true,
    limitedQuantity: 100,
    minimumTier: 'monthly',
    accent: '#c8f500',
  },
]

export const CX_ACHIEVEMENTS: CxAchievementDefinition[] = [
  { id: 'account-created', title: 'Create account', description: 'Joined the Catalyx CX ecosystem.', points: 100 },
  { id: 'profile-complete', title: 'Complete profile', description: 'Configured the basics for a higher-quality experience.', points: 100 },
  { id: 'first-order', title: 'First order', description: 'Placed the first qualifying order.', points: 250 },
  { id: 'first-grow', title: 'First grow logged', description: 'Started tracking a real grow inside GrowOS.', points: 200 },
  { id: 'first-photo', title: 'First grow photo', description: 'Captured the first piece of visual grow evidence.', points: 50 },
  { id: 'seven-day-streak', title: '7-day streak', description: 'Completed the first 7-day daily check-in cycle.', points: 100 },
  { id: 'thirty-day-streak', title: '30-day streak', description: 'Maintained a 30-day daily check-in streak.', points: 1000 },
  { id: 'vip-spend', title: 'Spend $500', description: 'Reached the first VIP spend milestone.', points: 0, badgeTitle: 'VIP Badge' },
  { id: 'founder-spend', title: 'Spend $1,000', description: 'Reached the founder milestone threshold.', points: 0, badgeTitle: 'Founder Badge' },
]

function createEmptyState(): CxRewardState {
  return {
    version: 2,
    users: {},
  }
}

function dayKey(value: Date) {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC' }).format(value)
}

function startOfUtcWeek(value: Date) {
  const next = new Date(Date.UTC(value.getUTCFullYear(), value.getUTCMonth(), value.getUTCDate()))
  const day = next.getUTCDay()
  const diff = day === 0 ? -6 : 1 - day
  next.setUTCDate(next.getUTCDate() + diff)
  next.setUTCHours(0, 0, 0, 0)
  return next
}

function weekKey(value: Date) {
  return dayKey(startOfUtcWeek(value))
}

function toCurrencyCents(value: number) {
  return Math.round(value * 100)
}

function nowIso() {
  return new Date().toISOString()
}

function isSameUtcDay(left: Date, right: Date) {
  return dayKey(left) === dayKey(right)
}

function isYesterday(lastDate: string, now: Date) {
  const compare = new Date(lastDate)
  const previous = new Date(now)
  previous.setUTCDate(previous.getUTCDate() - 1)
  return dayKey(compare) === dayKey(previous)
}

function readEventDate(value: unknown) {
  if (typeof value !== 'object' || !value) return null
  const record = value as Record<string, unknown>
  const candidate =
    record.checkedAt ??
    record.capturedAt ??
    record.createdAt ??
    record.loggedAt ??
    record.date ??
    record.fedAt
  return typeof candidate === 'string' ? candidate : null
}

function countValuesThisWeek(values: unknown[], now: Date): number {
  const start = startOfUtcWeek(now).getTime()
  return values.reduce<number>((count, item) => {
    const value = readEventDate(item)
    if (!value) return count
    const time = new Date(value).getTime()
    return Number.isFinite(time) && time >= start ? count + 1 : count
  }, 0)
}

function addHours(value: Date, hours: number) {
  const next = new Date(value)
  next.setHours(next.getHours() + hours)
  return next
}

function addDays(value: Date, days: number) {
  const next = new Date(value)
  next.setDate(next.getDate() + days)
  return next
}

function clampNotifications(values: CxNotification[]) {
  return values.slice(0, 18)
}

function secureRandomUnit() {
  const values = new Uint32Array(1)
  globalThis.crypto.getRandomValues(values)
  return values[0] / 0x100000000
}

function secureRandomInt(maxExclusive: number) {
  if (maxExclusive <= 0) return 0
  const values = new Uint32Array(1)
  const range = 0x100000000
  const limit = range - (range % maxExclusive)

  do {
    globalThis.crypto.getRandomValues(values)
  } while (values[0] >= limit)

  return values[0] % maxExclusive
}

function randomReferralCode() {
  return `REF-CX-${1000 + secureRandomInt(9000)}`
}

function stateStorageKey() {
  return storageKeys.cxRewardsState
}

function configStorageKey() {
  return storageKeys.cxRewardsConfig
}

function catalogStorageKey() {
  return storageKeys.cxRewardsCatalog
}

export function planToMembershipTier(plan?: string): CxMembershipTier {
  if (plan === 'professional_yearly') return 'yearly'
  if (plan === 'professional_monthly' || plan === 'professional') return 'monthly'
  return 'free'
}

export function membershipTierLabel(tier: CxMembershipTier) {
  if (tier === 'yearly') return 'Annual'
  if (tier === 'monthly') return 'Monthly'
  return 'Free'
}

export function isProfessionalLikePlan(plan?: string) {
  return plan === 'professional' || plan === 'professional_monthly' || plan === 'professional_yearly'
}

export function buildCxMissionActivitySummary({
  checkIns = [],
  photos = [],
  feedLogs = [],
  environmentLogs = [],
  journalEntries = [],
  now = new Date(),
}: {
  checkIns?: unknown[]
  photos?: unknown[]
  feedLogs?: unknown[]
  environmentLogs?: unknown[]
  journalEntries?: unknown[]
  now?: Date
}): CxMissionActivitySummary {
  const checkInsThisWeek = countValuesThisWeek(checkIns, now)
  const photoUploadsThisWeek = countValuesThisWeek(photos, now)
  const feedSchedulesThisWeek = countValuesThisWeek(feedLogs, now)
  const journalEntriesThisWeek = countValuesThisWeek(journalEntries, now)
  const environmentThisWeek = countValuesThisWeek(environmentLogs, now)

  return {
    growUpdatesThisWeek: checkInsThisWeek + photoUploadsThisWeek + feedSchedulesThisWeek + environmentThisWeek + journalEntriesThisWeek,
    feedSchedulesThisWeek,
    checkInsThisWeek,
    photoUploadsThisWeek,
    journalEntriesThisWeek,
  }
}

export function pointValueMultiplier(tier: CxMembershipTier, config = readCxRewardConfig()) {
  return config.pointValuePer100Cx[tier]
}

export function cxToStoreCreditCents(cx: number, tier: CxMembershipTier, config = readCxRewardConfig()) {
  return toCurrencyCents((cx / 100) * pointValueMultiplier(tier, config))
}

export function formatMoneyFromCents(cents: number) {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: 'NZD',
  }).format(cents / 100)
}

export function readCxRewardConfig(): CxRewardConfig {
  return readLocalObject<CxRewardConfig>(configStorageKey(), DEFAULT_CONFIG)
}

export function writeCxRewardConfig(config: CxRewardConfig) {
  writeLocalObject(configStorageKey(), config)
}

export function readCxRewardCatalog() {
  const catalog = readLocalObject<CxRewardDefinition[]>(catalogStorageKey(), DEFAULT_REWARDS)
  return catalog.length ? catalog : DEFAULT_REWARDS
}

export function writeCxRewardCatalog(catalog: CxRewardDefinition[]) {
  writeLocalObject(catalogStorageKey(), catalog)
}

export function readCxRewardState() {
  return readLocalObject<CxRewardState>(stateStorageKey(), createEmptyState())
}

function writeCxRewardState(state: CxRewardState) {
  writeLocalObject(stateStorageKey(), state)
}

function ensureUserRecord(state: CxRewardState, userId: string) {
  const existing = state.users[userId]
  if (existing) return existing

  const createdAt = nowIso()
  const record: CxRewardUserRecord = {
    profile: {
      userId,
      createdAt,
      lastActivityAt: createdAt,
      referralCode: randomReferralCode(),
      currentStreak: 0,
      longestStreak: 0,
      lastCheckInDate: null,
      streakMilestonesClaimed: [],
      streakSaveCount: 0,
      extraWheelSpins: 0,
      lastFreeSpinAt: null,
      pointsBoostMultiplier: 1,
      pointsBoostEndsAt: null,
      storeCreditBalanceCents: 0,
      seedTokens: 0,
      plantXp: 0,
      plantStage: 'Seedling',
      achievements: [],
      ownedRewards: {},
      referredUsers: 0,
      referredPurchasers: 0,
      suspiciousFlags: [],
      notifications: [],
    },
    ledger: [],
  }
  state.users[userId] = record
  return record
}

function pushNotification(profile: CxRewardProfile, notification: CxNotification) {
  profile.notifications = clampNotifications([notification, ...profile.notifications])
}

function hasIdempotency(ledger: CxLedgerEntry[], idempotencyKey: string) {
  return ledger.some((entry) => entry.idempotencyKey === idempotencyKey)
}

function activeBoostMultiplier(profile: CxRewardProfile, now = new Date()) {
  if (profile.pointsBoostEndsAt && new Date(profile.pointsBoostEndsAt).getTime() > now.getTime()) {
    return Math.max(1, profile.pointsBoostMultiplier)
  }
  return 1
}

function createLedgerEntry({
  userId,
  eventType,
  source,
  pointsDelta,
  storeCreditDeltaCents,
  seedTokenDelta,
  title,
  detail,
  idempotencyKey,
  status = 'approved',
  effectiveAt = nowIso(),
  expiresAt = null,
  metadata,
}: {
  userId: string
  eventType: CxLedgerEventType
  source: CxLedgerSource
  pointsDelta: number
  storeCreditDeltaCents?: number
  seedTokenDelta?: number
  title: string
  detail: string
  idempotencyKey: string
  status?: CxLedgerStatus
  effectiveAt?: string
  expiresAt?: string | null
  metadata?: Record<string, string | number | boolean | null>
}): CxLedgerEntry {
  return {
    id: `${source}-${Date.now()}-${secureRandomInt(100000)}`,
    userId,
    eventType,
    source,
    status,
    pointsDelta,
    storeCreditDeltaCents: storeCreditDeltaCents ?? 0,
    seedTokenDelta: seedTokenDelta ?? 0,
    title,
    detail,
    createdAt: nowIso(),
    effectiveAt,
    expiresAt,
    idempotencyKey,
    metadata,
  }
}

function addLedgerEntry(record: CxRewardUserRecord, entry: CxLedgerEntry) {
  if (hasIdempotency(record.ledger, entry.idempotencyKey)) return false
  record.ledger = [entry, ...record.ledger]
  record.profile.lastActivityAt = entry.createdAt
  record.profile.storeCreditBalanceCents += entry.storeCreditDeltaCents
  record.profile.seedTokens += entry.seedTokenDelta
  return true
}

function getLedgerBalance(ledger: CxLedgerEntry[]) {
  return ledger
    .filter((entry) => entry.status !== 'cancelled' && entry.status !== 'reversed')
    .reduce(
      (totals, entry) => {
        if (entry.pointsDelta > 0) totals.earned += entry.pointsDelta
        if (entry.pointsDelta < 0) totals.spent += Math.abs(entry.pointsDelta)
        totals.balance += entry.pointsDelta
        return totals
      },
      { balance: 0, earned: 0, spent: 0 }
    )
}

function pushOwnedReward(profile: CxRewardProfile, rewardId: string, quantity = 1) {
  profile.ownedRewards[rewardId] = (profile.ownedRewards[rewardId] ?? 0) + quantity
}

function hasAchievement(profile: CxRewardProfile, achievementId: string) {
  return profile.achievements.some((achievement) => achievement.id === achievementId)
}

function unlockAchievement(record: CxRewardUserRecord, definition: CxAchievementDefinition, idempotencyKey: string) {
  if (hasAchievement(record.profile, definition.id) || hasIdempotency(record.ledger, idempotencyKey)) return false

  record.profile.achievements = [
    ...record.profile.achievements,
    {
      id: definition.id,
      unlockedAt: nowIso(),
      badgeTitle: definition.badgeTitle,
    },
  ]

  if (definition.badgeTitle === 'VIP Badge') {
    pushOwnedReward(record.profile, 'profile-badge-vip')
  }
  if (definition.badgeTitle === 'Founder Badge') {
    pushOwnedReward(record.profile, 'profile-badge-founder')
  }

  if (definition.points > 0) {
    addLedgerEntry(
      record,
      createLedgerEntry({
        userId: record.profile.userId,
        eventType: 'earn',
        source: 'achievement',
        pointsDelta: definition.points,
        title: definition.title,
        detail: definition.description,
        idempotencyKey,
      })
    )
  }

  pushNotification(record.profile, {
    id: `achievement-${definition.id}-${Date.now()}`,
    kind: 'reward_unlocked',
    title: `${definition.title} unlocked`,
    body: definition.badgeTitle ? `${definition.description} ${definition.badgeTitle} added.` : definition.description,
    createdAt: nowIso(),
  })

  return true
}

function syncAccountCreation(record: CxRewardUserRecord) {
  unlockAchievement(record, CX_ACHIEVEMENTS[0], `achievement-${record.profile.userId}-account-created`)
}

function streakDayReward(streakCount: number, config: CxRewardConfig) {
  const cycleDay = ((Math.max(streakCount, 1) - 1) % config.dailyCheckInSchedule.length) + 1
  return config.dailyCheckInSchedule[cycleDay - 1] ?? config.dailyCheckInSchedule[0]
}

function nextStreakMilestone(currentStreak: number, config: CxRewardConfig) {
  return Object.keys(config.streakMilestoneBonuses)
    .map((value) => Number(value))
    .sort((left, right) => left - right)
    .find((value) => value > currentStreak) ?? null
}

function rewardStillAvailable(reward: CxRewardDefinition, now: Date) {
  if (reward.active === false || reward.visible === false) return false
  if (reward.startAt && new Date(reward.startAt).getTime() > now.getTime()) return false
  if (reward.endAt && new Date(reward.endAt).getTime() < now.getTime()) return false
  if (typeof reward.limitedQuantity === 'number' && reward.redeemedCount && reward.redeemedCount >= reward.limitedQuantity) return false
  return true
}

function rewardTierAllowed(reward: CxRewardDefinition, tier: CxMembershipTier) {
  if (!reward.minimumTier) return true
  if (reward.minimumTier === 'free') return true
  if (reward.minimumTier === 'monthly') return tier === 'monthly' || tier === 'yearly'
  return tier === 'yearly'
}

function plantStageFromXp(plantXp: number): CxPlantStage {
  if (plantXp >= 1200) return 'Legendary'
  if (plantXp >= 800) return 'Elite'
  if (plantXp >= 450) return 'Blooming'
  if (plantXp >= 180) return 'Vegetative'
  return 'Seedling'
}

function rewardCountForUser(profile: CxRewardProfile, rewardId: string) {
  return profile.ownedRewards[rewardId] ?? 0
}

function missionClaimKey(missionId: string, currentWeekKey: string) {
  return `mission-claim-${missionId}-${currentWeekKey}`
}

function missionSnapshotsForUser({
  record,
  activitySummary,
  now,
}: {
  record: CxRewardUserRecord
  activitySummary: CxMissionActivitySummary
  now: Date
}) {
  const currentWeekKey = weekKey(now)
  return CX_WEEKLY_MISSIONS.map((mission) => {
    const progress = activitySummary[mission.progressKey]
    const claimed = hasIdempotency(record.ledger, missionClaimKey(mission.id, currentWeekKey))
    return {
      id: mission.id,
      title: mission.title,
      description: mission.description,
      progress,
      target: mission.target,
      rewardCx: mission.rewardCx,
      accent: mission.accent,
      claimed,
      readyToClaim: !claimed && progress >= mission.target,
      weekKey: currentWeekKey,
    }
  })
}

export function syncCxRewardsFromActivity({
  userId,
  plan,
  hasProfile = false,
  growsCount = 0,
  photosCount = 0,
  dailyCheckInsCount = 0,
  orders = [],
}: {
  userId: string
  plan?: SubscriptionPlanKey | 'professional'
  hasProfile?: boolean
  growsCount?: number
  photosCount?: number
  dailyCheckInsCount?: number
  orders?: CxOrderSummary[]
}) {
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)

  syncAccountCreation(record)

  if (hasProfile) {
    unlockAchievement(record, CX_ACHIEVEMENTS[1], `achievement-${userId}-profile-complete`)
  }
  if (growsCount > 0) {
    unlockAchievement(record, CX_ACHIEVEMENTS[3], `achievement-${userId}-first-grow`)
  }
  if (photosCount > 0) {
    unlockAchievement(record, CX_ACHIEVEMENTS[4], `achievement-${userId}-first-photo`)
  }
  if (orders.length > 0) {
    unlockAchievement(record, CX_ACHIEVEMENTS[2], `achievement-${userId}-first-order`)
  }

  const tier = planToMembershipTier(plan)
  const multiplier = activeBoostMultiplier(record.profile)
  orders
    .filter((order) => ['paid', 'complete', 'succeeded'].includes(String(order.status ?? '').toLowerCase()))
    .forEach((order) => {
      const basePoints = Math.max(0, Math.round(order.amountTotal * DEFAULT_CONFIG.purchaseEarnRate))
      addLedgerEntry(
        record,
        createLedgerEntry({
          userId,
          eventType: 'earn',
          source: 'purchase',
          pointsDelta: Math.round(basePoints * multiplier),
          title: 'Purchase earned CX',
          detail: `$${order.amountTotal.toFixed(2)} order generated ${Math.round(basePoints * multiplier)} CX.`,
          idempotencyKey: `purchase-points-${order.id}`,
          metadata: {
            orderId: order.id,
            tier,
          },
        })
      )
    })

  const totalSpend = orders
    .filter((order) => ['paid', 'complete', 'succeeded'].includes(String(order.status ?? '').toLowerCase()))
    .reduce((sum, order) => sum + order.amountTotal, 0)
  if (totalSpend >= 500) {
    unlockAchievement(record, CX_ACHIEVEMENTS[7], `achievement-${userId}-vip-spend`)
  }
  if (totalSpend >= 1000) {
    unlockAchievement(record, CX_ACHIEVEMENTS[8], `achievement-${userId}-founder-spend`)
  }

  if (dailyCheckInsCount >= 7) {
    unlockAchievement(record, CX_ACHIEVEMENTS[5], `achievement-${userId}-seven-day-streak`)
  }
  if (dailyCheckInsCount >= 30) {
    unlockAchievement(record, CX_ACHIEVEMENTS[6], `achievement-${userId}-thirty-day-streak`)
  }

  if (DEFAULT_CONFIG.suspiciousFlagsEnabled) {
    const sameDayCheckInClaims = record.ledger.filter((entry) => entry.source === 'daily_check_in' && isSameUtcDay(new Date(entry.createdAt), new Date())).length
    if (sameDayCheckInClaims > 1 && !record.profile.suspiciousFlags.includes('multiple-checkin-claims')) {
      record.profile.suspiciousFlags = [...record.profile.suspiciousFlags, 'multiple-checkin-claims']
    }
  }

  record.profile.plantXp = Math.max(record.profile.plantXp, growsCount * 60 + photosCount * 15 + dailyCheckInsCount * 12)
  record.profile.plantStage = plantStageFromXp(record.profile.plantXp)

  writeCxRewardState(state)
}

function addBonusReward(record: CxRewardUserRecord, rewardId: string, title: string, detail: string, idempotencyKey: string) {
  pushOwnedReward(record.profile, rewardId)
  addLedgerEntry(
    record,
    createLedgerEntry({
      userId: record.profile.userId,
      eventType: 'bonus',
      source: 'daily_check_in',
      pointsDelta: 0,
      title,
      detail,
      idempotencyKey,
      metadata: { rewardId },
    })
  )
}

export function claimDailyCheckInReward({
  userId,
  plan,
}: {
  userId: string
  plan?: SubscriptionPlanKey | 'professional'
}) {
  const config = readCxRewardConfig()
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  const now = new Date()

  if (record.profile.lastCheckInDate && isSameUtcDay(new Date(record.profile.lastCheckInDate), now)) {
    return { ok: false, error: 'Daily check-in already claimed today.' }
  }

  const continued = record.profile.lastCheckInDate ? isYesterday(record.profile.lastCheckInDate, now) : false
  const nextStreak = continued ? record.profile.currentStreak + 1 : 1
  const rewardCx = streakDayReward(nextStreak, config)
  const multiplier = activeBoostMultiplier(record.profile, now)
  const pointsAwarded = Math.round(rewardCx * multiplier)
  const entry = createLedgerEntry({
    userId,
    eventType: 'earn',
    source: 'daily_check_in',
    pointsDelta: pointsAwarded,
    seedTokenDelta: 2,
    title: `Day ${Math.min(nextStreak, 7)} check-in`,
    detail: `Daily check-in awarded ${pointsAwarded} CX and 2 Seed Tokens.`,
    idempotencyKey: `daily-check-in-${dayKey(now)}`,
    metadata: {
      streakDay: nextStreak,
      tier: planToMembershipTier(plan),
    },
  })

  addLedgerEntry(record, entry)
  record.profile.currentStreak = nextStreak
  record.profile.longestStreak = Math.max(record.profile.longestStreak, nextStreak)
  record.profile.lastCheckInDate = now.toISOString()
  record.profile.plantXp += 24
  record.profile.plantStage = plantStageFromXp(record.profile.plantXp)

  const daySevenBonusCycle = ['extra-wheel-spin', 'mystery-digital-crate', 'premium-grow-guide', 'theme-nocturne']
  if (nextStreak % 7 === 0) {
    const bonusRewardId = daySevenBonusCycle[(Math.floor(nextStreak / 7) - 1) % daySevenBonusCycle.length]
    if (bonusRewardId === 'extra-wheel-spin') {
      record.profile.extraWheelSpins += 1
    } else {
      pushOwnedReward(record.profile, bonusRewardId)
    }
    addBonusReward(
      record,
      bonusRewardId,
      '7-day bonus unlocked',
      'The 7-day streak granted a bonus reward on top of CX.',
      `daily-check-in-bonus-${userId}-${nextStreak}`
    )
  }

  const streakBonus = config.streakMilestoneBonuses[String(nextStreak)]
  if (streakBonus && !record.profile.streakMilestonesClaimed.includes(nextStreak)) {
    addLedgerEntry(
      record,
      createLedgerEntry({
        userId,
        eventType: 'bonus',
        source: 'streak_bonus',
        pointsDelta: streakBonus,
        title: `${nextStreak}-day streak bonus`,
        detail: `${streakBonus} CX milestone bonus awarded.`,
        idempotencyKey: `streak-bonus-${userId}-${nextStreak}`,
      })
    )
    record.profile.streakMilestonesClaimed = [...record.profile.streakMilestonesClaimed, nextStreak]
    if (nextStreak === 30) {
      pushOwnedReward(record.profile, 'mystery-digital-crate')
    }
  }

  if (nextStreak >= 7) {
    unlockAchievement(record, CX_ACHIEVEMENTS[5], `achievement-${userId}-seven-day-streak`)
  }
  if (nextStreak >= 30) {
    unlockAchievement(record, CX_ACHIEVEMENTS[6], `achievement-${userId}-thirty-day-streak`)
  }

  pushNotification(record.profile, {
    id: `daily-check-in-${Date.now()}`,
    kind: 'points_earned',
    title: `+${pointsAwarded} CX earned`,
    body: nextStreak % 7 === 0 ? 'Streak bonus applied and a bonus reward dropped.' : 'Daily streak advanced.',
    createdAt: now.toISOString(),
  })

  writeCxRewardState(state)
  return {
    ok: true,
    pointsAwarded,
    streak: nextStreak,
  }
}

export function claimCxMission({
  userId,
  missionId,
  activitySummary,
}: {
  userId: string
  missionId: string
  activitySummary: CxMissionActivitySummary
}) {
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  const now = new Date()
  const mission = CX_WEEKLY_MISSIONS.find((item) => item.id === missionId)
  if (!mission) return { ok: false, error: 'Mission not found.' }

  const currentWeekKey = weekKey(now)
  const progress = activitySummary[mission.progressKey]
  if (progress < mission.target) {
    return { ok: false, error: 'Mission is not complete yet.' }
  }
  if (hasIdempotency(record.ledger, missionClaimKey(mission.id, currentWeekKey))) {
    return { ok: false, error: 'Mission already claimed this week.' }
  }

  addLedgerEntry(
    record,
    createLedgerEntry({
      userId,
      eventType: 'bonus',
      source: 'mission',
      pointsDelta: mission.rewardCx,
      title: mission.title,
      detail: `Weekly mission completed for ${mission.rewardCx} CX.`,
      idempotencyKey: missionClaimKey(mission.id, currentWeekKey),
      metadata: {
        missionId: mission.id,
        weekKey: currentWeekKey,
      },
    })
  )
  record.profile.plantXp += 18
  record.profile.plantStage = plantStageFromXp(record.profile.plantXp)
  pushNotification(record.profile, {
    id: `mission-${mission.id}-${Date.now()}`,
    kind: 'points_earned',
    title: `${mission.title} claimed`,
    body: `Weekly mission reward: +${mission.rewardCx} CX.`,
    createdAt: now.toISOString(),
  })

  writeCxRewardState(state)
  return { ok: true, mission }
}

function weightedWheelSlice(tier: CxMembershipTier) {
  const config = readCxRewardConfig()
  const multiplier =
    tier === 'yearly'
      ? config.yearlySubscriberExtraWheelWeight
      : tier === 'monthly'
        ? config.monthlySubscriberExtraWheelWeight
        : 1

  const weighted = DEFAULT_WHEEL_SLICES.map((slice) => ({
    ...slice,
    adjustedWeight:
      slice.rewardType === 'cx' || slice.rewardType === 'extra_spin'
        ? slice.baseWeight
        : slice.baseWeight * multiplier,
  }))
  const total = weighted.reduce((sum, slice) => sum + slice.adjustedWeight, 0)
  let cursor = secureRandomUnit() * total

  for (const slice of weighted) {
    cursor -= slice.adjustedWeight
    if (cursor <= 0) return slice
  }

  return weighted[0]
}

export function spinGrowWheel({
  userId,
  plan,
}: {
  userId: string
  plan?: SubscriptionPlanKey | 'professional'
}) {
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  const now = new Date()
  const canUseFreeSpin =
    !record.profile.lastFreeSpinAt ||
    addHours(new Date(record.profile.lastFreeSpinAt), 24).getTime() <= now.getTime()
  const canUseExtraSpin = record.profile.extraWheelSpins > 0

  if (!canUseFreeSpin && !canUseExtraSpin) {
    return { ok: false, error: 'No wheel spins available yet.' }
  }

  if (!canUseFreeSpin && canUseExtraSpin) {
    record.profile.extraWheelSpins -= 1
  } else {
    record.profile.lastFreeSpinAt = now.toISOString()
  }

  const slice = weightedWheelSlice(planToMembershipTier(plan))
  let resultDetail = slice.label

  if (slice.rewardType === 'cx') {
    addLedgerEntry(
      record,
      createLedgerEntry({
        userId,
        eventType: 'earn',
        source: 'wheel',
        pointsDelta: slice.cxAmount ?? 0,
        title: 'Grow Wheel spin',
        detail: `Grow Wheel landed on ${slice.label}.`,
        idempotencyKey: `wheel-spin-${userId}-${Date.now()}`,
      })
    )
  } else if (slice.rewardType === 'extra_spin') {
    record.profile.extraWheelSpins += 1
  } else if (slice.rewardType === 'double_cx') {
    record.profile.pointsBoostMultiplier = 2
    record.profile.pointsBoostEndsAt = addHours(now, 24).toISOString()
  } else if (slice.rewardId) {
    pushOwnedReward(record.profile, slice.rewardId)
  }

  pushNotification(record.profile, {
    id: `wheel-${Date.now()}`,
    kind: 'reward_unlocked',
    title: 'Grow Wheel reward claimed',
    body: `Result: ${resultDetail}.`,
    createdAt: now.toISOString(),
  })

  writeCxRewardState(state)
  return { ok: true, slice }
}

export function redeemCxReward({
  userId,
  rewardId,
  plan,
}: {
  userId: string
  rewardId: string
  plan?: SubscriptionPlanKey | 'professional'
}) {
  const config = readCxRewardConfig()
  const catalog = readCxRewardCatalog()
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  const reward = catalog.find((item) => item.id === rewardId)
  const tier = planToMembershipTier(plan)
  const now = new Date()

  if (!reward) return { ok: false, error: 'Reward not found.' }
  if (!rewardStillAvailable(reward, now)) return { ok: false, error: 'Reward is not available right now.' }
  if (!rewardTierAllowed(reward, tier)) return { ok: false, error: 'Upgrade required for this reward.' }
  if (reward.milestoneStreakRequired && record.profile.longestStreak < reward.milestoneStreakRequired) {
    return { ok: false, error: `Requires a ${reward.milestoneStreakRequired}-day streak.` }
  }
  if (reward.oneTime && rewardCountForUser(record.profile, reward.id) > 0) {
    return { ok: false, error: 'Reward already unlocked.' }
  }
  if (reward.perUserCap && rewardCountForUser(record.profile, reward.id) >= reward.perUserCap) {
    return { ok: false, error: 'Per-user redemption limit reached.' }
  }

  const balance = getLedgerBalance(record.ledger).balance
  if (reward.kind === 'store_credit' && reward.costCx < config.minimumStoreCreditRedemptionCx) {
    return { ok: false, error: 'Reward is below the current credit threshold.' }
  }
  if (balance < reward.costCx) return { ok: false, error: 'Not enough CX yet.' }

  addLedgerEntry(
    record,
    createLedgerEntry({
      userId,
      eventType: 'spend',
      source: 'reward_redemption',
      pointsDelta: -reward.costCx,
      title: `Redeemed ${reward.title}`,
      detail: `Spent ${reward.costCx} CX.`,
      idempotencyKey: `reward-redeem-${userId}-${rewardId}-${Date.now()}`,
      metadata: {
        rewardId: reward.id,
        rewardKind: reward.kind,
        rewardCategory: reward.category,
      },
    })
  )

  if (reward.kind === 'store_credit') {
    const creditCents = cxToStoreCreditCents(reward.costCx, tier, config)
    addLedgerEntry(
      record,
      createLedgerEntry({
        userId,
        eventType: 'bonus',
        source: 'reward_redemption',
        pointsDelta: 0,
        storeCreditDeltaCents: creditCents,
        title: `${reward.title} applied`,
        detail: `${formatMoneyFromCents(creditCents)} added to store credit balance.`,
        idempotencyKey: `reward-credit-${userId}-${rewardId}-${Date.now()}`,
        metadata: {
          rewardId: reward.id,
          rewardKind: reward.kind,
          rewardCategory: reward.category,
          creditCents,
        },
      })
    )
  } else if (reward.id === 'double-cx-24h') {
    record.profile.pointsBoostMultiplier = 2
    record.profile.pointsBoostEndsAt = addHours(now, 24).toISOString()
  } else if (reward.id === 'extra-wheel-spin') {
    record.profile.extraWheelSpins += 1
  } else {
    pushOwnedReward(record.profile, reward.id)
  }

  pushNotification(record.profile, {
    id: `redeem-${Date.now()}`,
    kind: 'reward_redeemed',
    title: `${reward.title} redeemed`,
    body:
      reward.kind === 'store_credit'
        ? `Store credit value updated at your ${membershipTierLabel(tier)} rate.`
        : 'Reward added to your CX inventory.',
    createdAt: now.toISOString(),
  })

  writeCxRewardState(state)
  return { ok: true, reward }
}

export function adjustCxByAdmin({
  userId,
  pointsDelta,
  detail,
}: {
  userId: string
  pointsDelta: number
  detail: string
}) {
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  addLedgerEntry(
    record,
    createLedgerEntry({
      userId,
      eventType: 'adjustment',
      source: 'admin',
      pointsDelta,
      title: pointsDelta >= 0 ? 'Admin CX grant' : 'Admin CX removal',
      detail,
      idempotencyKey: `admin-adjust-${userId}-${Date.now()}`,
    })
  )
  writeCxRewardState(state)
}

export function getCxRewardSnapshot({
  userId,
  plan,
  activitySummary = {
    growUpdatesThisWeek: 0,
    feedSchedulesThisWeek: 0,
    checkInsThisWeek: 0,
    photoUploadsThisWeek: 0,
    journalEntriesThisWeek: 0,
  },
}: {
  userId: string
  plan?: SubscriptionPlanKey | 'professional'
  activitySummary?: CxMissionActivitySummary
}): CxRewardsSnapshot {
  const state = readCxRewardState()
  const catalog = readCxRewardCatalog()
  const config = readCxRewardConfig()
  const record = ensureUserRecord(state, userId)
  const now = new Date()
  const tier = planToMembershipTier(plan)
  const balances = getLedgerBalance(record.ledger)
  const missions = missionSnapshotsForUser({ record, activitySummary, now })
  const inactivityWarningDate = addDays(new Date(record.profile.lastActivityAt), config.inactivityExpiryDays - config.pointsExpiryWarningDays)
  const expiringSoon = inactivityWarningDate.getTime() <= now.getTime() ? balances.balance : 0
  const availableRewards = catalog.filter((reward) => rewardStillAvailable(reward, now) && rewardTierAllowed(reward, tier))
  const recommendedRewards = availableRewards
    .filter((reward) => reward.featured || reward.category === 'digital' || reward.category === 'store-credit')
    .sort((left, right) => left.costCx - right.costCx)
    .slice(0, 6)
  const closestRewardGap = availableRewards
    .map((reward) => ({ reward, gap: Math.max(0, reward.costCx - Math.max(0, balances.balance)) }))
    .sort((left, right) => left.gap - right.gap)[0]

  if (
    addHours(new Date(record.profile.lastActivityAt), config.inactivityExpiryDays * 24).getTime() < now.getTime() &&
    balances.balance > 0 &&
    !hasIdempotency(record.ledger, `inactive-expiry-${dayKey(now)}`)
  ) {
    addLedgerEntry(
      record,
      createLedgerEntry({
        userId,
        eventType: 'expiry',
        source: 'admin',
        pointsDelta: -balances.balance,
        title: 'CX expired after inactivity',
        detail: 'Points expired after 12 months of account inactivity.',
        idempotencyKey: `inactive-expiry-${dayKey(now)}`,
        status: 'expired',
      })
    )
    writeCxRewardState(state)
    return getCxRewardSnapshot({ userId, plan })
  }

  return {
    tier,
    balanceCx: Math.max(0, balances.balance),
    earnedCx: balances.earned,
    spentCx: balances.spent,
    expiringCx: Math.max(0, expiringSoon),
    inactivityWarningDate: inactivityWarningDate.toISOString(),
    currentValueCents: cxToStoreCreditCents(Math.max(0, balances.balance), tier, config),
    monthlyValueCents: cxToStoreCreditCents(Math.max(0, balances.balance), 'monthly', config),
    yearlyValueCents: cxToStoreCreditCents(Math.max(0, balances.balance), 'yearly', config),
    storeCreditBalanceCents: Math.max(0, record.profile.storeCreditBalanceCents),
    streak: {
      current: record.profile.currentStreak,
      longest: record.profile.longestStreak,
      todayClaimed: Boolean(record.profile.lastCheckInDate && isSameUtcDay(new Date(record.profile.lastCheckInDate), now)),
      nextRewardCx: streakDayReward(record.profile.currentStreak + 1, config),
      nextMilestone: nextStreakMilestone(record.profile.currentStreak, config),
    },
    wheel: {
      canSpin: !record.profile.lastFreeSpinAt || addHours(new Date(record.profile.lastFreeSpinAt), 24).getTime() <= now.getTime() || record.profile.extraWheelSpins > 0,
      extraSpins: record.profile.extraWheelSpins,
      lastFreeSpinAt: record.profile.lastFreeSpinAt,
    },
    referralCode: record.profile.referralCode,
    achievements: [...record.profile.achievements].sort((left, right) => right.unlockedAt.localeCompare(left.unlockedAt)),
    ownedRewards: Object.entries(record.profile.ownedRewards)
      .map(([rewardId, quantity]) => {
        const reward = catalog.find((item) => item.id === rewardId)
        return reward ? { reward, quantity } : null
      })
      .filter((value): value is { reward: CxRewardDefinition; quantity: number } => Boolean(value)),
    recommendedRewards,
    availableRewards,
    notifications: [
      ...(record.profile.lastCheckInDate && !isSameUtcDay(new Date(record.profile.lastCheckInDate), now)
        ? [{
            id: `nudge-checkin-${dayKey(now)}`,
            kind: 'daily_check_in_available' as const,
            title: 'Daily check-in is ready',
            body: `Claim ${streakDayReward(record.profile.currentStreak + 1, config)} CX and keep the streak alive.`,
            createdAt: nowIso(),
          }]
        : []),
      ...(!record.profile.lastFreeSpinAt || addHours(new Date(record.profile.lastFreeSpinAt), 24).getTime() <= now.getTime()
        ? [{
            id: `nudge-wheel-${dayKey(now)}`,
            kind: 'wheel_ready' as const,
            title: 'Grow Wheel spin available',
            body: 'Your free 24-hour wheel spin is ready.',
            createdAt: nowIso(),
          }]
        : []),
      ...missions.some((mission) => mission.readyToClaim)
        ? [{
            id: `nudge-mission-${weekKey(now)}`,
            kind: 'reward_unlocked' as const,
            title: 'Weekly mission ready to claim',
            body: `${missions.filter((mission) => mission.readyToClaim).length} CX mission rewards are ready now.`,
            createdAt: nowIso(),
          }]
        : [],
      ...expiringSoon > 0
        ? [{
            id: `nudge-expiry-${dayKey(now)}`,
            kind: 'points_expiring' as const,
            title: 'CX points are nearing expiry',
            body: `${expiringSoon} CX will expire soon without fresh activity.`,
            createdAt: nowIso(),
          }]
        : [],
      ...closestRewardGap && closestRewardGap.gap > 0 && closestRewardGap.gap <= 80
        ? [{
            id: `nudge-gap-${closestRewardGap.reward.id}-${dayKey(now)}`,
            kind: 'reward_unlocked' as const,
            title: `You're ${closestRewardGap.gap} CX away`,
            body: `${closestRewardGap.reward.title} is almost claimable.`,
            createdAt: nowIso(),
          }]
        : [],
      ...(tier !== 'yearly'
        ? [{
            id: `nudge-upgrade-${dayKey(now)}`,
            kind: 'upgrade_reminder' as const,
            title: 'Annual gives the best CX value',
            body: `${Math.max(0, balances.balance)} CX is worth ${formatMoneyFromCents(cxToStoreCreditCents(Math.max(0, balances.balance), 'yearly', config))} on Annual.`,
            createdAt: nowIso(),
          }]
        : []),
      ...record.profile.notifications,
    ].slice(0, 10),
    recentLedger: record.ledger.slice(0, 12),
    suspiciousFlags: record.profile.suspiciousFlags,
    plantStage: record.profile.plantStage,
    missions,
  }
}

export function getCxRewardsAdminSummary() {
  const state = readCxRewardState()
  const catalog = readCxRewardCatalog()
  const users = Object.values(state.users)
  const ledger = users.flatMap((user) => user.ledger)
  const redemptions = ledger.filter((entry) => entry.source === 'reward_redemption' && entry.pointsDelta < 0)
  const missionClaims = ledger.filter((entry) => entry.source === 'mission' && entry.pointsDelta > 0).length
  const redemptionMix = redemptions.reduce<Record<string, number>>((acc, entry) => {
    const category = typeof entry.metadata?.rewardCategory === 'string' ? entry.metadata.rewardCategory : 'unknown'
    acc[category] = (acc[category] ?? 0) + 1
    return acc
  }, {})
  const topRewards = redemptions.reduce<Record<string, number>>((acc, entry) => {
    const rewardId = typeof entry.metadata?.rewardId === 'string' ? entry.metadata.rewardId : ''
    if (!rewardId) return acc
    acc[rewardId] = (acc[rewardId] ?? 0) + 1
    return acc
  }, {})

  return {
    users: users.length,
    totalCxIssued: ledger.filter((entry) => entry.pointsDelta > 0).reduce((sum, entry) => sum + entry.pointsDelta, 0),
    totalCxSpent: Math.abs(ledger.filter((entry) => entry.pointsDelta < 0).reduce((sum, entry) => sum + entry.pointsDelta, 0)),
    storeCreditLiabilityCents: users.reduce((sum, user) => sum + user.profile.storeCreditBalanceCents, 0),
    missionClaims,
    suspiciousFlags: users.flatMap((user) => user.profile.suspiciousFlags.map((flag) => `${user.profile.userId}: ${flag}`)),
    redemptionMix: Object.entries(redemptionMix)
      .map(([category, count]) => ({ category, count }))
      .sort((left, right) => right.count - left.count),
    topRewards: Object.entries(topRewards)
      .map(([rewardId, count]) => ({
        reward: catalog.find((item) => item.id === rewardId)?.title ?? rewardId,
        count,
      }))
      .sort((left, right) => right.count - left.count)
      .slice(0, 6),
  }
}

const featureUnlockMap: Partial<Record<string, string[]>> = {
  advanced_feed_charts: ['advanced-feed-schedule'],
  full_product_education: ['premium-grow-guide'],
}

export function hasActiveRewardUnlock(featureKey: string, userId: string) {
  const rewardIds = featureUnlockMap[featureKey]
  if (!rewardIds?.length) return false
  const state = readCxRewardState()
  const record = state.users[userId]
  if (!record) return false
  return rewardIds.some((rewardId) => rewardCountForUser(record.profile, rewardId) > 0)
}

export function buildMockReferralReward({
  userId,
  purchased = false,
}: {
  userId: string
  purchased?: boolean
}) {
  const state = readCxRewardState()
  const record = ensureUserRecord(state, userId)
  const rewardCx = purchased ? 1000 : 500
  addLedgerEntry(
    record,
    createLedgerEntry({
      userId,
      eventType: 'earn',
      source: purchased ? 'referral_purchase' : 'referral_signup',
      pointsDelta: rewardCx,
      title: purchased ? 'Referral first purchase reward' : 'Referral signup reward',
      detail: purchased ? 'Valid referral purchase confirmed.' : 'Referral signup recorded.',
      idempotencyKey: `mock-referral-${userId}-${purchased ? 'purchase' : 'signup'}-${Date.now()}`,
    })
  )
  if (purchased) {
    record.profile.referredPurchasers += 1
  } else {
    record.profile.referredUsers += 1
  }
  writeCxRewardState(state)
}
