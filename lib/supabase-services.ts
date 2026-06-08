import { activeGrow, type CultivationRoom, type DailyCheckIn, type GrowPhoto, type GrowTent, type JournalEntry, type Medium, type Stage, type TrackedGrow, type TrackedPlant } from '@/lib/catalyx'
import { authIsConfigured, supabaseAuth } from '@/lib/auth'
import type { SubscriptionPlanKey } from '@/lib/subscriptions'
import type { User as SupabaseUser } from '@supabase/supabase-js'

type AppUserRow = {
  id: string
  auth_user_id: string
  email: string
  full_name: string | null
  subscription_status?: string | null
}

type GrowRow = {
  id: string
  user_id: string
  name: string
}

let authUserCache: SupabaseUser | null = null
let authUserPromise: Promise<SupabaseUser | null> | null = null
let appUserCache: { authUserId: string; row: AppUserRow } | null = null
let appUserPromise: { authUserId: string; promise: Promise<AppUserRow | null> } | null = null
let planCache: { appUserId: string; plan: SubscriptionPlanKey } | null = null
let planPromise: { appUserId: string; promise: Promise<SubscriptionPlanKey> } | null = null
let activeGrowCache: { appUserId: string; row: GrowRow } | null = null
let activeGrowPromise: { appUserId: string; promise: Promise<GrowRow | null> } | null = null
let productOrdersPromise: { authUserId: string; promise: Promise<ProductOrderRow[]> } | null = null
let rewardWalletPromise: { appUserId: string; promise: Promise<RewardWalletRow | null> } | null = null
let feedLogsPromise: { growId: string; promise: Promise<ReturnType<typeof mapFeedLogRows>> } | null = null
let environmentLogsPromise: { growId: string; promise: Promise<ReturnType<typeof mapEnvironmentLogRows>> } | null = null
let dailyCheckInsPromise: { growId: string; promise: Promise<DailyCheckIn[]> } | null = null
let photosPromise: { growId: string; promise: Promise<GrowPhoto[]> } | null = null

export type ProductOrderLine = {
  product_id: string
  quantity: number
}

export type ProductOrderRow = {
  id: string
  stripe_checkout_session_id: string | null
  stripe_payment_intent_id: string | null
  customer_email: string | null
  order_lines: ProductOrderLine[]
  amount_total: number | null
  subtotal_cents: number
  store_credit_applied_cents: number
  refunded_amount_cents: number
  currency: string | null
  status: string | null
  created_at: string
}

export type RewardWalletRow = {
  balanceCx: number
  tier: 'free' | 'monthly' | 'yearly'
  storeCreditBalanceCents: number
  pendingStoreCreditCents: number
}

export type ProductInventoryRow = {
  id: string
  productId: string
  bottleSizeMl: number
  amountRemainingMl: number
  usagePerFeedMl: number
  estimatedDaysLeft: number
  estimatedReorderDate: string | null
  lowStockWarning: boolean
  reorderThresholdDays: number
  lastUsedAt: string | null
}

export type SupabaseHierarchy = {
  grows: TrackedGrow[]
  rooms: CultivationRoom[]
  tents: GrowTent[]
  plants: TrackedPlant[]
}

export type SupabaseGrowContext = {
  id: string
  name: string
  strain: string
  startDate: string
  stage: string
  medium: string
  lightSchedule: string
  goal: string
  feedingStyle: string
  environmentNotes: string
  healthStatus: string
  notes: string
  source: 'supabase'
}

export type SupabaseSaveState = {
  ok: boolean
  source: 'supabase' | 'local'
  message: string
}

export function clearSupabaseBootstrapCache() {
  authUserCache = null
  authUserPromise = null
  appUserCache = null
  appUserPromise = null
  planCache = null
  planPromise = null
  activeGrowCache = null
  activeGrowPromise = null
  productOrdersPromise = null
  rewardWalletPromise = null
  feedLogsPromise = null
  environmentLogsPromise = null
  dailyCheckInsPromise = null
  photosPromise = null
}

function clearSupabaseUserDataCache() {
  activeGrowCache = null
  activeGrowPromise = null
  productOrdersPromise = null
  rewardWalletPromise = null
  feedLogsPromise = null
  environmentLogsPromise = null
  dailyCheckInsPromise = null
  photosPromise = null
}

export async function getCurrentSupabaseAuthUser({ force = false }: { force?: boolean } = {}) {
  if (!authIsConfigured || !supabaseAuth) return null

  if (!force && authUserCache?.email) return authUserCache
  if (!force && authUserPromise) return authUserPromise

  authUserPromise = supabaseAuth.auth.getUser()
    .then(({ data, error }) => {
      const user = error || !data.user?.email ? null : data.user
      authUserCache = user
      return user
    })
    .finally(() => {
      authUserPromise = null
    })

  return authUserPromise
}

export async function ensureAppUser({ authUser, force = false }: { authUser?: SupabaseUser | null; force?: boolean } = {}): Promise<AppUserRow | null> {
  const resolvedAuthUser = authUser ?? await getCurrentSupabaseAuthUser({ force })
  if (!resolvedAuthUser?.email || !supabaseAuth) return null

  authUserCache = resolvedAuthUser

  if (!force && appUserCache?.authUserId === resolvedAuthUser.id) {
    return appUserCache.row
  }

  if (!force && appUserPromise?.authUserId === resolvedAuthUser.id) {
    return appUserPromise.promise
  }

  const payload = {
    auth_user_id: resolvedAuthUser.id,
    email: resolvedAuthUser.email,
    full_name: resolvedAuthUser.user_metadata?.name ?? resolvedAuthUser.email.split('@')[0],
  }

  const promise: Promise<AppUserRow | null> = (async () => {
    const selectColumns = 'id, auth_user_id, email, full_name, subscription_status'
    const { data: byAuthId, error: authLookupError } = await supabaseAuth
      .from('users')
      .select(selectColumns)
      .eq('auth_user_id', resolvedAuthUser.id)
      .maybeSingle()

    if (authLookupError) throw new Error(authLookupError.message)
    if (byAuthId) return byAuthId as AppUserRow

    const { data: byEmail, error: emailLookupError } = await supabaseAuth
      .from('users')
      .select(selectColumns)
      .eq('email', resolvedAuthUser.email)
      .maybeSingle()

    if (emailLookupError) throw new Error(emailLookupError.message)

    if (byEmail?.id) {
      const { data, error } = await supabaseAuth
        .from('users')
        .update(payload)
        .eq('id', byEmail.id)
        .select(selectColumns)
        .single()

      if (error) throw new Error(error.message)
      return data as AppUserRow
    }

    const { data, error } = await supabaseAuth
      .from('users')
      .insert(payload)
      .select(selectColumns)
      .single()

    if (error) throw new Error(error.message)
    return data as AppUserRow
  })()
    .then((row) => {
      appUserCache = { authUserId: resolvedAuthUser.id, row }
      return row
    })
    .finally(() => {
      if (appUserPromise?.authUserId === resolvedAuthUser.id) {
        appUserPromise = null
      }
    })

  appUserPromise = { authUserId: resolvedAuthUser.id, promise }
  return promise
}

export async function loadCurrentUserPlan({ authUser, force = false }: { authUser?: SupabaseUser | null; force?: boolean } = {}): Promise<SubscriptionPlanKey> {
  if (!authIsConfigured || !supabaseAuth) return 'free'

  const appUser = await ensureAppUser({ authUser, force })
  if (!appUser) return 'free'

  if (!force && planCache?.appUserId === appUser.id) {
    return planCache.plan
  }

  if (!force && planPromise?.appUserId === appUser.id) {
    return planPromise.promise
  }

  const promise: Promise<SubscriptionPlanKey> = (async () => {
    const { data: planRow, error: planError } = await supabaseAuth
      .from('user_plan')
      .select('plan')
      .eq('user_id', appUser.id)
      .maybeSingle()

    if (planError) throw new Error(planError.message)
    if (planRow?.plan === 'professional_yearly') return 'professional_yearly'
    if (planRow?.plan === 'professional_monthly') return 'professional_monthly'
    if (String(planRow?.plan ?? '').startsWith('professional')) return 'professional_monthly'

    const { data: subscription, error: subscriptionError } = await supabaseAuth
      .from('subscriptions')
      .select('plan, status')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (subscriptionError) throw new Error(subscriptionError.message)

    const active = ['active', 'trialing'].includes(String(subscription?.status ?? ''))
    if (!active) return 'free'
    if (subscription?.plan === 'professional_yearly') return 'professional_yearly'
    if (subscription?.plan === 'professional_monthly') return 'professional_monthly'
    return String(subscription?.plan ?? '').startsWith('professional') ? 'professional_monthly' : 'free'
  })()
    .then((plan) => {
      planCache = { appUserId: appUser.id, plan }
      return plan
    })
    .finally(() => {
      if (planPromise?.appUserId === appUser.id) {
        planPromise = null
      }
    })

  planPromise = { appUserId: appUser.id, promise }
  return promise
}

export async function loadCurrentUserProductOrders(): Promise<ProductOrderRow[]> {
  if (!authIsConfigured || !supabaseAuth) return []

  const authUser = await getCurrentSupabaseAuthUser()
  if (!authUser) return []

  if (productOrdersPromise?.authUserId === authUser.id) return productOrdersPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('product_orders')
    .select('id, stripe_checkout_session_id, stripe_payment_intent_id, customer_email, order_lines, amount_total, subtotal_cents, store_credit_applied_cents, refunded_amount_cents, currency, status, created_at')
    .order('created_at', { ascending: false })
    .limit(12))
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)

      return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
        id: String(row.id ?? ''),
        stripe_checkout_session_id: row.stripe_checkout_session_id ? String(row.stripe_checkout_session_id) : null,
        stripe_payment_intent_id: row.stripe_payment_intent_id ? String(row.stripe_payment_intent_id) : null,
        customer_email: row.customer_email ? String(row.customer_email) : null,
        order_lines: Array.isArray(row.order_lines)
          ? row.order_lines
              .map((line) => {
                const record = typeof line === 'object' && line ? (line as Record<string, unknown>) : null
                const productId = record?.product_id ? String(record.product_id) : ''
                const quantity = Number(record?.quantity ?? 1)
                return productId ? { product_id: productId, quantity: Number.isFinite(quantity) ? quantity : 1 } : null
              })
              .filter((line): line is ProductOrderLine => Boolean(line))
          : [],
        amount_total: typeof row.amount_total === 'number' ? row.amount_total : Number(row.amount_total ?? 0),
        subtotal_cents: Number(row.subtotal_cents ?? 0),
        store_credit_applied_cents: Number(row.store_credit_applied_cents ?? 0),
        refunded_amount_cents: Number(row.refunded_amount_cents ?? 0),
        currency: row.currency ? String(row.currency) : null,
        status: row.status ? String(row.status) : null,
        created_at: String(row.created_at ?? ''),
      }))
    })
    .finally(() => {
      if (productOrdersPromise?.authUserId === authUser.id) productOrdersPromise = null
    })

  productOrdersPromise = { authUserId: authUser.id, promise }
  return promise
}

export async function loadCurrentUserRewardWallet(): Promise<RewardWalletRow | null> {
  if (!authIsConfigured || !supabaseAuth) return null

  const appUser = await ensureAppUser()
  if (!appUser) return null

  if (rewardWalletPromise?.appUserId === appUser.id) return rewardWalletPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('cx_reward_wallets')
    .select('balance_cx, tier, store_credit_balance_cents, pending_store_credit_cents')
    .eq('user_id', appUser.id)
    .maybeSingle())
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)
      if (!data) return null

      const tier = String(data.tier ?? 'free')
      const walletTier: RewardWalletRow['tier'] = tier === 'yearly' || tier === 'monthly' ? tier : 'free'
      return {
        balanceCx: Number(data.balance_cx ?? 0),
        tier: walletTier,
        storeCreditBalanceCents: Number(data.store_credit_balance_cents ?? 0),
        pendingStoreCreditCents: Number(data.pending_store_credit_cents ?? 0),
      }
    })
    .finally(() => {
      if (rewardWalletPromise?.appUserId === appUser.id) rewardWalletPromise = null
    })

  rewardWalletPromise = { appUserId: appUser.id, promise }
  return promise
}

export async function loadCurrentUserProductInventory(): Promise<ProductInventoryRow[]> {
  if (!authIsConfigured || !supabaseAuth) return []

  const appUser = await ensureAppUser()
  if (!appUser) return []

  const { data, error } = await supabaseAuth
    .from('product_inventory')
    .select('id, product_id, bottle_size_ml, amount_remaining_ml, usage_per_feed_ml, estimated_days_left, estimated_reorder_date, low_stock_warning, reorder_threshold_days, last_used_at')
    .eq('user_id', appUser.id)
    .order('estimated_days_left', { ascending: true })
    .limit(40)

  if (error) throw new Error(error.message)

  return ((data ?? []) as Array<Record<string, unknown>>).map((row) => ({
    id: String(row.id ?? ''),
    productId: String(row.product_id ?? ''),
    bottleSizeMl: Number(row.bottle_size_ml ?? 0),
    amountRemainingMl: Number(row.amount_remaining_ml ?? 0),
    usagePerFeedMl: Number(row.usage_per_feed_ml ?? 0),
    estimatedDaysLeft: Number(row.estimated_days_left ?? 0),
    estimatedReorderDate: row.estimated_reorder_date ? String(row.estimated_reorder_date) : null,
    lowStockWarning: Boolean(row.low_stock_warning),
    reorderThresholdDays: Number(row.reorder_threshold_days ?? 10),
    lastUsedAt: row.last_used_at ? String(row.last_used_at) : null,
  }))
}

export async function ensureActiveGrow(): Promise<GrowRow | null> {
  const appUser = await ensureAppUser()
  if (!appUser || !supabaseAuth) return null

  if (activeGrowCache?.appUserId === appUser.id) return activeGrowCache.row
  if (activeGrowPromise?.appUserId === appUser.id) return activeGrowPromise.promise

  const promise = (async () => {
    const { data: existing, error: existingError } = await supabaseAuth
      .from('grows')
      .select('id, user_id, name')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingError) throw new Error(existingError.message)
    if (existing) {
      const row = existing as GrowRow
      activeGrowCache = { appUserId: appUser.id, row }
      return row
    }

    const { data, error } = await supabaseAuth
      .from('grows')
      .insert({
        user_id: appUser.id,
        name: activeGrow.name,
        strain_name: activeGrow.strain,
        start_date: activeGrow.startDate,
        current_stage: activeGrow.stage,
        medium: activeGrow.medium,
        light_schedule: activeGrow.lightSchedule,
        grow_goal: activeGrow.goal,
        feeding_style: activeGrow.feedingStyle,
        environment_notes: activeGrow.notes,
        health_status: activeGrow.healthStatus,
        notes: activeGrow.notes,
      })
      .select('id, user_id, name')
      .single()

    if (error) throw new Error(error.message)
    const row = data as GrowRow
    activeGrowCache = { appUserId: appUser.id, row }
    return row
  })()
    .finally(() => {
      if (activeGrowPromise?.appUserId === appUser.id) activeGrowPromise = null
    })

  activeGrowPromise = { appUserId: appUser.id, promise }
  return promise
}

export async function loadActiveGrowFromSupabase(): Promise<SupabaseGrowContext | null> {
  if (!authIsConfigured || !supabaseAuth) return null
  const appUser = await ensureAppUser()
  if (!appUser) return null

  const { data, error } = await supabaseAuth
    .from('grows')
    .select('id, name, strain_name, start_date, current_stage, medium, light_schedule, grow_goal, feeding_style, environment_notes, health_status, notes')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) throw new Error(error.message)
  if (!data) return null

  return {
    id: String(data.id),
    name: String(data.name ?? activeGrow.name),
    strain: String(data.strain_name ?? ''),
    startDate: String(data.start_date ?? ''),
    stage: String(data.current_stage ?? ''),
    medium: String(data.medium ?? ''),
    lightSchedule: String(data.light_schedule ?? ''),
    goal: String(data.grow_goal ?? ''),
    feedingStyle: String(data.feeding_style ?? ''),
    environmentNotes: String(data.environment_notes ?? ''),
    healthStatus: String(data.health_status ?? ''),
    notes: String(data.notes ?? ''),
    source: 'supabase',
  }
}

export async function saveGrowToSupabase(input: Omit<TrackedGrow, 'id' | 'createdAt'>): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Grow saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  if (!appUser) return { ok: true, source: 'local', message: 'Grow saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('grows').insert({
    user_id: appUser.id,
    name: input.name,
    strain_name: input.strain,
    start_date: input.startDate,
    current_stage: input.stage,
    medium: input.medium,
    light_schedule: input.lightSchedule,
    grow_goal: input.goal,
    feeding_style: input.feedingStyle,
    environment_notes: input.environmentNotes,
    health_status: input.healthStatus,
    notes: input.notes,
  })

  if (error) throw new Error(error.message)
  clearSupabaseUserDataCache()
  return { ok: true, source: 'supabase', message: 'Grow synced to Supabase.' }
}

export async function loadCultivationHierarchyFromSupabase(): Promise<SupabaseHierarchy | null> {
  if (!authIsConfigured || !supabaseAuth) return null
  const appUser = await ensureAppUser()
  if (!appUser) return null

  const [growsResult, roomsResult, tentsResult] = await Promise.all([
    supabaseAuth
      .from('grows')
      .select('id, name, strain_name, start_date, current_stage, medium, light_schedule, grow_goal, feeding_style, environment_notes, health_status, notes, created_at')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(12),
    supabaseAuth
      .from('grow_rooms')
      .select('id, name, environment_type, location, notes, created_at')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(20),
    supabaseAuth
      .from('grow_tents')
      .select('id, room_id, name, size, light_model, airflow, notes, created_at')
      .eq('user_id', appUser.id)
      .order('created_at', { ascending: false })
      .limit(30),
  ])

  if (growsResult.error) throw new Error(growsResult.error.message)
  if (roomsResult.error) throw new Error(roomsResult.error.message)
  if (tentsResult.error) throw new Error(tentsResult.error.message)

  const growRows = growsResult.data ?? []
  const growIds = growRows.map((grow) => String(grow.id))
  const plantsResult = growIds.length
    ? await supabaseAuth
        .from('plants')
        .select('id, grow_id, tent_id, name, strain_name, current_stage, health_status, notes, created_at')
        .in('grow_id', growIds)
        .order('created_at', { ascending: false })
        .limit(80)
    : { data: [], error: null }

  if (plantsResult.error) throw new Error(plantsResult.error.message)

  return {
    grows: growRows.map((grow) => ({
      id: String(grow.id),
      name: String(grow.name ?? ''),
      strain: String(grow.strain_name ?? ''),
      startDate: String(grow.start_date ?? ''),
      stage: String(grow.current_stage ?? 'vegetative') as Stage,
      medium: String(grow.medium ?? 'coco') as Medium,
      lightSchedule: String(grow.light_schedule ?? ''),
      goal: String(grow.grow_goal ?? 'Beginner Mode') as TrackedGrow['goal'],
      feedingStyle: String(grow.feeding_style ?? ''),
      environmentNotes: String(grow.environment_notes ?? ''),
      healthStatus: String(grow.health_status ?? ''),
      notes: String(grow.notes ?? ''),
      createdAt: String(grow.created_at ?? new Date().toISOString()),
    })),
    rooms: (roomsResult.data ?? []).map((room) => ({
      id: String(room.id),
      name: String(room.name ?? ''),
      environmentType: String(room.environment_type ?? ''),
      location: String(room.location ?? ''),
      notes: String(room.notes ?? ''),
      createdAt: String(room.created_at ?? new Date().toISOString()),
    })),
    tents: (tentsResult.data ?? []).map((tent) => ({
      id: String(tent.id),
      roomId: String(tent.room_id ?? ''),
      name: String(tent.name ?? ''),
      size: String(tent.size ?? ''),
      lightModel: String(tent.light_model ?? ''),
      airflow: String(tent.airflow ?? ''),
      notes: String(tent.notes ?? ''),
      createdAt: String(tent.created_at ?? new Date().toISOString()),
    })),
    plants: (plantsResult.data ?? []).map((plant) => ({
      id: String(plant.id),
      growId: String(plant.grow_id ?? ''),
      tentId: String(plant.tent_id ?? ''),
      name: String(plant.name ?? ''),
      strain: String(plant.strain_name ?? ''),
      stage: String(plant.current_stage ?? 'vegetative') as Stage,
      healthStatus: String(plant.health_status ?? ''),
      notes: String(plant.notes ?? ''),
      createdAt: String(plant.created_at ?? new Date().toISOString()),
    })),
  }
}

export async function saveRoomToSupabase(input: Omit<CultivationRoom, 'id' | 'createdAt'>): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Room saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  if (!appUser) return { ok: true, source: 'local', message: 'Room saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('grow_rooms').insert({
    user_id: appUser.id,
    name: input.name,
    environment_type: input.environmentType,
    location: input.location,
    notes: input.notes,
  })

  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Room synced to Supabase.' }
}

export async function saveTentToSupabase(input: Omit<GrowTent, 'id' | 'createdAt'>): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Tent saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  if (!appUser) return { ok: true, source: 'local', message: 'Tent saved locally until the user signs in.' }

  const roomId = input.roomId && input.roomId.length === 36 ? input.roomId : null
  const { error } = await supabaseAuth.from('grow_tents').insert({
    user_id: appUser.id,
    room_id: roomId,
    name: input.name,
    size: input.size,
    light_model: input.lightModel,
    airflow: input.airflow,
    notes: input.notes,
  })

  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Tent synced to Supabase.' }
}

export async function savePlantToSupabase(input: Omit<TrackedPlant, 'id' | 'createdAt'>): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Plant saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', message: 'Plant saved locally until the user signs in.' }

  const tentId = input.tentId && input.tentId.length === 36 ? input.tentId : null
  const { error } = await supabaseAuth.from('plants').insert({
    grow_id: grow.id,
    tent_id: tentId,
    name: input.name,
    strain_name: input.strain,
    current_stage: input.stage,
    health_status: input.healthStatus,
    notes: input.notes,
  })

  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Plant synced to Supabase.' }
}

function safeStorageName(name: string) {
  const extension = name.includes('.') ? name.split('.').pop() : 'jpg'
  const base = name.replace(/\.[^/.]+$/, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return `${base || 'grow-photo'}.${extension || 'jpg'}`
}

export async function uploadGrowPhotoToSupabase(input: {
  file: File
  stage: Stage
  tag: string
  notes: string
}): Promise<{ ok: boolean; source: 'supabase' | 'local'; photo: GrowPhoto | null; message: string }> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', photo: null, message: 'Photo saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  const grow = await ensureActiveGrow()
  if (!appUser || !grow) {
    return { ok: true, source: 'local', photo: null, message: 'Photo saved locally until the user signs in.' }
  }

  const path = `${appUser.auth_user_id}/${grow.id}/${Date.now()}-${safeStorageName(input.file.name)}`
  const { error: uploadError } = await supabaseAuth.storage.from('grow-photos').upload(path, input.file, {
    cacheControl: '31536000',
    contentType: input.file.type || 'image/jpeg',
    upsert: false,
  })

  if (uploadError) throw new Error(uploadError.message)

  const { data: publicUrl } = supabaseAuth.storage.from('grow-photos').getPublicUrl(path)
  const { data, error } = await supabaseAuth
    .from('photos')
    .insert({
      grow_id: grow.id,
      url: publicUrl.publicUrl,
      stage: input.stage,
      tag: input.tag,
      notes: input.notes,
      captured_at: new Date().toISOString(),
    })
    .select('id, grow_id, url, stage, tag, notes, captured_at')
    .single()

  if (error) throw new Error(error.message)

  clearSupabaseUserDataCache()
  return {
    ok: true,
    source: 'supabase',
    message: 'Photo uploaded to Supabase Storage and synced to timeline.',
    photo: {
      id: String(data.id),
      growId: String(data.grow_id),
      url: String(data.url),
      stage: String(data.stage ?? input.stage) as Stage,
      tag: String(data.tag ?? input.tag),
      notes: String(data.notes ?? input.notes),
      capturedAt: String(data.captured_at ?? new Date().toISOString()),
      source: 'supabase',
    },
  }
}

export async function loadPhotosFromSupabase(): Promise<GrowPhoto[]> {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  if (photosPromise?.growId === grow.id) return photosPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('photos')
    .select('id, grow_id, url, stage, tag, notes, captured_at')
    .eq('grow_id', grow.id)
    .order('captured_at', { ascending: false })
    .limit(40))
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)

      return (data ?? []).map((photo) => ({
        id: String(photo.id),
        growId: String(photo.grow_id),
        url: String(photo.url),
        stage: String(photo.stage ?? 'vegetative') as Stage,
        tag: String(photo.tag ?? 'Progress'),
        notes: String(photo.notes ?? ''),
        capturedAt: String(photo.captured_at ?? new Date().toISOString()),
        source: 'supabase' as const,
      }))
    })
    .finally(() => {
      if (photosPromise?.growId === grow.id) photosPromise = null
    })

  photosPromise = { growId: grow.id, promise }
  return promise
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)
}

function mapJournalEntry(row: {
  id: unknown
  grow_id: unknown
  entry_type: unknown
  title: unknown
  body: unknown
  approved: unknown
  created_at: unknown
  updated_at: unknown
}): JournalEntry {
  return {
    id: String(row.id),
    growId: String(row.grow_id),
    type: String(row.entry_type ?? 'Observation') as JournalEntry['type'],
    title: String(row.title ?? ''),
    body: String(row.body ?? ''),
    approved: Boolean(row.approved),
    source: 'supabase',
    createdAt: String(row.created_at ?? new Date().toISOString()),
    updatedAt: String(row.updated_at ?? new Date().toISOString()),
  }
}

export async function loadJournalEntriesFromSupabase(): Promise<JournalEntry[]> {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  const { data, error } = await supabaseAuth
    .from('journal_entries')
    .select('id, grow_id, entry_type, title, body, approved, created_at, updated_at')
    .eq('grow_id', grow.id)
    .order('updated_at', { ascending: false })
    .limit(80)

  if (error) throw new Error(error.message)
  return (data ?? []).map(mapJournalEntry)
}

export async function saveDailyCheckInToSupabase(input: Omit<DailyCheckIn, 'id' | 'checkedAt' | 'source'>): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Check-in saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', message: 'Check-in saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('daily_checkins').insert({
    grow_id: grow.id,
    checked_at: new Date().toISOString(),
    leaf_colour: input.leafColour,
    droop_level: input.droopLevel,
    growth_speed: input.growthSpeed,
    stress_level: input.stressLevel,
    environment_stability: input.environmentStability,
    pest_concern: input.pestConcern,
    overall_plant_feel: input.overallPlantFeel,
  })

  if (error) throw new Error(error.message)
  clearSupabaseUserDataCache()
  return { ok: true, source: 'supabase', message: 'Check-in synced to Supabase.' }
}

export async function loadDailyCheckInsFromSupabase(): Promise<DailyCheckIn[]> {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  if (dailyCheckInsPromise?.growId === grow.id) return dailyCheckInsPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('daily_checkins')
    .select('id, checked_at, leaf_colour, droop_level, growth_speed, stress_level, environment_stability, pest_concern, overall_plant_feel')
    .eq('grow_id', grow.id)
    .order('checked_at', { ascending: false })
    .limit(30))
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)

      return (data ?? []).map((row) => {
        const stressLevel = Number(row.stress_level ?? 0)
        const droopLevel = Number(row.droop_level ?? 0)
        const environmentStability = Number(row.environment_stability ?? 75)
        return {
          id: String(row.id),
          checkedAt: String(row.checked_at ?? new Date().toISOString()),
          leafColour: String(row.leaf_colour ?? 'Balanced'),
          droopLevel,
          growthSpeed: String(row.growth_speed ?? 'Steady'),
          stressLevel,
          pestConcern: String(row.pest_concern ?? 'None'),
          environmentStability,
          overallPlantFeel: String(row.overall_plant_feel ?? 'Stable'),
          healthScore: Math.max(45, 100 - stressLevel * 8 - droopLevel * 6 + Math.round((environmentStability - 75) / 3)),
          source: 'supabase' as const,
        }
      })
    })
    .finally(() => {
      if (dailyCheckInsPromise?.growId === grow.id) dailyCheckInsPromise = null
    })

  dailyCheckInsPromise = { growId: grow.id, promise }
  return promise
}

export async function saveJournalEntryToSupabase(input: JournalEntry): Promise<{ ok: boolean; source: 'supabase' | 'local'; entry: JournalEntry | null; message: string }> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', entry: null, message: 'Journal saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', entry: null, message: 'Journal saved locally until the user signs in.' }

  const payload = {
    grow_id: grow.id,
    entry_type: input.type,
    title: input.title,
    body: input.body,
    approved: Boolean(input.approved),
    source: input.source === 'generated' ? 'generated' : 'manual',
    updated_at: new Date().toISOString(),
  }

  const query = isUuid(input.id)
    ? supabaseAuth.from('journal_entries').update(payload).eq('id', input.id).select('id, grow_id, entry_type, title, body, approved, created_at, updated_at').single()
    : supabaseAuth.from('journal_entries').insert(payload).select('id, grow_id, entry_type, title, body, approved, created_at, updated_at').single()

  const { data, error } = await query
  if (error) throw new Error(error.message)

  return { ok: true, source: 'supabase', entry: mapJournalEntry(data), message: 'Journal synced to Supabase.' }
}

export async function deleteJournalEntryFromSupabase(input: JournalEntry): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth || !isUuid(input.id)) {
    return { ok: true, source: 'local', message: 'Journal entry removed locally.' }
  }

  const { error } = await supabaseAuth.from('journal_entries').delete().eq('id', input.id)
  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Journal entry deleted from Supabase.' }
}

export async function saveOnboardingToSupabase(input: {
  medium: string
  experience: string
  stage: string
  feedingStyle: string
  delivery: string
  environment: string
  mode: string
}): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  if (!appUser) return { ok: true, source: 'local', message: 'Saved locally until the user signs in.' }

  const { error } = await supabaseAuth
    .from('users')
    .update({
      grow_style: input.medium,
      experience_level: input.experience,
      grow_goals: input.mode,
    })
    .eq('id', appUser.id)

  if (error) throw new Error(error.message)

  await ensureActiveGrow()
  return { ok: true, source: 'supabase', message: 'Onboarding synced to Supabase.' }
}

export async function saveFeedLogToSupabase(input: {
  litres: number
  ec: number
  ph: number
  runoffEc: number
  runoffPh: number
  response: string
  productAmounts: Record<string, number>
}): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Feed log saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', message: 'Feed log saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('feed_logs').insert({
    grow_id: grow.id,
    fed_at: new Date().toISOString(),
    water_litres: input.litres,
    product_amounts: input.productAmounts,
    ec: input.ec,
    ph: input.ph,
    runoff_ec: input.runoffEc,
    runoff_ph: input.runoffPh,
    plant_response: input.response,
  })

  if (error) throw new Error(error.message)
  clearSupabaseUserDataCache()
  return { ok: true, source: 'supabase', message: 'Feed log synced to Supabase.' }
}

function mapFeedLogRows(data: Array<Record<string, unknown>> | null | undefined) {
  return (data ?? []).map((log) => ({
    date: new Date(String(log.fed_at)).toLocaleDateString(),
    litres: Number(log.water_litres ?? 0),
    ec: Number(log.ec ?? 0),
    ph: Number(log.ph ?? 0),
    runoffEc: Number(log.runoff_ec ?? 0),
    runoffPh: Number(log.runoff_ph ?? 0),
    response: String(log.plant_response ?? 'Logged feed'),
  }))
}

export async function loadFeedLogsFromSupabase() {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  if (feedLogsPromise?.growId === grow.id) return feedLogsPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('feed_logs')
    .select('fed_at, water_litres, ec, ph, runoff_ec, runoff_ph, plant_response')
    .eq('grow_id', grow.id)
    .order('fed_at', { ascending: false })
    .limit(12))
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)
      return mapFeedLogRows(data)
    })
    .finally(() => {
      if (feedLogsPromise?.growId === grow.id) feedLogsPromise = null
    })

  feedLogsPromise = { growId: grow.id, promise }
  return promise
}

export async function saveReminderToSupabase(input: {
  title: string
  detail: string
  type?: string
}): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Reminder saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', message: 'Reminder saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('reminders').insert({
    user_id: grow.user_id,
    grow_id: grow.id,
    title: input.title,
    body: input.detail,
    type: input.type ?? 'basic',
    due_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Reminder synced to Supabase.' }
}

export async function saveEnvironmentLogToSupabase(input: {
  temperature: number
  humidity: number
  vpd: number
  reservoirTemp: number
  waterTemp: number
  ppfd: number
  dli: number
  runoffAmount: number
  note: string
}): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Environment log saved locally. Add Supabase env vars to sync.' }
  }

  const grow = await ensureActiveGrow()
  if (!grow) return { ok: true, source: 'local', message: 'Environment log saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('environment_logs').insert({
    grow_id: grow.id,
    logged_at: new Date().toISOString(),
    temperature: input.temperature,
    humidity: input.humidity,
    vpd: input.vpd,
    water_temperature: input.waterTemp,
    reservoir_temperature: input.reservoirTemp,
    runoff_amount: input.runoffAmount,
    ppfd: input.ppfd,
    dli: input.dli,
    note: input.note,
  })

  if (error) throw new Error(error.message)
  clearSupabaseUserDataCache()
  return { ok: true, source: 'supabase', message: 'Environment log synced to Supabase.' }
}

function mapEnvironmentLogRows(data: Array<Record<string, unknown>> | null | undefined) {
  return (data ?? []).map((log) => ({
    id: String(log.id),
    loggedAt: new Date(String(log.logged_at)).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
    temperature: Number(log.temperature ?? 0),
    humidity: Number(log.humidity ?? 0),
    vpd: Number(log.vpd ?? 0),
    reservoirTemp: Number(log.reservoir_temperature ?? 0),
    waterTemp: Number(log.water_temperature ?? 0),
    ppfd: Number(log.ppfd ?? 0),
    dli: Number(log.dli ?? 0),
    runoffAmount: Number(log.runoff_amount ?? 0),
    note: String(log.note ?? 'Synced from Supabase environment history.'),
  }))
}

export async function loadEnvironmentLogsFromSupabase() {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  if (environmentLogsPromise?.growId === grow.id) return environmentLogsPromise.promise

  const promise = Promise.resolve(supabaseAuth
    .from('environment_logs')
    .select('id, logged_at, temperature, humidity, vpd, reservoir_temperature, water_temperature, ppfd, dli, runoff_amount, note')
    .eq('grow_id', grow.id)
    .order('logged_at', { ascending: false })
    .limit(20))
    .then(({ data, error }) => {
      if (error) throw new Error(error.message)
      return mapEnvironmentLogRows(data)
    })
    .finally(() => {
      if (environmentLogsPromise?.growId === grow.id) environmentLogsPromise = null
    })

  environmentLogsPromise = { growId: grow.id, promise }
  return promise
}

export async function addProductToShelfSupabase(input: {
  productId: string
}): Promise<SupabaseSaveState> {
  if (!authIsConfigured || !supabaseAuth) {
    return { ok: true, source: 'local', message: 'Product saved locally. Add Supabase env vars to sync.' }
  }

  const appUser = await ensureAppUser()
  if (!appUser) return { ok: true, source: 'local', message: 'Product saved locally until the user signs in.' }

  const { error } = await supabaseAuth.from('product_inventory').insert({
    user_id: appUser.id,
    product_id: input.productId,
    bottle_size_ml: 1000,
    amount_remaining_ml: 1000,
    usage_per_feed_ml: 0,
    estimated_days_left: 30,
    estimated_reorder_date: new Date(Date.now() + 1000 * 60 * 60 * 24 * 22).toISOString().slice(0, 10),
    low_stock_warning: false,
    reorder_threshold_days: 10,
    last_used_at: new Date().toISOString(),
  })

  if (error) throw new Error(error.message)
  clearSupabaseUserDataCache()
  return { ok: true, source: 'supabase', message: 'Product synced to My Shelf.' }
}
