import React, { createContext, useContext, useState, useEffect } from 'react'

// Auth context — minimal client-side auth state.
// Loads token/user from localStorage (if present) and keeps them in sync.
const AuthContext = createContext(null)

export const AuthProvider = ({ children }) => {
  // Try to hydrate user/token from localStorage so refreshes keep the session.
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user')
      return raw ? JSON.parse(raw) : null
    } catch (e) {
      return null
    }
  })

  const [isAuthenticated, setIsAuthenticated] = useState(() => !!localStorage.getItem('token'))

  useEffect(() => {
    // keep user object in localStorage when it changes
    if (user) {
      localStorage.setItem('user', JSON.stringify(user))
    } else {
      localStorage.removeItem('user')
    }
  }, [user])

  const login = (userData, token) => {
    // store token + user in localStorage and update state
    if (token) localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(userData))
    setUser(userData)
    setIsAuthenticated(true)
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    setIsAuthenticated(false)
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
