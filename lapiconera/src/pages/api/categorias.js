import { supabase } from './supabaseClient'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const categorias = await getCategorias()
      res.status(200).json(categorias)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Error al obtener categorías' })
    }
  } else if (req.method === 'POST') {
    try {
      const categoria = await crearCategoria(req.body)
      res.status(201).json(categoria)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Error al crear categoría' })
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, ...datos } = req.body
      const categoria = await actualizarCategoria(id, datos)
      res.status(200).json(categoria)
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Error al actualizar categoría' })
    }
  } else if (req.method === 'DELETE') {
    try {
      const { id } = req.body
      await eliminarCategoria(id)
      res.status(200).json({ success: true })
    } catch (error) {
      console.error('Error:', error)
      res.status(500).json({ error: 'Error al eliminar categoría' })
    }
  } else {
    res.status(405).json({ error: 'Método no permitido' })
  }
}
export const getCategorias = async () => {
  const { data, error } = await supabase.from('categories').select('*')
  if (error) throw error
  return data
}
export const crearCategoria = async (categoria) => {
  const { data, error } = await supabase
    .from('categories')
    .insert([categoria])
    .select()
    .single()
  if (error) {
    console.error('Error crear categoría:', error)
    throw error
  }
  return data
}
export const actualizarCategoria = async (id, categoria) => {
  const { data, error } = await supabase
    .from('categories')
    .update(categoria)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('Error actualizar categoría:', error)
    throw error
  }
  return data
}
export const eliminarCategoria = async (id) => {
  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
  if (error) {
    console.error('Error eliminar categoría:', error)
    throw error
  }
  return true
}