import { supabase } from './supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error al obtener usuarios:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const { id, ban } = req.body

      if (!id) {
        return res.status(400).json({ error: 'ID de usuario requerido' })
      }

      if (ban === undefined || ban === null) {
        return res.status(400).json({ error: 'Nivel de ban requerido' })
      }

      if (![0, 1, 2].includes(ban)) {
        return res.status(400).json({ error: 'Nivel de ban inválido. Debe ser 0, 1 o 2' })
      }

      const { data, error } = await supabase
        .from('users')
        .update({ ban })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error al actualizar nivel de ban:', error)
      return res.status(500).json({ error: error.message })
    }
  }

  return res.status(405).json({ error: 'Método no permitido' })
}

export async function getUsuarios() {
  const res = await fetch('/api/usuarios')
  if (!res.ok) throw new Error('Error al obtener usuarios')
  return res.json()
}

export async function actualizarBanUsuario(id, ban) {
  const res = await fetch('/api/usuarios', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, ban })
  })
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }))
    throw new Error(errorData.error || 'Error al actualizar nivel de ban')
  }
  return res.json()
}
