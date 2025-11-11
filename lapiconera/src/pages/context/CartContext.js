import { createContext, useContext, useState } from 'react'
import { supabase } from '../api/supabaseClient'
const CartContext = createContext()
export const CartProvider = ({ children }) => {
  const [items, setItems] = useState([])
  const addToCart = async (producto) => {
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', producto.id)
      .single()
    if (error) {
      alert('Error comprobando stock')
      return
    }
    if (!data || data.stock_quantity <= 0) {
      alert('Producto sin stock disponible')
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
          alert('No hay más stock disponible de este producto')
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
  const increment = async (id) => {
    const item = items.find(i => i.id === id)
    if (!item) return
    const { data, error } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single()
    if (error) return alert('Error comprobando stock')
    if (item.qty >= (data?.stock_quantity || 0)) return alert('Sin más stock disponible')
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