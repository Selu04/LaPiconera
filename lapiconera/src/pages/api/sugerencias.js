import { supabase } from './supabaseClient'
import { sendEmail } from './emailService'
export default async function handler(req, res) {
  const { method } = req
  switch (method) {
    case 'GET':
      return obtenerSugerencias(req, res)
    case 'POST':
      return crearSugerencia(req, res)
    case 'PATCH':
      return actualizarSugerencia(req, res)
    case 'DELETE':
      return eliminarSugerencia(req, res)
    default:
      res.setHeader('Allow', ['GET', 'POST', 'PATCH', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}
async function obtenerSugerencias(req, res) {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    return res.status(500).json({ error: error.message })
  }
}
async function crearSugerencia(req, res) {
  try {
    const { user_name, user_email, product_name, description, category } = req.body
    if (!user_name || !user_email || !product_name) {
      return res.status(400).json({ error: 'Nombre, email y nombre del producto son obligatorios' })
    }
    const { data, error } = await supabase
      .from('suggestions')
      .insert([
        {
          user_name,
          user_email,
          product_name,
          description: description || '',
          category: category || null,
          status: 'pending'
        }
      ])
      .select()
      .single()
    if (error) throw error
    return res.status(201).json(data)
  } catch (error) {
    console.error('Error al crear sugerencia:', error)
    return res.status(500).json({ error: error.message })
  }
}
async function actualizarSugerencia(req, res) {
  try {
    const { id, status, action, responseData } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }
    let updateData = {}
    if (action === 'toggle_like') {
      const { data: currentData, error: fetchError } = await supabase
        .from('suggestions')
        .select('liked')
        .eq('id', id)
        .single()
      if (fetchError) {
        console.error('Error al obtener sugerencia:', fetchError)
        return res.status(500).json({ error: 'Error al obtener sugerencia: ' + fetchError.message })
      }
      updateData = { liked: !currentData?.liked }
    } else if (action === 'toggle_archived') {
      const { data: currentData, error: fetchError } = await supabase
        .from('suggestions')
        .select('archived')
        .eq('id', id)
        .single()
      if (fetchError) {
        console.error('Error al obtener sugerencia:', fetchError)
        return res.status(500).json({ error: 'Error al obtener sugerencia: ' + fetchError.message })
      }
      updateData = { archived: !currentData?.archived, updated_at: new Date().toISOString() }
    } else if (action === 'respond') {
      if (!responseData || !responseData.subject || !responseData.message) {
        return res.status(400).json({ error: 'Subject y mensaje son obligatorios para responder' })
      }
      updateData = { 
        responded: true,
        response_date: new Date().toISOString(),
        response_subject: responseData.subject,
        response_message: responseData.message,
        updated_at: new Date().toISOString()
      }
    } else if (status) {
      if (!['pending', 'reviewed', 'approved', 'rejected'].includes(status)) {
        return res.status(400).json({ error: 'Estado no válido' })
      }
      updateData = { status, updated_at: new Date().toISOString() }
    } else {
      return res.status(400).json({ error: 'Acción no válida: debe proporcionar status o action' })
    }
    const { data, error } = await supabase
      .from('suggestions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    if (error) {
      console.error('Error al actualizar en BD:', error)
      throw new Error('Error de base de datos: ' + error.message)
    }
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error al actualizar sugerencia:', error)
    return res.status(500).json({ error: error.message })
  }
}
async function eliminarSugerencia(req, res) {
  try {
    const { id } = req.body
    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }
    const { error } = await supabase
      .from('suggestions')
      .delete()
      .eq('id', id)
    if (error) throw error
    return res.status(200).json({ message: 'Sugerencia eliminada correctamente' })
  } catch (error) {
    console.error('Error al eliminar sugerencia:', error)
    return res.status(500).json({ error: error.message })
  }
}
