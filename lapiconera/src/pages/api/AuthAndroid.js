import { supabase } from './supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({ 
        token: null,
        trabajador: false,
        id: null,
        error: 'Email y contraseña son obligatorios' 
      })
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    })

    if (authError) {
      return res.status(401).json({ 
        token: null,
        trabajador: false,
        id: null,
        error: 'Credenciales incorrectas' 
      })
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('id, role, is_active')
      .eq('id', authData.user.id)
      .single()

    if (userError || !userData) {
      return res.status(404).json({ 
        token: null,
        trabajador: false,
        id: null,
        error: 'Usuario no encontrado' 
      })
    }

    if (!userData.is_active) {
      return res.status(403).json({ 
        token: null,
        trabajador: false,
        id: null,
        error: 'Usuario inactivo' 
      })
    }

    const esTrabajador = userData.role === 'employee' || userData.role === 'admin'

    return res.status(200).json({
      token: authData.session.access_token,
      trabajador: esTrabajador,
      id: authData.user.id
    })

  } catch (error) {
    console.error('Error en login Android:', error)
    return res.status(500).json({ 
      token: null,
      trabajador: false,
      id: null,
      error: 'Error del servidor' 
    })
  }
}
