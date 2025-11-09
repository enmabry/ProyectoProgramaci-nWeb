import React, { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('token') || '')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  // Helper para fetch con timeout y manejo de abort
  async function fetchJSON(url, options = {}, timeoutMs = 15000) {
    const controller = new AbortController()
    const id = setTimeout(() => controller.abort(), timeoutMs)
    try {
      const res = await fetch(url, { ...options, signal: controller.signal })
      const contentType = res.headers.get('content-type') || ''
      let data = null
      if (contentType.includes('application/json')) {
        data = await res.json()
      } else {
        data = { raw: await res.text() }
      }
      return { res, data }
    } finally {
      clearTimeout(id)
    }
  }

  async function login(email, password){
    setLoading(true)
    try {
      const { res, data } = await fetchJSON('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      if (!res.ok) {
        // Mostrar código de bloqueo (423) o rate limit (429) si aplica
        if (res.status === 423 && data?.code === 'ACCOUNT_LOCKED') {
          return { ok: false, error: `Cuenta bloqueada. Intenta en ${data.minutes} min` }
        }
        if (res.status === 429 || data?.code === 'RATE_LIMIT') {
          return { ok: false, error: data.error || 'Demasiados intentos, espera' }
        }
        return { ok: false, error: data?.error || 'Credenciales inválidas' }
      }
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch (e){
      if (e.name === 'AbortError') {
        return { ok: false, error: 'Servidor no responde (timeout)' }
      }
      console.error('Login error:', e)
      return { ok: false, error: 'No se pudo iniciar sesión' }
    } finally { setLoading(false) }
  }

  async function register({ username, email, password }){
    setLoading(true)
    try {
      const { res, data } = await fetchJSON('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password })
      })
      if (!res.ok) {
        if (res.status === 429 || data?.code === 'RATE_LIMIT') {
          return { ok: false, error: data.error || 'Demasiados intentos, espera' }
        }
        return { ok: false, error: data?.error || 'Error de registro' }
      }
      setToken(data.token)
      localStorage.setItem('token', data.token)
      setUser(data.user)
      return { ok: true, user: data.user }
    } catch (e){
      if (e.name === 'AbortError') {
        return { ok: false, error: 'Servidor no responde (timeout)' }
      }
      console.error('Register error:', e)
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
      const { res, data } = await fetchJSON('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      }, 8000)
      if (res.ok) {
        setUser(data.user)
      } else {
        if (data?.code === 'TOKEN_EXPIRED') {
          sessionStorage.setItem('expired', '1')
        }
        logout()
      }
    } catch (e) {
      if (e.name === 'AbortError') {
        console.warn('fetchMe timeout')
      }
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
