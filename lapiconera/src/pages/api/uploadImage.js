import { supabase } from './supabaseClient'

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { imagen, nombre = 'producto' } = req.body

    if (!imagen) {
      return res.status(400).json({ error: 'No se envió ninguna imagen' })
    }

    // Convertir base64 a buffer
    const base64Data = imagen.replace(/^data:image\/\w+;base64,/, '')
    const buffer = Buffer.from(base64Data, 'base64')
    
    const fileName = `${nombre.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`

    // Subir a Supabase Storage bucket productsimg
    const { data, error } = await supabase.storage
      .from('productsimg')
      .upload(fileName, buffer, {
        contentType: 'image/png',
        upsert: true
      })

    if (error) {
      console.error('Error al subir a Supabase:', error)
      return res.status(500).json({ error: 'Error al subir imagen', details: error.message })
    }

    // Obtener URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('productsimg')
      .getPublicUrl(fileName)

    return res.status(200).json({ 
      success: true,
      url: publicUrl,
      fileName: fileName 
    })

  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error del servidor', details: error.message })
  }
}
