import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'

interface User {
  id: string
  email: string
  role: 'admin' | 'customer'
}

interface AuthContextType {
  user: User | null
  isAdmin: boolean
  loading: boolean
  login: (email: string, password: string) => Promise<{ error: string | null; isAdmin: boolean }>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          await fetchUserRole(session.user.id, session.user.email!)
        }
      } catch (e) {
        console.error('[Auth] checkSession error:', e)
      } finally {
        setLoading(false)
      }
    }

    checkSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (session?.user) {
          await fetchUserRole(session.user.id, session.user.email!)
        } else {
          setUser(null)
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // Returns true if the user is in admin_users with role=admin
  const fetchUserRole = async (userId: string, email: string): Promise<boolean> => {
    try {
      const { data: adminUser, error } = await supabase
        .from('admin_users')
        .select('role')
        .eq('id', userId)
        .single()

      if (error || !adminUser) {
        console.log('[Auth] User not in admin_users:', email)
        setUser({ id: userId, email, role: 'customer' })
        setIsAdmin(false)
        return false
      }

      const admin = adminUser.role === 'admin'
      setUser({ id: userId, email, role: adminUser.role })
      setIsAdmin(admin)
      return admin
    } catch (e) {
      console.error('[Auth] fetchUserRole error:', e)
      setUser({ id: userId, email, role: 'customer' })
      setIsAdmin(false)
      return false
    }
  }

  const login = async (email: string, password: string): Promise<{ error: string | null; isAdmin: boolean }> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        return { error: error.message || 'Email ou mot de passe incorrect', isAdmin: false }
      }

      if (data.user) {
        const adminResult = await fetchUserRole(data.user.id, data.user.email!)
        return { error: null, isAdmin: adminResult }
      }

      return { error: 'Utilisateur introuvable', isAdmin: false }
    } catch (e) {
      console.error('[Auth] login error:', e)
      return { error: 'Erreur de connexion', isAdmin: false }
    }
  }

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setIsAdmin(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAdmin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
