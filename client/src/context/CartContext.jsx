import React, { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function useCart(){
  const ctx = useContext(CartContext)
  if(!ctx) throw new Error('useCart debe usarse dentro de CartProvider')
  return ctx
}

export function CartProvider({ children }){
  const [items, setItems] = useState([])

  // Cargar carrito desde localStorage al montar
  useEffect(()=>{
    try {
      const stored = localStorage.getItem('cart')
      if(stored) setItems(JSON.parse(stored))
    } catch(e){ console.error('Error cargando carrito:', e) }
  },[])

  // Guardar carrito en localStorage cuando cambie
  useEffect(()=>{
    try {
      localStorage.setItem('cart', JSON.stringify(items))
    } catch(e){ console.error('Error guardando carrito:', e) }
  },[items])

  const addToCart = (product, quantity = 1) => {
    setItems(prev => {
      const existing = prev.find(item => item._id === product._id)
      if(existing){
        return prev.map(item => 
          item._id === product._id 
            ? { ...item, quantity: Math.min(item.quantity + quantity, product.stock) }
            : item
        )
      }
      return [...prev, { ...product, quantity: Math.min(quantity, product.stock) }]
    })
  }

  const removeFromCart = (productId) => {
    setItems(prev => prev.filter(item => item._id !== productId))
  }

  const updateQuantity = (productId, quantity) => {
    if(quantity < 1) return removeFromCart(productId)
    setItems(prev => prev.map(item =>
      item._id === productId ? { ...item, quantity: Math.min(quantity, item.stock) } : item
    ))
  }

  const clearCart = () => {
    setItems([])
  }

  const total = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  )
}
