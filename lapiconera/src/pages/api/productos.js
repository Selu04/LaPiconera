import { supabase } from './supabaseClient'
export default async function handler(req, res) {
  if (req.method === 'GET') {
    return getProductosHandler(req, res)
  } else if (req.method === 'PUT') {
    return actualizarStockHandler(req, res)
  } else {
    return res.status(405).json({ error: 'Método no permitido' })
  }
}
async function getProductosHandler(req, res) {
  try {
    const { categoria, alergenos, tags, search, minPrice, maxPrice, todos } = req.query
    let query = supabase.from('products').select('*')
    if (todos !== 'true') {
      query = query.eq('is_available', true)
    }
    if (categoria) {
      query = query.eq('category', categoria)
    }
    if (tags) {
      const tagsArray = tags.split(',')
      query = query.contains('tags', tagsArray)
    }
    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
    }
    if (minPrice) query = query.gte('price', parseFloat(minPrice))
    if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
    const { data, error } = await query
    if (error) throw error
    let productosFilteredByAllergens = data
    if (alergenos) {
      const alergenosArray = alergenos.split(',').map(a => a.trim())
      productosFilteredByAllergens = data.filter(producto => {
        if (!producto.allergens || producto.allergens.length === 0) {
          return true
        }
        return !producto.allergens.some(alergeno => 
          alergenosArray.includes(alergeno)
        )
      })
    }
    return res.status(200).json(productosFilteredByAllergens)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error al obtener productos' })
  }
}
async function actualizarStockHandler(req, res) {
  try {
    const { id, stockChange } = req.body
    const { data: producto, error: fetchError } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', id)
      .single()
    if (fetchError) throw fetchError
    const nuevoStock = Math.max(0, (producto.stock_quantity || 0) + stockChange)
    const { data, error } = await supabase
      .from('products')
      .update({ 
        stock_quantity: nuevoStock,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ error: 'Error al actualizar stock' })
  }
}
export const getProductos = async ({
  categoria,
  alergenos,
  tags,
  search,
  minPrice,
  maxPrice
} = {}) => {
  let query = supabase.from('products').select('*').eq('is_available', true)
  if (categoria) {
    query = query.eq('category', categoria)
  }
  if (tags?.length) {
    query = query.contains('tags', tags) 
  }
  if (search) {
    query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`)
  }
  if (minPrice) query = query.gte('price', parseFloat(minPrice))
  if (maxPrice) query = query.lte('price', parseFloat(maxPrice))
  const { data, error } = await query
  if (error) throw error
  let productosFilteredByAllergens = data
  if (alergenos?.length) {
    productosFilteredByAllergens = data.filter(producto => {
      if (!producto.allergens || producto.allergens.length === 0) {
        return true
      }
      return !producto.allergens.some(alergeno => 
        alergenos.includes(alergeno)
      )
    })
  }
  return productosFilteredByAllergens
}
export const getTodosProductos = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) {
    console.error('Error al obtener todos los productos:', error)
    throw error
  }
  return data
}
export const crearProducto = async (producto) => {
  const datosProducto = {
    name: producto.name,
    description: producto.description,
    price: producto.price,
    image: producto.image,
    allergens: producto.allergens,
    tags: producto.tags,
    stock_quantity: producto.stock_quantity || 0,
    min_stock: producto.min_stock || 0,
    is_available: producto.is_available !== undefined ? producto.is_available : true
  }
  if (producto.category && producto.category.trim() !== '') {
    datosProducto.category = producto.category
  }
  const { data, error } = await supabase
    .from('products')
    .insert([datosProducto])
    .select()
    .single()
  if (error) {
    console.error('Error crear producto:', error)
    throw error
  }
  return data
}
export const actualizarProducto = async (id, producto) => {
  const datosProducto = {}
  if (producto.name !== undefined) datosProducto.name = producto.name
  if (producto.description !== undefined) datosProducto.description = producto.description
  if (producto.price !== undefined) datosProducto.price = producto.price
  if (producto.image !== undefined) datosProducto.image = producto.image
  if (producto.allergens !== undefined) datosProducto.allergens = producto.allergens
  if (producto.tags !== undefined) datosProducto.tags = producto.tags
  if (producto.min_stock !== undefined) datosProducto.min_stock = producto.min_stock || 0
  if (producto.stock_quantity !== undefined) datosProducto.stock_quantity = producto.stock_quantity
  if (producto.is_available !== undefined) datosProducto.is_available = producto.is_available
  if (producto.category !== undefined && producto.category.trim() !== '') {
    datosProducto.category = producto.category
  }
  const { data, error } = await supabase
    .from('products')
    .update(datosProducto)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    console.error('Error actualizar producto:', error)
    throw error
  }
  return data
}
export const eliminarProducto = async (id) => {
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id)
  if (error) throw error
  return true
}