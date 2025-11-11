import { supabase } from './supabaseClient'
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