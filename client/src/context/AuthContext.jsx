import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  async function login(email, password){
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Error de inicio de sesión' }
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch (e){
      console.error(e)
      return { ok: false, error: 'No se pudo iniciar sesión' }
    } finally { setLoading(false) }
  }

  async function register({ username, email, password }){
    setLoading(true)
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      const data = await res.json()
      if (!res.ok) return { ok: false, error: data.error || 'Error de registro' }
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch (e){
      console.error(e)
      return { ok: false, error: 'No se pudo registrar' }
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
      else {
        // Diferenciar expiración
        if (data.code === 'TOKEN_EXPIRED') {
          // Guardar marca para que UI pueda mostrar aviso
          sessionStorage.setItem('expired', '1')
        }
        logout()
      }
    } catch {
      logout()
    }
  }

  useEffect(() => {
    // Al cargar y cuando cambie el token verificamos sesión
    if (!token) { setUser(null); setChecking(false); return }
    setChecking(true)
    fetchMe().finally(() => setChecking(false))
  }, [token])

  const value = { token, user, login, register, logout, loading, checking }
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  return useContext(AuthContext)
}
