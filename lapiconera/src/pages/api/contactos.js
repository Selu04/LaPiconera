import { supabase } from './supabaseClient'
import { sendEmail } from './emailService'

export default async function handler(req, res) {
  const { method } = req

  switch (method) {
    case 'GET':
      return obtenerContactos(req, res)
    case 'PATCH':
      return actualizarContacto(req, res)
    case 'DELETE':
      return eliminarContacto(req, res)
    default:
      res.setHeader('Allow', ['GET', 'PATCH', 'DELETE'])
      return res.status(405).end(`Method ${method} Not Allowed`)
  }
}

async function obtenerContactos(req, res) {
  try {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error al obtener contactos:', error)
    return res.status(500).json({ error: error.message })
  }
}

async function actualizarContacto(req, res) {
  try {
    const { id, leido, action, responseData } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }

    let updateData = {}

    if (action === 'toggle_like') {
      const { data: currentData } = await supabase
        .from('contacts')
        .select('liked')
        .eq('id', id)
        .single()
      
      updateData = { liked: !currentData?.liked }
    } else if (action === 'respond') {
      if (!responseData || !responseData.subject || !responseData.message) {
        return res.status(400).json({ error: 'Subject y mensaje son obligatorios para responder' })
      }

      updateData = { 
        responded: true,
        response_date: new Date().toISOString(),
        response_subject: responseData.subject,
        response_message: responseData.message,
        leido: true 
      }
      
      console.log('Respuesta guardada (email no enviado - configurar Nodemailer):', {
        to: responseData.recipientEmail,
        subject: responseData.subject
      })
    } else if (leido !== undefined) {
      updateData = { leido }
    } else {
      return res.status(400).json({ error: 'Acción no válida' })
    }

    const { data, error } = await supabase
      .from('contacts')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return res.status(200).json(data)
  } catch (error) {
    console.error('Error al actualizar contacto:', error)
    return res.status(500).json({ error: error.message })
  }
}

async function eliminarContacto(req, res) {
  try {
    const { id } = req.body

    if (!id) {
      return res.status(400).json({ error: 'ID es obligatorio' })
    }

    const { error } = await supabase
      .from('contacts')
      .delete()
      .eq('id', id)

    if (error) throw error

    return res.status(200).json({ message: 'Contacto eliminado correctamente' })
  } catch (error) {
    console.error('Error al eliminar contacto:', error)
    return res.status(500).json({ error: error.message })
  }
}
