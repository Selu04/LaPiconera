import { supabase } from './supabaseClient'
export async function enviarContacto(datos) {
  try {
    const { nombre, email, asunto, mensaje } = datos
    console.log('Datos de contacto recibidos:', datos)
    const { data, error } = await supabase
      .from('contacts')
      .insert([
        {
          nombre,
          email,
          asunto,
          mensaje,
          leido: false
        }
      ])
      .select()
    if (error) {
      console.error('Error al insertar contacto:', error)
      throw error
    }
    return { success: true, message: 'Mensaje enviado correctamente', data }
  } catch (error) {
    console.error('Error al enviar contacto:', error)
    throw error
  }
}
export async function enviarSugerencia(datos) {
  try {
    const { user_name, user_email, product_name, description, category } = datos
    const { data, error } = await supabase
      .from('suggestions')
      .insert([
        {
          user_name,
          user_email,
          product_name,
          description,
          category: category || null,
          status: 'pending'
        }
      ])
      .select()
    if (error) {
      console.error('Error al insertar sugerencia:', error)
      throw error
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error al enviar sugerencia:', error)
    throw error
  }
}
export async function obtenerSugerencias(filtros = {}) {
  try {
    let query = supabase
      .from('suggestions')
      .select('*')
      .order('created_at', { ascending: false })
    if (filtros.status) {
      query = query.eq('status', filtros.status)
    }
    if (filtros.priority) {
      query = query.eq('priority', filtros.priority)
    }
    const { data, error } = await query
    if (error) {
      console.error('Error al obtener sugerencias:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error al obtener sugerencias:', error)
    throw error
  }
}
export async function actualizarSugerencia(id, cambios) {
  try {
    const { data, error } = await supabase
      .from('suggestions')
      .update({
        ...cambios,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    if (error) {
      console.error('Error al actualizar sugerencia:', error)
      throw error
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error al actualizar sugerencia:', error)
    throw error
  }
}