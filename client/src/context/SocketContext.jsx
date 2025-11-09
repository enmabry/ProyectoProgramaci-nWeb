import React, { createContext, useContext, useEffect, useState, useRef } from 'react'
import { io } from 'socket.io-client'
import { useAuth } from './AuthContext'

const SocketContext = createContext(null)

export function useSocket() {
  const ctx = useContext(SocketContext)
  if (!ctx) throw new Error('useSocket debe usarse dentro de SocketProvider')
  return ctx
}

export function SocketProvider({ children }) {
  const { token, user } = useAuth()
  const [socket, setSocket] = useState(null)
  const [connected, setConnected] = useState(false)
  const socketRef = useRef(null)

  useEffect(() => {
    // Solo conectar si hay token y usuario
    if (!token || !user) {
      if (socketRef.current) {
        socketRef.current.disconnect()
        socketRef.current = null
        setSocket(null)
        setConnected(false)
      }
      return
    }

    // Conectar al socket con el token
    const newSocket = io('http://localhost:3000', {
      auth: { token }
    })

    newSocket.on('connect', () => {
      console.log('Socket conectado')
      setConnected(true)
    })

    newSocket.on('disconnect', () => {
      console.log('Socket desconectado')
      setConnected(false)
    })

    newSocket.on('connect_error', (err) => {
      console.error('Error de conexión socket:', err.message)
      setConnected(false)
    })

    socketRef.current = newSocket
    setSocket(newSocket)

    return () => {
      newSocket.disconnect()
    }
  }, [token, user])

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  )
}
