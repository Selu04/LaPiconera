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
    // Si viene status, es marcar como reabastecido
    // Si solo vienen items, es actualizar cantidades
    if (req.body.status) {
      return marcarComoReabastecido(req, res)
    } else {
      return actualizarCantidadesPedido(req, res)
    }
  } else if (req.method === 'PATCH') {
    return actualizarCantidadesPedido(req, res)
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
async function actualizarCantidadesPedido(req, res) {
  try {
    const { id, items } = req.body

    if (!id || !items) {
      console.error('Datos incompletos:', { id, items })
      return res.status(400).json({ error: 'ID y items son requeridos' })
    }

    if (!Array.isArray(items)) {
      console.error('Items no es un array:', items)
      return res.status(400).json({ error: 'Items debe ser un array' })
    }

    // Si no hay items, eliminar el pedido directamente
    if (items.length === 0) {
      console.log('No hay items, eliminando pedido:', id)
      const { error: deleteError } = await supabase
        .from('restocking_orders')
        .delete()
        .eq('id', id)
        .eq('status', 'pending')

      if (deleteError) {
        console.error('Error al eliminar pedido vacío:', deleteError)
        return res.status(500).json({ error: 'Error al eliminar pedido vacío' })
      }

      console.log('Pedido eliminado exitosamente')
      return res.status(200).json({ deleted: true, message: 'Pedido eliminado porque no tenía productos' })
    }

    // Verificar que los items tengan la estructura correcta
    const itemsValidos = items.every(item => item.id && item.nombre && item.cantidad >= 0)
    if (!itemsValidos) {
      console.error('Items con estructura incorrecta:', items)
      return res.status(400).json({ error: 'Items tienen estructura incorrecta. Cada item debe tener: id, nombre, cantidad' })
    }

    console.log('Actualizando pedido:', id, 'con items:', items)

    const { data: pedido, error } = await supabase
      .from('restocking_orders')
      .update({ 
        items
      })
      .eq('id', id)
      .eq('status', 'pending')
      .select()
      .single()

    if (error) {
      console.error('Error de Supabase al actualizar cantidades:', error)
      return res.status(500).json({ error: error.message || 'Error al actualizar cantidades en la base de datos' })
    }

    if (!pedido) {
      console.error('Pedido no encontrado o no está pendiente:', id)
      return res.status(404).json({ error: 'Pedido no encontrado o no está pendiente' })
    }

    console.log('Pedido actualizado exitosamente:', pedido)
    return res.status(200).json(pedido)
  } catch (error) {
    console.error('Error general al actualizar cantidades:', error)
    return res.status(500).json({ error: error.message || 'Error al actualizar cantidades' })
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
