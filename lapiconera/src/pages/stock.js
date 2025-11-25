import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useRouter } from 'next/router'
import { useNotification } from '../context/NotificationContext'
import { supabase } from './api/supabaseClient'
export default function Stock() {
  const router = useRouter()
  const { showSuccess, showError, showWarning, showConfirm } = useNotification()
  const [usuario, setUsuario] = useState(null)
  const [loading, setLoading] = useState(true)
  const [productos, setProductos] = useState([])
  const [categorias, setCategorias] = useState([])
  const [pedidoReabastecimiento, setPedidoReabastecimiento] = useState([])
  const [pedidosReabastecimiento, setPedidosReabastecimiento] = useState([])
  const [busqueda, setBusqueda] = useState('')
  const [filtroStock, setFiltroStock] = useState('todos')
  const [filtroCategoria, setFiltroCategoria] = useState('todas')
  const [vistaActual, setVistaActual] = useState('productos')
  const [actualizando, setActualizando] = useState(null)
  const [filtroEstadoReabastecimiento, setFiltroEstadoReabastecimiento] = useState('todos')
  const [filtroFechaReabastecimiento, setFiltroFechaReabastecimiento] = useState('')
  const [busquedaReabastecimiento, setBusquedaReabastecimiento] = useState('')
  useEffect(() => {
    verificarAutenticacion()
  }, [])
  const verificarAutenticacion = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      if (error || !user) {
        router.push('/login')
        return
      }
      const { data: perfil } = await supabase
        .from('users')
        .select('id, email, name, role')
        .eq('id', user.id)
        .single()
      const userData = {
        id: user.id,
        email: user.email,
        name: perfil?.name || user.email,
        role: perfil?.role || 'customer'
      }
      if (userData.role !== 'employee' && userData.role !== 'admin') {
        router.push('/login')
        return
      }
      setUsuario(userData)
      await cargarProductos()
      await cargarCategorias()
      await cargarPedidosReabastecimiento()
    } catch (error) {
      console.error('Error:', error)
      router.push('/login')
    } finally {
      setLoading(false)
    }
  }
  const cargarProductos = async () => {
    try {
      const res = await fetch('/api/productos?todos=true')
      const data = await res.json()
      setProductos(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error al cargar productos:', error)
      setProductos([])
    }
  }
  const cargarCategorias = async () => {
    try {
      const res = await fetch('/api/categorias')
      const data = await res.json()
      setCategorias(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setCategorias([])
    }
  }
  const cargarPedidosReabastecimiento = async () => {
    try {
      const res = await fetch('/api/reabastecimiento')
      const data = await res.json()
      setPedidosReabastecimiento(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error al cargar pedidos de reabastecimiento:', error)
      setPedidosReabastecimiento([])
    }
  }
  const actualizarStock = async (productoId, cantidad) => {
    setActualizando(productoId)
    try {
      const res = await fetch('/api/productos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: productoId, stockChange: cantidad })
      })
      if (res.ok) {
        const productoActualizado = await res.json()
        setProductos(prevProductos => 
          prevProductos.map(p => 
            p.id === productoId ? productoActualizado : p
          )
        )
      } else {
        showError('Error al actualizar el stock')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Error al actualizar el stock')
    } finally {
      setActualizando(null)
    }
  }
  const añadirAPedidoReabastecimiento = (producto, cantidad) => {
    const itemExistente = pedidoReabastecimiento.find(item => item.id === producto.id)
    if (itemExistente) {
      setPedidoReabastecimiento(
        pedidoReabastecimiento.map(item =>
          item.id === producto.id
            ? { ...item, cantidad: item.cantidad + cantidad }
            : item
        )
      )
    } else {
      setPedidoReabastecimiento([
        ...pedidoReabastecimiento,
        {
          id: producto.id,
          nombre: producto.name,
          imagen: producto.image,
          cantidad: cantidad
        }
      ])
    }
  }
  const actualizarCantidadPedido = (productoId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      setPedidoReabastecimiento(pedidoReabastecimiento.filter(item => item.id !== productoId))
    } else {
      setPedidoReabastecimiento(
        pedidoReabastecimiento.map(item =>
          item.id === productoId ? { ...item, cantidad: nuevaCantidad } : item
        )
      )
    }
  }
  const eliminarDePedido = (productoId) => {
    setPedidoReabastecimiento(pedidoReabastecimiento.filter(item => item.id !== productoId))
  }
  const finalizarPedidoReabastecimiento = async () => {
    if (pedidoReabastecimiento.length === 0) {
      showWarning('El pedido está vacío')
      return
    }
    try {
      const res = await fetch('/api/reabastecimiento', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: pedidoReabastecimiento,
          user_id: usuario.id,
          user_name: usuario.name
        })
      })
      if (res.ok) {
        showSuccess('Pedido de reabastecimiento creado correctamente')
        setPedidoReabastecimiento([])
        await cargarPedidosReabastecimiento()
      } else {
        showError('Error al crear el pedido')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Error al crear el pedido')
    }
  }
  const marcarComoReabastecido = async (pedidoId, items) => {
    const confirmed = await showConfirm({
      title: 'Confirmar Reabastecimiento',
      message: '¿Confirmar que se ha recibido y añadido el stock de este pedido?',
      confirmText: 'Confirmar',
      cancelText: 'Cancelar',
      type: 'warning'
    })
    if (!confirmed) return
    try {
      const res = await fetch('/api/reabastecimiento', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: pedidoId, items })
      })
      if (res.ok) {
        showSuccess('Stock actualizado correctamente')
        await cargarPedidosReabastecimiento()
        await cargarProductos()
      } else {
        showError('Error al actualizar el stock')
      }
    } catch (error) {
      console.error('Error:', error)
      showError('Error al actualizar el stock')
    }
  }
  const productosFiltrados = productos.filter(producto => {
    const coincideBusqueda = busqueda === '' ||
      producto.name.toLowerCase().includes(busqueda.toLowerCase())
    const coincideCategoria = filtroCategoria === 'todas' ||
      producto.category === filtroCategoria
    let coincideStock = true
    if (filtroStock === 'bajo') {
      const threshold = producto.min_stock || 10
      coincideStock = (producto.stock_quantity || 0) <= threshold
    } else if (filtroStock === 'agotado') {
      coincideStock = (producto.stock_quantity || 0) === 0
    }
    return coincideBusqueda && coincideCategoria && coincideStock
  })
  const pedidosReabastecimientoFiltrados = pedidosReabastecimiento.filter(pedido => {
    const coincideBusqueda = busquedaReabastecimiento === '' ||
      pedido.user_name.toLowerCase().includes(busquedaReabastecimiento.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busquedaReabastecimiento.toLowerCase()) ||
      pedido.items.some(item => item.nombre.toLowerCase().includes(busquedaReabastecimiento.toLowerCase()))
    const coincideEstado = filtroEstadoReabastecimiento === 'todos' || 
      pedido.status === filtroEstadoReabastecimiento
    let coincideFecha = true
    if (filtroFechaReabastecimiento) {
      const fechaPedido = new Date(pedido.created_at).toISOString().split('T')[0]
      coincideFecha = fechaPedido === filtroFechaReabastecimiento
    }
    return coincideBusqueda && coincideEstado && coincideFecha
  })
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Cargando...</p>
        </div>
      </>
    )
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Gestión de Stock
            </h1>
            <p className="text-gray-600">Administra el inventario de productos</p>
          </div>
          <div className="mb-6 flex gap-4">
            <button
              onClick={() => setVistaActual('productos')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                vistaActual === 'productos'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Stock de Productos
            </button>
            <button
              onClick={() => setVistaActual('pedidos')}
              className={`flex-1 px-6 py-3 rounded-lg font-semibold transition relative flex items-center justify-center gap-2 ${
                vistaActual === 'pedidos'
                  ? 'bg-[#3B82F6] text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              Pedidos de Reabastecimiento
              {pedidosReabastecimiento.filter(p => p.status === 'pending').length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {pedidosReabastecimiento.filter(p => p.status === 'pending').length}
                </span>
              )}
            </button>
          </div>
          {vistaActual === 'productos' ? (
            <>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar producto..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <select
                      value={filtroCategoria}
                      onChange={(e) => setFiltroCategoria(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                    >
                      <option value="todas">Todas las categorías</option>
                      {categorias.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <select
                      value={filtroStock}
                      onChange={(e) => setFiltroStock(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                    >
                      <option value="todos">Todos</option>
                      <option value="bajo">Stock Bajo</option>
                      <option value="agotado">Agotados</option>
                    </select>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {productosFiltrados.map(producto => (
                  <ProductoStockCard
                    key={producto.id}
                    producto={producto}
                    actualizarStock={actualizarStock}
                    añadirAPedido={añadirAPedidoReabastecimiento}
                    actualizando={actualizando === producto.id}
                    showWarning={showWarning}
                  />
                ))}
              </div>
              {pedidoReabastecimiento.length > 0 && (
                <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-md w-full border-2 border-[#3B82F6]">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      Pedido de Reabastecimiento
                    </h3>
                    <button
                      onClick={() => setPedidoReabastecimiento([])}
                      className="text-red-500 hover:text-red-700 font-bold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto mb-3 space-y-2">
                    {pedidoReabastecimiento.map(item => (
                      <div key={item.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                        <img src={item.imagen} alt={item.nombre} className="w-12 h-12 object-cover rounded" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-gray-900">{item.nombre}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <button
                              onClick={() => actualizarCantidadPedido(item.id, item.cantidad - 1)}
                              className="w-6 h-6 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.cantidad}
                              onChange={(e) => actualizarCantidadPedido(item.id, parseInt(e.target.value) || 0)}
                              className="w-16 text-center border border-gray-300 rounded py-1 text-gray-900"
                            />
                            <button
                              onClick={() => actualizarCantidadPedido(item.id, item.cantidad + 1)}
                              className="w-6 h-6 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center"
                            >
                              +
                            </button>
                          </div>
                        </div>
                        <button
                          onClick={() => eliminarDePedido(item.id)}
                          className="text-red-500 hover:text-red-700 font-bold"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={finalizarPedidoReabastecimiento}
                    className="w-full bg-[#3B82F6] text-white py-2 rounded-lg font-semibold hover:bg-[#2563EB] transition"
                  >
                    Finalizar Pedido ({pedidoReabastecimiento.length} productos)
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Pedidos</p>
                      <p className="text-3xl font-bold">{pedidosReabastecimiento.length}</p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Pendientes</p>
                      <p className="text-3xl font-bold">
                        {pedidosReabastecimiento.filter(p => p.status === 'pending').length}
                      </p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg shadow-md p-6 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Completados</p>
                      <p className="text-3xl font-bold">
                        {pedidosReabastecimiento.filter(p => p.status === 'completed').length}
                      </p>
                    </div>
                    <svg className="w-12 h-12 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Buscar por usuario, ID o producto..."
                      value={busquedaReabastecimiento}
                      onChange={(e) => setBusquedaReabastecimiento(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                    />
                  </div>
                  <div>
                    <select
                      value={filtroEstadoReabastecimiento}
                      onChange={(e) => setFiltroEstadoReabastecimiento(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                    >
                      <option value="todos">Todos los estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="completed">Completados</option>
                    </select>
                  </div>
                  <div>
                    <input
                      type="date"
                      value={filtroFechaReabastecimiento}
                      onChange={(e) => setFiltroFechaReabastecimiento(e.target.value)}
                      className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                      title="Filtrar por fecha de creación"
                    />
                  </div>
                  <div>
                    <button
                      onClick={() => {
                        setBusquedaReabastecimiento('')
                        setFiltroEstadoReabastecimiento('todos')
                        setFiltroFechaReabastecimiento('')
                      }}
                      className="w-full md:w-auto px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold flex items-center justify-center gap-2"
                      title="Limpiar filtros"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                {pedidosReabastecimientoFiltrados.length === 0 ? (
                  <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    <p className="text-gray-500 text-lg">No hay pedidos de reabastecimiento</p>
                    <p className="text-gray-400 text-sm mt-2">
                      {busquedaReabastecimiento || filtroEstadoReabastecimiento !== 'todos' || filtroFechaReabastecimiento
                        ? 'No se encontraron pedidos con los filtros seleccionados'
                        : 'Aún no se han creado pedidos de reabastecimiento'}
                    </p>
                  </div>
                ) : (
                  pedidosReabastecimientoFiltrados.map(pedido => (
                    <PedidoReabastecimientoCard
                      key={pedido.id}
                      pedido={pedido}
                      marcarComoReabastecido={marcarComoReabastecido}
                    />
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}
function PedidoReabastecimientoCard({ pedido, marcarComoReabastecido }) {
  const [items, setItems] = useState(pedido.items)
  const [editando, setEditando] = useState(false)
  const actualizarCantidad = (itemId, nuevaCantidad) => {
    if (nuevaCantidad <= 0) {
      if (confirm('¿Eliminar este producto del pedido?')) {
        setItems(items.filter(item => item.id !== itemId))
      }
    } else {
      setItems(items.map(item =>
        item.id === itemId ? { ...item, cantidad: nuevaCantidad } : item
      ))
    }
  }
  const handleMarcarReabastecido = () => {
    if (items.length === 0) {
      showWarning('No hay productos en el pedido')
      return
    }
    marcarComoReabastecido(pedido.id, items)
  }
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b gap-3">
        <div className="flex-1">
          <p className="font-semibold text-gray-900 mb-1">
            Pedido #{pedido.id.slice(0, 8).toUpperCase()}
          </p>
          <p className="text-sm text-gray-500 flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Creado por: {pedido.user_name}
          </p>
          <div className="flex flex-col gap-1 mt-2">
            <p className="text-xs text-gray-400 flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Creado: {new Date(pedido.created_at).toLocaleDateString('es-ES', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </p>
            {pedido.completed_at && (
              <p className="text-xs text-green-600 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Completado: {new Date(pedido.completed_at).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end gap-2">
          <span className={`px-4 py-2 rounded-full font-semibold whitespace-nowrap flex items-center gap-1 ${
            pedido.status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : 'bg-green-100 text-green-800'
          }`}>
            {pedido.status === 'pending' ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Pendiente
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Reabastecido
              </>
            )}
          </span>
          <p className="text-xs text-gray-500">
            {pedido.items.length} producto{pedido.items.length !== 1 ? 's' : ''}
          </p>
        </div>
      </div>
      <div className="space-y-2 mb-4">
        {items.map((item, index) => (
          <div key={item.id || index} className="flex items-center gap-3 bg-gray-50 p-3 rounded">
            <img src={item.imagen} alt={item.nombre} className="w-16 h-16 object-cover rounded" />
            <div className="flex-1">
              <p className="font-semibold text-gray-900">{item.nombre}</p>
              {pedido.status === 'pending' && editando ? (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                    className="w-7 h-7 bg-red-500 text-white rounded hover:bg-red-600 flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    value={item.cantidad}
                    onChange={(e) => actualizarCantidad(item.id, parseInt(e.target.value) || 0)}
                    className="w-20 text-center border border-gray-300 rounded py-1 text-gray-900"
                    min="0"
                  />
                  <button
                    onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                    className="w-7 h-7 bg-green-500 text-white rounded hover:bg-green-600 flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                  <span className="text-xs text-gray-500 ml-2">unidades</span>
                </div>
              ) : (
                <p className="text-sm text-gray-600">Cantidad: {item.cantidad} unidades</p>
              )}
            </div>
          </div>
        ))}
      </div>
      {pedido.status === 'pending' && (
        <div className="flex gap-2">
          {!editando ? (
            <>
              <button
                onClick={() => setEditando(true)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar Cantidades
              </button>
              <button
                onClick={handleMarcarReabastecido}
                className="flex-1 bg-green-500 text-white py-2 rounded-lg font-semibold hover:bg-green-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Marcar como Reabastecido
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  setItems(pedido.items)
                  setEditando(false)
                }}
                className="flex-1 bg-gray-400 text-white py-2 rounded-lg font-semibold hover:bg-gray-500 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Cancelar
              </button>
              <button
                onClick={() => setEditando(false)}
                className="flex-1 bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 transition flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Guardar Cambios
              </button>
            </>
          )}
        </div>
      )}
    </div>
  )
}
function ProductoStockCard({ producto, actualizarStock, añadirAPedido, actualizando, showWarning }) {
  const [tipoAjuste, setTipoAjuste] = useState('entrada') 
  const [cantidad, setCantidad] = useState(0)
  const [cantidadPedido, setCantidadPedido] = useState(1)
  const minStock = producto.min_stock || 10
  const stockActual = producto.stock_quantity || 0
  const stockBajo = stockActual <= minStock
  const agotado = stockActual === 0
  const valoresPredefinidos = [1, 5, 10, 25, 50, 100]
  const guardarAjuste = () => {
    if (cantidad === 0) {
      showWarning('Ingresa una cantidad válida')
      return
    }
    const ajuste = tipoAjuste === 'entrada' ? cantidad : -cantidad
    actualizarStock(producto.id, ajuste)
    setCantidad(0)
  }
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden border-2 ${
      agotado ? 'border-red-500' : stockBajo ? 'border-yellow-500' : 'border-gray-200'
    }`}>
      <div className="relative">
        <img
          src={producto.image}
          alt={producto.name}
          className="w-full h-48 object-cover"
        />
        {agotado && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            AGOTADO
          </div>
        )}
        {stockBajo && !agotado && (
          <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            STOCK BAJO
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-gray-900 mb-2">{producto.name}</h3>
        <div className="mb-4">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-gray-600">Stock Actual:</span>
            <span className={`text-2xl font-bold ${
              agotado ? 'text-red-600' : stockBajo ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {stockActual}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500">Stock mínimo:</span>
            <span className="text-xs text-gray-500">{minStock}</span>
          </div>
        </div>
        <div className="mb-4 pb-4 border-b">
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setTipoAjuste('entrada')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                tipoAjuste === 'entrada'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Entrada
            </button>
            <button
              onClick={() => setTipoAjuste('salida')}
              className={`flex-1 px-4 py-2 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                tipoAjuste === 'salida'
                  ? 'bg-orange-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
              </svg>
              Salida
            </button>
          </div>
          <div className="mb-3">
            <p className="text-xs text-gray-600 mb-2 flex items-center gap-1">
              <span className="font-semibold flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Cantidad
              </span>
              <span className={`ml-auto font-bold ${tipoAjuste === 'entrada' ? 'text-green-600' : 'text-orange-600'}`}>
                {tipoAjuste === 'entrada' ? '+' : '-'}{cantidad}
              </span>
            </p>
            <div className="text-center py-6 bg-gray-50 rounded-lg mb-3 relative">
              <span className="text-5xl font-bold text-gray-900">{cantidad}</span>
              {cantidad > 0 && (
                <button
                  onClick={() => setCantidad(0)}
                  className="absolute top-2 right-2 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full font-bold transition flex items-center justify-center"
                  title="Resetear cantidad"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <div className="grid grid-cols-6 gap-2 mb-3">
              {valoresPredefinidos.map(valor => (
                <button
                  key={valor}
                  onClick={() => setCantidad(cantidad + valor)}
                  className="px-3 py-2 rounded font-semibold transition bg-gray-100 text-gray-700 hover:bg-gray-200 active:bg-blue-500 active:text-white"
                >
                  {valor}
                </button>
              ))}
            </div>
            <div className="flex gap-2 items-center mb-3">
              <input
                type="number"
                value={cantidad}
                onChange={(e) => setCantidad(parseInt(e.target.value) || 0)}
                placeholder="Cantidad manual"
                className="flex-1 px-3 py-2 border border-gray-300 rounded text-gray-900 text-center"
                min="0"
              />
            </div>
            <p className="text-xs text-gray-500 mb-3 flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Registra nuevas unidades recibidas en el almacén
            </p>
            <button
              onClick={guardarAjuste}
              disabled={actualizando || cantidad === 0}
              className={`w-full py-3 rounded-lg font-bold transition ${
                tipoAjuste === 'entrada'
                  ? 'bg-green-500 hover:bg-green-600 text-white'
                  : 'bg-orange-600 hover:bg-orange-700 text-white'
              } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              Guardar Ajuste
            </button>
          </div>
        </div>
        <div>
          <p className="text-xs text-gray-600 mb-2 font-semibold">Añadir a Pedido:</p>
          <div className="flex gap-2">
            <input
              type="number"
              value={cantidadPedido}
              onChange={(e) => setCantidadPedido(parseInt(e.target.value) || 1)}
              min="1"
              className="w-20 px-3 py-2 border border-gray-300 rounded text-gray-900 text-center"
            />
            <button
              onClick={() => {
                añadirAPedido(producto, cantidadPedido)
                setCantidadPedido(1)
              }}
              className="flex-1 bg-[#3B82F6] text-white py-2 rounded font-semibold hover:bg-[#2563EB] transition flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Añadir
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
