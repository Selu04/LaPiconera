import { createContext, useContext, useState, useEffect } from 'react'
import { supabase } from '../api/supabaseClient'
const UserContext = createContext()
export const UserProvider = ({ children }) => {
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    let mounted = true
    const cargarUsuario = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser()
        if (error || !user) {
          if (mounted) {
            setUsuario(null)
            setLoading(false)
          }
          return
        }
        const { data: perfil } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', user.id)
          .single()
        if (mounted) {
          setUsuario({
            id: user.id,
            email: user.email,
            name: perfil?.name || user.email,
            role: perfil?.role || 'customer'
          })
          setLoading(false)
        }
      } catch {
        if (mounted) {
          setUsuario(null)
          setLoading(false)
        }
      }
    }
    cargarUsuario()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      cargarUsuario()
    })
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])
  return (
    <UserContext.Provider value={{ usuario, loading, setUsuario }}>
      {children}
    </UserContext.Provider>
  )
}
export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser debe ser usado dentro de UserProvider')
  }
  return context
}