import { supabase } from './supabaseClient'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return obtenerUsuarioHandler(req, res)
  } else if (req.method === 'POST') {
    const { action } = req.body
    if (action === 'register') {
      return registrarUsuarioHandler(req, res)
    } else if (action === 'login') {
      return loginUsuarioHandler(req, res)
    } else if (action === 'logout') {
      return cerrarSesionHandler(req, res)
    }
  }
  return res.status(405).json({ error: 'Método no permitido' })
}
async function obtenerUsuarioHandler(req, res) {
  try {
    const user = await obtenerUsuario()
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(200).json({ user: null })
  }
}
async function registrarUsuarioHandler(req, res) {
  try {
    const { email, password, name } = req.body
    const user = await registrarUsuario(email, password, name)
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
async function loginUsuarioHandler(req, res) {
  try {
    const { email, password } = req.body
    const user = await loginUsuario(email, password)
    return res.status(200).json({ user })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
async function cerrarSesionHandler(req, res) {
  try {
    await cerrarSesion()
    return res.status(200).json({ success: true })
  } catch (error) {
    return res.status(400).json({ error: error.message })
  }
}
export const registrarUsuario = async (email, password, name) => {
  if (!name || !name.trim()) {
    throw new Error('El nombre es requerido')
  }
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
  })
  if (error) throw error
  const user = data.user
  if (!user) throw new Error('No se pudo crear el usuario')
  const { error: insertError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      email: user.email,
      name: name.trim(),
      role: "customer",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  if (insertError) throw insertError
  return user
}
export const loginUsuario = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (error) throw error
  return data.user   
}
export const obtenerUsuario = async () => {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  const { data: perfil, error: errorPerfil } = await supabase
    .from('users')
    .select('id, email, name, role')
    .eq('id', user.id)
    .single()
  if (errorPerfil) {
    return {
      id: user.id,
      email: user.email,
      name: user.email,
      role: 'customer'
    }
  }
  return {
    id: user.id,
    email: user.email,
    name: perfil?.name || user.email, 
    role: perfil?.role || 'customer'
  }
}
export const cerrarSesion = async () => {
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return true
}