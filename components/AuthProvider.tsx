'use client'

import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { authIsConfigured, authSiteUrl, mockUser, readStoredUser, storeUser, supabaseAuth, type AuthResult, type AuthUser } from '@/lib/auth'
import { clearSupabaseBootstrapCache, getCurrentSupabaseAuthUser, loadCurrentUserPlan } from '@/lib/supabase-services'
import { exchangeSupabaseSessionFromUrl } from '@/lib/supabase-auth-flow'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  resetPassword: (email: string) => Promise<AuthResult>
  updatePassword: (password: string) => Promise<AuthResult>
  refreshUser: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

const appAuthPrefixes = [
  '/account',
  '/admin',
  '/analytics',
  '/calendar',
  '/cart',
  '/check-in',
  '/copilot',
  '/dashboard',
  '/environment',
  '/export',
  '/feed-calculator',
  '/feed-charts',
  '/feed-log',
  '/grows',
  '/inventory',
  '/journal',
  '/login',
  '/photos',
  '/portal',
  '/pro',
  '/rewards',
  '/signup',
  '/update-password',
  '/weekly-review',
]

function shouldLoadLiveAuth(pathname: string | null) {
  if (!pathname) return false
  return appAuthPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const pendingExchangeRef = useRef<string | null>(null)
  const currentUserPlanRef = useRef<AuthUser['plan']>('free')
  const loadLiveAuth = shouldLoadLiveAuth(pathname)

  useEffect(() => {
    currentUserPlanRef.current = user?.plan ?? 'free'
  }, [user?.plan])

  useEffect(() => {
    let active = true

    async function loadUser() {
      if (!loadLiveAuth) {
        if (active) setUser(readStoredUser())
        if (active) setLoading(false)
        return
      }

      if (!supabaseAuth) {
        if (active) setUser(readStoredUser())
        if (active) setLoading(false)
        return
      }

      try {
        if (typeof window !== 'undefined') {
          const currentUrl = new URL(window.location.href)
          const code = currentUrl.searchParams.get('code')
          if (code && pendingExchangeRef.current !== code) {
            pendingExchangeRef.current = code
            const exchange = await exchangeSupabaseSessionFromUrl()
            if (exchange.error) {
              throw new Error(exchange.error)
            }
          }
        }

        const authUser = await getCurrentSupabaseAuthUser()
        if (!active) return
        if (authUser?.email) {
          const plan = await loadCurrentUserPlan({ authUser }).catch(() => 'free' as const)
          const resolvedUser = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name ?? authUser.email.split('@')[0],
            plan,
          }
          setUser(resolvedUser)
          storeUser(resolvedUser)
        } else {
          setUser(readStoredUser())
        }
      } catch {
        if (active) setUser(readStoredUser())
      } finally {
        if (active) setLoading(false)
      }
    }

    loadUser()
    if (!loadLiveAuth) {
      return () => {
        active = false
      }
    }
    const subscription = supabaseAuth?.auth.onAuthStateChange((event, session) => {
      if (!active) return
      if (event === 'INITIAL_SESSION') return

      if (!session?.user?.email) {
        setUser(null)
        storeUser(null)
        setLoading(false)
        return
      }

      const email = session.user.email ?? ''
      const nextUser = {
        id: session.user.id,
        email,
        name: session.user.user_metadata?.name ?? email.split('@')[0],
        plan: currentUserPlanRef.current,
      }
      setUser(nextUser)
      storeUser(nextUser)
      setLoading(false)

      void loadCurrentUserPlan({ authUser: session.user })
        .then((plan) => {
          if (!active) return
          const email = session.user.email ?? ''
          const resolvedUser = {
            id: session.user.id,
            email,
            name: session.user.user_metadata?.name ?? email.split('@')[0],
            plan,
          }
          setUser(resolvedUser)
          storeUser(resolvedUser)
        })
        .catch(() => {
          // Keep the session visible even if the plan lookup fails.
        })
    })
    return () => {
      active = false
      subscription?.data.subscription.unsubscribe()
    }
  }, [loadLiveAuth])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isConfigured: authIsConfigured,
    async signIn(email, password) {
      if (supabaseAuth) {
        clearSupabaseBootstrapCache()
        const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
        if (error) return { user: null, error: error.message }
        const plan = await loadCurrentUserPlan({ authUser: data.user, force: true }).catch(() => 'free' as const)
        const nextUser = data.user?.email
          ? {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name ?? data.user.email.split('@')[0],
              plan,
            }
          : null
        setUser(nextUser)
        storeUser(nextUser)
        return { user: nextUser, error: null }
      }

      const nextUser = mockUser(email, email.split('@')[0])
      setUser(nextUser)
      storeUser(nextUser)
      return { user: nextUser, error: null }
    },
    async signUp(name, email, password) {
      if (supabaseAuth) {
        clearSupabaseBootstrapCache()
        const { data, error } = await supabaseAuth.auth.signUp({
          email,
          password,
          options: {
            data: { name },
            emailRedirectTo: `${authSiteUrl}/auth/callback?next=/onboarding`,
          },
        })
        if (error) return { user: null, error: error.message }
        const plan = await loadCurrentUserPlan({ authUser: data.user, force: true }).catch(() => 'free' as const)
        const nextUser = data.user?.email
          ? {
              id: data.user.id,
              email: data.user.email,
              name,
              plan,
            }
          : null
        setUser(nextUser)
        storeUser(nextUser)
        return {
          user: nextUser,
          error: null,
          message: data.session ? undefined : 'Check your email to confirm your account before signing in.',
        }
      }

      const nextUser = mockUser(email, name)
      setUser(nextUser)
      storeUser(nextUser)
      return { user: nextUser, error: null }
    },
    async resetPassword(email) {
      if (supabaseAuth) {
        const { error } = await supabaseAuth.auth.resetPasswordForEmail(email, {
          redirectTo: `${authSiteUrl}/update-password`,
        })
        if (error) return { user: null, error: error.message }
        return { user: null, error: null, message: 'Password reset email sent. Check your inbox.' }
      }

      return { user: null, error: null, message: 'Mock reset complete. Configure Supabase email for production reset links.' }
    },
    async updatePassword(password) {
      if (supabaseAuth) {
        const { data, error } = await supabaseAuth.auth.updateUser({ password })
        if (error) return { user: null, error: error.message }
        const plan = await loadCurrentUserPlan({ authUser: data.user }).catch(() => 'free' as const)
        const nextUser = data.user?.email
          ? {
              id: data.user.id,
              email: data.user.email,
              name: data.user.user_metadata?.name ?? data.user.email.split('@')[0],
              plan,
            }
          : user
        setUser(nextUser)
        storeUser(nextUser)
        return { user: nextUser, error: null, message: 'Password updated.' }
      }
      return { user, error: null, message: 'Mock password updated.' }
    },
    async refreshUser() {
      if (!supabaseAuth) {
        setUser(readStoredUser())
        return
      }

      try {
        await exchangeSupabaseSessionFromUrl().catch(() => undefined)
        const authUser = await getCurrentSupabaseAuthUser({ force: true })
        if (authUser?.email) {
          const plan = await loadCurrentUserPlan({ authUser, force: true }).catch(() => 'free' as const)
          const nextUser = {
            id: authUser.id,
            email: authUser.email,
            name: authUser.user_metadata?.name ?? authUser.email.split('@')[0],
            plan,
          }
          setUser(nextUser)
          storeUser(nextUser)
          return
        }
      } catch {
        // Keep the last known user when Supabase is temporarily unreachable.
      }
      setUser(readStoredUser())
    },
    async signOut() {
      if (supabaseAuth) await supabaseAuth.auth.signOut()
      clearSupabaseBootstrapCache()
      setUser(null)
      storeUser(null)
    },
  }), [loading, user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used inside AuthProvider')
  return context
}
