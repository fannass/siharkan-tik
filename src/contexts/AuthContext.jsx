import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { getSession, onAuthStateChange } from '../services/auth'
import supabase from '../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  const refreshSession = useCallback(async () => {
    try {
      const current = await getSession()
      setSession(current)
      return current
    } catch {
      setSession(null)
      return null
    }
  }, [])

  const clearSession = useCallback(() => {
    supabase.auth.stopAutoRefresh()
    setSession(null)
  }, [])

  useEffect(() => {
    let ignore = false

    async function init() {
      setLoading(true)
      const current = await getSession()
      if (!ignore) {
        setSession(current)
        setLoading(false)
      }
    }

    init()

    const { data: { subscription } } = onAuthStateChange((event, newSession) => {
      if (ignore) return
      if (event === 'SIGNED_OUT') {
        setSession(null)
      } else if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'USER_UPDATED') && newSession) {
        setSession(newSession)
      }
    })

    return () => {
      ignore = true
      subscription?.unsubscribe()
    }
  }, [])

  return (
    <AuthContext.Provider value={{ session, loading, refreshSession, clearSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
