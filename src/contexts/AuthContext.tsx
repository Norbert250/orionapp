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
  const [user] = useState<any>({
    id: 'demo-user-123',
    email: 'user@demo.com'
  })
  const [isAdmin] = useState(false)
  const [loading] = useState(false)

  // Removed authentication logic - app now runs with demo user

  const signUp = async () => ({ data: null, error: null })
  const signIn = async () => ({ data: null, error: null })
  const signOut = async () => {}

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