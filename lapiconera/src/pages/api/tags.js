import { supabase } from './supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('tags')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error al obtener tags:', error)
      return res.status(500).json({ error: 'Error del servidor' })
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' })
}

export const getTags = async () => {
  const { data, error } = await supabase
    .from('tags')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}
export const crearTag = async (tag) => {
  const id = tag.name.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('tags')
    .insert([{ ...tag, id }])
    .select()
  if (error) throw error
  return data[0]
}
export const actualizarTag = async (id, tag) => {
  const { data, error } = await supabase
    .from('tags')
    .update(tag)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}
export const eliminarTag = async (id) => {
  const { data, error } = await supabase
    .from('tags')
    .delete()
    .eq('id', id)
  if (error) throw error
  return data
}
