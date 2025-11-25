import { createContext, useContext, useState } from 'react'
import { supabase } from '../pages/api/supabaseClient'
const CartContext = createContext()
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const addToCart = async (producto, showError = null) => {
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', producto.id)
      .single()
    if (error) {
      if (showError) showError('Error comprobando stock')
      else console.error('Error comprobando stock')
      return
    }
    if (!data || data.stock_quantity <= 0) {
      if (showError) showError('Producto sin stock disponible')
      else console.error('Producto sin stock disponible')
      return
    }
    setItems(prev => {
      const existente = prev.find(item => item.id === producto.id)
      if (existente) {
        if (existente.qty < data.stock_quantity) {
          return prev.map(item =>
            item.id === producto.id
              ? { ...item, qty: item.qty + 1 }
              : item
          )
        } else {
          if (showError) showError('No hay más stock disponible de este producto')
          else console.error('No hay más stock disponible')
          return prev
        }
      }
      return [...prev, { 
        id: producto.id, 
        name: producto.name, 
        price: Number(producto.price), 
        qty: 1,
        image: producto.image,
        alergenos: producto.allergens || []
      }]
    })
  }
  const updateQty = (id, qty) => {
    setItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, qty: Math.max(1, qty) } : item
      )
    )
  }
  const increment = async (id, showError = null) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single()
    if (error) {
      if (showError) showError('Error comprobando stock')
      else console.error('Error comprobando stock')
      return
    }
    if (item.qty >= (data?.stock_quantity || 0)) {
      if (showError) showError('Sin más stock disponible')
      else console.error('Sin más stock disponible')
      return
    }
    updateQty(id, item.qty + 1)
  }
  const decrement = (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    updateQty(id, item.qty - 1)
  }
  const removeFromCart = (id) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }
  const clearCart = () => setItems([])
  return (
    <CartContext.Provider value={{ items, addToCart, updateQty, increment, decrement, removeFromCart, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}
export const useCart = () => useContext(CartContext)
