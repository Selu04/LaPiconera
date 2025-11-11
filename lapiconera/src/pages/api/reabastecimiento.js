import { createClient } from '@supabase/supabase-js'
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return obtenerPedidosReabastecimiento(req, res)
  } else if (req.method === 'POST') {
    return crearPedidoReabastecimiento(req, res)
  } else if (req.method === 'PUT') {
    return marcarComoReabastecido(req, res)
  } else {
    return res.status(405).json({ error: 'Método no permitido' })
  }
}
async function obtenerPedidosReabastecimiento(req, res) {
  try {
    const { data: pedidos, error } = await supabase
      .from('restocking_orders')
      .select('*')
      .order('created_at', { ascending: false })
    if (error) throw error
    return res.status(200).json(pedidos)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error al obtener pedidos' })
  }
}
async function crearPedidoReabastecimiento(req, res) {
  try {
    const { items, user_id, user_name } = req.body
    const { data: pedido, error } = await supabase
      .from('restocking_orders')
      .insert({
        user_id,
        user_name,
        items,
        status: 'pending'
      })
      .select()
      .single()
    if (error) throw error
    return res.status(200).json(pedido)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error al crear pedido' })
  }
}
async function marcarComoReabastecido(req, res) {
  try {
    const { id, items } = req.body
    for (const item of items) {
      const { error: stockError } = await supabase.rpc('increment_stock', {
        product_id: item.id,
        quantity: item.cantidad
      })
      if (stockError) {
        console.error('Error al incrementar stock:', stockError)
        throw stockError
      }
    }
    const { data: pedido, error } = await supabase
      .from('restocking_orders')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return res.status(200).json(pedido)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error al actualizar' })
  }
}