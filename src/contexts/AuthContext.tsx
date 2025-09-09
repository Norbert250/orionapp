import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

interface AuthContextType {
  user: any
  isAdmin: boolean
  signUp: (email: string, password: string) => Promise<any>
  signIn: (email: string, password: string) => Promise<any>
  signOut: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType)

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<any>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      if (error) {
        console.error('Session error:', error)
      }
      setUser(session?.user ?? null)
      if (session?.user?.email) {
        checkUserRole(session.user.email)
      }
      setLoading(false)
    }).catch(error => {
      console.error('Failed to get session:', error)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email)
        setUser(session?.user ?? null)
        if (session?.user?.email) {
          checkUserRole(session.user.email)
        } else {
          setIsAdmin(false)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const checkUserRole = async (email: string | undefined) => {
    if (!email) return;
    console.log('Checking email:', email);
    // Check if admin email
    const adminRole = email === 'norbertndayisenga@gmail.com'
    console.log('Is admin:', adminRole);
    setIsAdmin(adminRole)
  }

  const signUp = async (email: string, password: string, fullName?: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })
    
    if (data.user && !error) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: email,
        full_name: fullName || email.split('@')[0]
      })
    }
    
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const result = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      console.log('Sign in result:', result)
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      throw error
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
  }

  return (
    <AuthContext.Provider value={{
      user,
      isAdmin,
      signUp,
      signIn,
      signOut,
      loading
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)