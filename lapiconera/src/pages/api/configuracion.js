import { supabase } from './supabaseClient'
export const getConfiguracion = async () => {
  const { data, error } = await supabase
    .from('configuracion')
    .select('*')
    .single()
  if (error) {
    if (error.code === 'PGRST116') {
      return {
        telefono: '602374987',
        email: 'lapiconera@gmail.com',
        horario_lunes_viernes: '8:00 - 17:00',
        horario_sabados: '9:00 - 14:00',
        horario_festivos: '9:00 - 15:00'
      }
    }
    throw error
  }
  return data
}
export const updateConfiguracion = async (config) => {
  const { data: existing } = await supabase
    .from('configuracion')
    .select('id')
    .single()
  if (existing) {
    const { data, error } = await supabase
      .from('configuracion')
      .update({
        telefono: config.telefono,
        email: config.email,
        horario_lunes_viernes: config.horario_lunes_viernes,
        horario_sabados: config.horario_sabados,
        horario_festivos: config.horario_festivos,
        updated_at: new Date().toISOString()
      })
      .eq('id', existing.id)
      .select()
      .single()
    if (error) throw error
    return data
  } else {
    const { data, error } = await supabase
      .from('configuracion')
      .insert({
        telefono: config.telefono,
        email: config.email,
        horario_lunes_viernes: config.horario_lunes_viernes,
        horario_sabados: config.horario_sabados,
        horario_festivos: config.horario_festivos,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()
    if (error) throw error
    return data
  }
}