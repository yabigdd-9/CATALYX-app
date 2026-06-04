import type { SubscriptionPlanKey } from '@/lib/subscriptions'
import { hasSupabase, supabaseServer } from '@/lib/supabase'

export type AuthUser = {
  id: string
  email: string
  name: string
  plan: SubscriptionPlanKey | 'professional'
}

export type AuthResult = {
  user: AuthUser | null
  error: string | null
  message?: string
}

function resolveSiteUrl(value?: string) {
  const trimmed = value?.trim()
  if (!trimmed) return 'http://localhost:3000'

  try {
    return new URL(trimmed).origin
  } catch {
    return 'http://localhost:3000'
  }
}

export const authSiteUrl = resolveSiteUrl(process.env.NEXT_PUBLIC_SITE_URL)

export const authStorageKey = 'catalyx-auth-user'
export const authIsConfigured = hasSupabase
export const supabaseAuth = supabaseServer

export function mockUser(email = 'grower@catalyx.local', name = 'Catalyx Grower'): AuthUser {
  return {
    id: `mock-${email}`,
    email,
    name,
    plan: 'free',
  }
}

export function readStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null

  try {
    const stored = window.localStorage.getItem(authStorageKey)
    return stored ? (JSON.parse(stored) as AuthUser) : null
  } catch {
    return null
  }
}

export function storeUser(user: AuthUser | null) {
  if (typeof window === 'undefined') return
  if (user) {
    window.localStorage.setItem(authStorageKey, JSON.stringify(user))
  } else {
    window.localStorage.removeItem(authStorageKey)
  }
}
