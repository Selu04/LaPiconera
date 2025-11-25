import supabase from './supabaseClient'

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  try {
    const { barcode } = req.query

    if (!barcode) {
      return res.status(400).json({ error: 'Código de barras es obligatorio' })
    }

    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('barcode', barcode)
      .eq('is_available', true)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Producto no encontrado' })
      }
      throw error
    }

    return res.status(200).json(data)

  } catch (error) {
    console.error('Error al buscar producto por código de barras:', error)
    return res.status(500).json({ error: 'Error del servidor' })
  }
}
