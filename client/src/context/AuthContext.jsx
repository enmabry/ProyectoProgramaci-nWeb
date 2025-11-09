import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)

  async function login(email, password){
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Error login')
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return true
    } catch (e){
      console.error(e)
      return false
    } finally { setLoading(false) }
  }

  function logout(){
    setToken('')
    setUser(null)
    localStorage.removeItem('token')
  }

  async function fetchMe(){
    if (!token) return
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) setUser(data.user)
      else logout()
    } catch { logout() }
  }

  useEffect(() => { fetchMe() }, [token])

  const value = { token, user, login, logout, loading }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  return useContext(AuthContext)
}
