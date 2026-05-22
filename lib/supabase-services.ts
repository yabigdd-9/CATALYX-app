import { activeGrow } from '@/lib/catalyx'
import { authIsConfigured, supabaseAuth } from '@/lib/auth'

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

export type SupabaseSaveState = {
  ok: boolean
  source: 'supabase' | 'local'
  message: string
}

async function getAuthUser() {
  if (!authIsConfigured || !supabaseAuth) return null
  const { data, error } = await supabaseAuth.auth.getUser()
  if (error || !data.user?.email) return null
  return data.user
}

export async function ensureAppUser(): Promise<AppUserRow | null> {
  const authUser = await getAuthUser()
  if (!authUser?.email || !supabaseAuth) return null

  const payload = {
    auth_user_id: authUser.id,
    email: authUser.email,
    full_name: authUser.user_metadata?.name ?? authUser.email.split('@')[0],
  }

  const { data, error } = await supabaseAuth
    .from('users')
    .upsert(payload, { onConflict: 'auth_user_id' })
    .select('id, auth_user_id, email, full_name, subscription_status')
    .single()

  if (error) {
    throw new Error(error.message)
  }

  return data as AppUserRow
}

export async function loadCurrentUserPlan(): Promise<'free' | 'professional'> {
  if (!authIsConfigured || !supabaseAuth) return 'free'

  const appUser = await ensureAppUser()
  if (!appUser) return 'free'

  const { data: planRow, error: planError } = await supabaseAuth
    .from('user_plan')
    .select('plan')
    .eq('user_id', appUser.id)
    .maybeSingle()

  if (planError) throw new Error(planError.message)
  if (String(planRow?.plan ?? '').startsWith('professional')) return 'professional'

  const { data: subscription, error: subscriptionError } = await supabaseAuth
    .from('subscriptions')
    .select('plan, status')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subscriptionError) throw new Error(subscriptionError.message)

  const active = ['active', 'trialing'].includes(String(subscription?.status ?? ''))
  const proPlan = String(subscription?.plan ?? '').startsWith('professional')
  return active && proPlan ? 'professional' : 'free'
}

export async function ensureActiveGrow(): Promise<GrowRow | null> {
  const appUser = await ensureAppUser()
  if (!appUser || !supabaseAuth) return null

  const { data: existing, error: existingError } = await supabaseAuth
    .from('grows')
    .select('id, user_id, name')
    .eq('user_id', appUser.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existingError) throw new Error(existingError.message)
  if (existing) return existing as GrowRow

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
  return data as GrowRow
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
  return { ok: true, source: 'supabase', message: 'Feed log synced to Supabase.' }
}

export async function loadFeedLogsFromSupabase() {
  if (!authIsConfigured || !supabaseAuth) return []
  const grow = await ensureActiveGrow()
  if (!grow) return []

  const { data, error } = await supabaseAuth
    .from('feed_logs')
    .select('fed_at, water_litres, ec, ph, runoff_ec, runoff_ph, plant_response')
    .eq('grow_id', grow.id)
    .order('fed_at', { ascending: false })
    .limit(12)

  if (error) throw new Error(error.message)

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
    low_stock_warning: false,
  })

  if (error) throw new Error(error.message)
  return { ok: true, source: 'supabase', message: 'Product synced to My Shelf.' }
}
