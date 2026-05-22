'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { authIsConfigured, mockUser, readStoredUser, storeUser, supabaseAuth, type AuthResult, type AuthUser } from '@/lib/auth'
import { loadCurrentUserPlan } from '@/lib/supabase-services'

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  isConfigured: boolean
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function loadUser() {
      if (supabaseAuth) {
        const { data } = await supabaseAuth.auth.getUser()
        if (active && data.user?.email) {
          const plan = await loadCurrentUserPlan().catch(() => 'free' as const)
          const resolvedUser = {
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name ?? data.user.email.split('@')[0],
            plan,
          }
          setUser(resolvedUser)
          storeUser(resolvedUser)
        }
      } else if (active) {
        setUser(readStoredUser())
      }

      if (active) setLoading(false)
    }

    loadUser()
    return () => {
      active = false
    }
  }, [])

  const value = useMemo<AuthContextValue>(() => ({
    user,
    loading,
    isConfigured: authIsConfigured,
    async signIn(email, password) {
      if (supabaseAuth) {
        const { data, error } = await supabaseAuth.auth.signInWithPassword({ email, password })
        if (error) return { user: null, error: error.message }
        const plan = await loadCurrentUserPlan().catch(() => 'free' as const)
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
        const { data, error } = await supabaseAuth.auth.signUp({
          email,
          password,
          options: { data: { name } },
        })
        if (error) return { user: null, error: error.message }
        const plan = await loadCurrentUserPlan().catch(() => 'free' as const)
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
        return { user: nextUser, error: null }
      }

      const nextUser = mockUser(email, name)
      setUser(nextUser)
      storeUser(nextUser)
      return { user: nextUser, error: null }
    },
    async signOut() {
      if (supabaseAuth) await supabaseAuth.auth.signOut()
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
