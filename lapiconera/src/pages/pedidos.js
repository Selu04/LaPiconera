import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from './components/Header'
import { useNotification } from './context/NotificationContext'
import { obtenerPedidosUsuario, obtenerTodosPedidos, actualizarEstadoPedido, obtenerEstadisticasPedidos } from './api/pedidos'
import { supabase } from './api/supabaseClient'
export default function Pedidos() {
  const [usuario, setUsuario] = useState(null)
  const { showSuccess, showError, showInfo } = useNotification()
  const [pedidos, setPedidos] = useState([])
  const [estadisticas, setEstadisticas] = useState({ pending: 0, preparing: 0, ready: 0, collected: 0, not_collected: 0 })
  const [filtroEstado, setFiltroEstado] = useState('todos')
  const [busqueda, setBusqueda] = useState('')
  const [filtroFecha, setFiltroFecha] = useState('')
  const [filtroHora, setFiltroHora] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  useEffect(() => {
    cargarDatos()
  }, [])
  const cargarDatos = async () => {
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
      setUsuario(userData)
      if (userData.role === 'employee' || userData.role === 'admin') {
        const todosPedidos = await obtenerTodosPedidos()
        setPedidos(todosPedidos)
        const stats = await obtenerEstadisticasPedidos()
        setEstadisticas(stats)
      } else {
        const misPedidos = await obtenerPedidosUsuario(userData.id)
        setPedidos(misPedidos)
      }
    } catch (error) {
      console.error('Error al cargar pedidos:', error)
      showError('Error al cargar pedidos')
    } finally {
      setLoading(false)
    }
  }
  const handleCambiarEstado = async (orderId, nuevoEstado) => {
    try {
      await actualizarEstadoPedido(orderId, nuevoEstado)
      if (nuevoEstado === 'ready') {
        showSuccess('Pedido marcado como listo para recoger. Se ha enviado un email de notificación al cliente.')
      } else {
        showInfo('Estado del pedido actualizado correctamente')
      }
      await cargarDatos()
    } catch (error) {
      console.error('Error al cambiar estado:', error)
      showError('Error al actualizar el estado del pedido')
    }
  }
  const getEstadoLabel = (status) => {
    const labels = {
      pending: 'Pendiente',
      preparing: 'En Preparación',
      ready: 'Listo para Recoger',
      collected: 'Recogido',
      not_collected: 'No Recogido'
    }
    return labels[status] || status
  }
  const getEstadoColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      preparing: 'bg-blue-100 text-blue-800 border-blue-300',
      ready: 'bg-purple-100 text-purple-800 border-purple-300',
      collected: 'bg-green-100 text-green-800 border-green-300',
      not_collected: 'bg-red-100 text-red-800 border-red-300'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }
  const getEstadoIconSVG = (status) => {
    switch(status) {
      case 'pending':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'preparing':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        )
      case 'ready':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )
      case 'collected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        )
      case 'not_collected':
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        )
    }
  }
  const pedidosFiltrados = pedidos.filter(pedido => {
    const coincideBusqueda = busqueda === '' || 
      pedido.user_name.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.user_email.toLowerCase().includes(busqueda.toLowerCase()) ||
      pedido.id.toLowerCase().includes(busqueda.toLowerCase())
    const coincideEstado = filtroEstado === 'todos' || pedido.status === filtroEstado
    const fechaPedido = new Date(pedido.created_at)
    const fechaPedidoStr = fechaPedido.toISOString().split('T')[0]
    const coincideFecha = filtroFecha === '' || fechaPedidoStr === filtroFecha
    const horaPedido = fechaPedido.toTimeString().slice(0, 5)
    const coincideHora = filtroHora === '' || horaPedido === filtroHora
    return coincideBusqueda && coincideEstado && coincideFecha && coincideHora
  })
  const isStaff = usuario && (usuario.role === 'employee' || usuario.role === 'admin')
  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Cargando pedidos...</p>
        </div>
      </>
    )
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h1 className="text-3xl font-bold text-gray-800">
              {isStaff ? 'Gestión de Pedidos' : 'Mis Pedidos'}
            </h1>
          </div>
          {isStaff && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pendientes</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.pending}</p>
                    <p className="text-xs text-gray-500 mt-1">Sin iniciar</p>
                  </div>
                  <svg className="w-12 h-12 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">En Preparación</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.preparing}</p>
                    <p className="text-xs text-gray-500 mt-1">Preparando</p>
                  </div>
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Listos</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.ready}</p>
                    <p className="text-xs text-gray-500 mt-1">Para recoger</p>
                  </div>
                  <svg className="w-12 h-12 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Recogidos</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.collected}</p>
                    <p className="text-xs text-gray-500 mt-1">Finalizados</p>
                  </div>
                  <svg className="w-12 h-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">No Recogidos</p>
                    <p className="text-3xl font-bold text-gray-900">{estadisticas.not_collected}</p>
                    <p className="text-xs text-gray-500 mt-1">Requieren atención</p>
                  </div>
                  <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
            </div>
          )}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Buscar por cliente, email o ID..."
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                />
              </div>
              <div>
                <select
                  value={filtroEstado}
                  onChange={(e) => setFiltroEstado(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="pending">Pendientes</option>
                  <option value="preparing">En Preparación</option>
                  <option value="ready">Listos para Recoger</option>
                  <option value="collected">Recogidos</option>
                  <option value="not_collected">No Recogidos</option>
                </select>
              </div>
              <div>
                <input
                  type="date"
                  value={filtroFecha}
                  onChange={(e) => setFiltroFecha(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                  title="Filtrar por fecha"
                />
              </div>
              <div>
                <input
                  type="time"
                  value={filtroHora}
                  onChange={(e) => setFiltroHora(e.target.value)}
                  className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                  title="Filtrar por hora"
                />
              </div>
              <div>
                <button
                  onClick={() => {
                    setBusqueda('')
                    setFiltroEstado('todos')
                    setFiltroFecha('')
                    setFiltroHora('')
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
          {pedidosFiltrados.length === 0 ? (
            <div className="bg-white rounded-lg shadow-md p-12 text-center">
              <svg className="w-24 h-24 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-gray-500 text-lg">No hay pedidos</p>
              <p className="text-gray-400 text-sm mt-2">
                {busqueda || filtroEstado !== 'todos' || filtroFecha || filtroHora
                  ? 'No se encontraron pedidos con los filtros seleccionados' 
                  : isStaff 
                    ? 'Aún no hay pedidos en el sistema'
                    : 'Aún no has realizado ningún pedido'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pedidosFiltrados.map(pedido => (
                <div key={pedido.id} className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4 pb-4 border-b">
                    <div>
                      <p className="text-sm text-gray-500">
                        Pedido #{pedido.id.slice(0, 8).toUpperCase()}
                      </p>
                      <p className="text-xs text-gray-400">
                        {new Date(pedido.created_at).toLocaleString('es-ES')}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-3 md:mt-0">
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold border flex items-center gap-2 ${getEstadoColor(pedido.status)}`}>
                        {getEstadoIconSVG(pedido.status)} {getEstadoLabel(pedido.status)}
                      </span>
                    </div>
                  </div>
                  {isStaff && (
                    <div className="mb-4 pb-4 border-b">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        <span className="font-semibold">Cliente:</span> {pedido.user_name}
                      </p>
                      <p className="text-sm text-gray-700 flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        <span className="font-semibold">Email:</span> {pedido.user_email}
                      </p>
                    </div>
                  )}
                  <div className="space-y-2 mb-4">
                    <p className="font-semibold text-gray-800 mb-2">Productos ({pedido.order_items.length})</p>
                    {pedido.order_items.map(item => (
                      <div key={item.id} className="flex items-center gap-3 bg-gray-50 p-3 rounded-lg">
                        {item.product_image && (
                          <img 
                            src={item.product_image} 
                            alt={item.product_name}
                            className="w-12 h-12 object-cover rounded"
                          />
                        )}
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900">{item.product_name}</p>
                          <p className="text-xs text-gray-500">
                            {item.quantity}x €{Number(item.unit_price).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-semibold text-gray-900">
                          €{Number(item.subtotal).toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <p className="text-lg font-bold text-gray-900">
                      Total: €{Number(pedido.total).toFixed(2)}
                    </p>
                    {isStaff && (
                      <div className="flex gap-2">
                        {pedido.status === 'pending' && (
                          <button
                            onClick={() => handleCambiarEstado(pedido.id, 'preparing')}
                            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-sm font-semibold flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            Iniciar Preparación
                          </button>
                        )}
                        {pedido.status === 'preparing' && (
                          <button
                            onClick={() => handleCambiarEstado(pedido.id, 'ready')}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm font-semibold flex items-center gap-2"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Marcar como Listo
                          </button>
                        )}
                        {pedido.status === 'ready' && (
                          <>
                            <button
                              onClick={() => handleCambiarEstado(pedido.id, 'collected')}
                              className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition text-sm font-semibold flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              Recogido
                            </button>
                            <button
                              onClick={() => handleCambiarEstado(pedido.id, 'not_collected')}
                              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition text-sm font-semibold flex items-center gap-2"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                              </svg>
                              No Recogido
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  )
}