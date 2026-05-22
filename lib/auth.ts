import { createClient } from '@supabase/supabase-js'

export type AuthUser = {
  id: string
  email: string
  name: string
  plan: 'free' | 'professional'
}

export type AuthResult = {
  user: AuthUser | null
  error: string | null
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const authStorageKey = 'catalyx-auth-user'
export const authIsConfigured = Boolean(supabaseUrl && supabaseAnonKey)

export const supabaseAuth = authIsConfigured
  ? createClient(supabaseUrl as string, supabaseAnonKey as string)
  : null

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

