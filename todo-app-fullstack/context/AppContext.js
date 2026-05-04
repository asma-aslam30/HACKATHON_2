'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import { useSession, signIn, signOut, signUp } from '../lib/auth-client'

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const { data: session, isPending } = useSession()
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    if (!isPending) {
      setUser(session?.user || null)
      setLoading(false)
    }
  }, [session, isPending])

  const login = async (email, password) => {
    try {
      const result = await signIn.email({
        email,
        password,
        callbackURL: '/' // Redirect after login
      })
      if (result?.error) {
        throw new Error(result.error.message || 'Login failed')
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const signup = async (email, password, name) => {
    try {
      const result = await signUp.email({
        email,
        password,
        name: name || email.split('@')[0],
        callbackURL: '/' // Redirect after signup
      })
      if (result?.error) {
        throw new Error(result.error.message || 'Signup failed')
      }
      return result
    } catch (error) {
      throw error
    }
  }

  const logout = async () => {
    try {
      await signOut()
      setUser(null)
    } catch (error) {
      console.error('Logout error:', error)
    }
  }

  const addNotification = (notification) => {
    const id = Date.now()
    setNotifications(prev => [...prev, { ...notification, id }])
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id))
    }, 5000)
  }

  return (
    <AppContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      notifications,
      addNotification
    }}>
      {children}
    </AppContext.Provider>
  )
}

export function useApp() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useApp must be used within AppProvider')
  }
  return context
}
