import { supabase } from './supabaseClient'

export default async function handler(req, res) {
  if (req.method === 'GET') {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      
      return res.status(200).json(data)
    } catch (error) {
      console.error('Error al obtener alérgenos:', error)
      return res.status(500).json({ error: 'Error del servidor' })
    }
  }
  
  return res.status(405).json({ error: 'Método no permitido' })
}

export const getAlergenos = async () => {
  const { data, error } = await supabase
    .from('allergens')
    .select('*')
    .order('name', { ascending: true })
  if (error) throw error
  return data
}
export const crearAlergeno = async (alergeno) => {
  const id = alergeno.name.toLowerCase().replace(/\s+/g, '_')
  const { data, error } = await supabase
    .from('allergens')
    .insert([{ ...alergeno, id }])
    .select()
  if (error) throw error
  return data[0]
}
export const actualizarAlergeno = async (id, alergeno) => {
  const { data, error } = await supabase
    .from('allergens')
    .update(alergeno)
    .eq('id', id)
    .select()
  if (error) throw error
  return data[0]
}
export const eliminarAlergeno = async (id) => {
  const { data, error } = await supabase
    .from('allergens')
    .delete()
    .eq('id', id)
  if (error) throw error
  return data
}
