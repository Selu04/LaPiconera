import { supabase } from './supabaseClient'
export async function crearPedido(usuario, items) {
  try {
    const total = items.reduce((acc, item) => acc + (item.price * item.qty), 0)
    for (const item of items) {
      const { data: product, error: stockError } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.id)
        .single()
      if (stockError || !product) {
        throw new Error(`Error verificando stock del producto ${item.name}`)
      }
      if (product.stock_quantity < item.qty) {
        throw new Error(`Stock insuficiente para ${item.name}. Disponible: ${product.stock_quantity}`)
      }
    }
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert([{
        user_id: usuario.id,
        user_name: usuario.name,
        user_email: usuario.email,
        total: total,
        status: 'pending'
      }])
      .select()
      .single()
    if (orderError) {
      console.error('Error al crear pedido:', orderError)
      throw orderError
    }
    const orderItems = items.map(item => ({
      order_id: order.id,
      product_id: item.id,
      product_name: item.name,
      product_image: item.image,
      quantity: item.qty,
      unit_price: item.price,
      subtotal: item.price * item.qty
    }))
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems)
    if (itemsError) {
      console.error('Error al crear items del pedido:', itemsError)
      throw itemsError
    }
    for (const item of items) {
      const { error: updateError } = await supabase.rpc('decrement_stock', {
        product_id: item.id,
        quantity: item.qty
      })
      if (updateError) {
        console.error('Error al actualizar stock:', updateError)
      }
    }
    const { data: pedidoCompleto, error: fetchError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq('id', order.id)
      .single()
    if (!fetchError && pedidoCompleto) {
      try {
        const { enviarConfirmacionPedido } = await import('./emailService')
        await enviarConfirmacionPedido(pedidoCompleto)
        console.log('Email de confirmación enviado correctamente')
      } catch (emailError) {
        console.error('Error al enviar email de confirmación:', emailError)
      }
    }
    return { success: true, order }
  } catch (error) {
    console.error('Error al crear pedido:', error)
    throw error
  }
}
export async function obtenerPedidosUsuario(userId) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error al obtener pedidos:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error al obtener pedidos del usuario:', error)
    throw error
  }
}
export async function obtenerTodosPedidos() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .order('created_at', { ascending: false })
    if (error) {
      console.error('Error al obtener todos los pedidos:', error)
      throw error
    }
    return data
  } catch (error) {
    console.error('Error al obtener todos los pedidos:', error)
    throw error
  }
}
export async function actualizarEstadoPedido(orderId, nuevoEstado) {
  try {
    const updates = {
      status: nuevoEstado,
      updated_at: new Date().toISOString()
    }
    if (nuevoEstado === 'ready') {
      updates.ready_at = new Date().toISOString()
    }
    if (nuevoEstado === 'collected') {
      updates.collected_at = new Date().toISOString()
    }
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', orderId)
      .select(`
        *,
        order_items (
          id,
          product_name,
          product_image,
          quantity,
          unit_price,
          subtotal
        )
      `)
      .single()
    if (error) {
      console.error('Error al actualizar estado del pedido:', error)
      throw error
    }
    if (nuevoEstado === 'ready' && data) {
      try {
        const { enviarNotificacionPedidoListo } = await import('./emailService')
        await enviarNotificacionPedidoListo(data)
        console.log('Notificación por email enviada correctamente')
      } catch (emailError) {
        console.error('Error al enviar email de notificación:', emailError)
      }
    }
    return { success: true, data }
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error)
    throw error
  }
}
export async function obtenerEstadisticasPedidos() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('status')
    if (error) throw error
    const stats = {
      pending: data.filter(o => o.status === 'pending').length,
      preparing: data.filter(o => o.status === 'preparing').length,
      ready: data.filter(o => o.status === 'ready').length,
      collected: data.filter(o => o.status === 'collected').length,
      not_collected: data.filter(o => o.status === 'not_collected').length
    }
    return stats
  } catch (error) {
    console.error('Error al obtener estadísticas:', error)
    throw error
  }
}