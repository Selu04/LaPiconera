import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useNotification } from '../context/NotificationContext'
import { crearPedido } from '../pages/api/pedidos'
import Carrito from './Carrito'
import { supabase } from '../pages/api/supabaseClient'
export default function Header() {
  const { usuario, setUsuario } = useUser()
  const { showSuccess, showError, showWarning } = useNotification()
  const [carritoAbierto, setCarritoAbierto] = useState(false)
  const [menuAbierto, setMenuAbierto] = useState(false)
  const [procesandoPedido, setProcesandoPedido] = useState(false)
  const { items, increment, decrement, removeFromCart, clearCart } = useCart()
  const router = useRouter()
  const baseLinks = [
    { href: '/', label: 'Catálogo' },
    { href: '/alergenos', label: 'Alérgenos' },
    { href: '/info', label: 'Información' },
    { href: '/contacto', label: 'Contacto' },
  ]
  const getLinks = () => {
    if (!usuario) return baseLinks
    const links = [...baseLinks]
    if (usuario.role === 'customer') {
      links.push({ href: '/pedidos', label: 'Pedidos' })
    }
    if (usuario.role === 'employee') {
      links.push({ href: '/pedidos', label: 'Pedidos' })
      links.push({ href: '/stock', label: 'Stock' })
    }
    if (usuario.role === 'admin') {
      links.push({ href: '/pedidos', label: 'Pedidos' })
      links.push({ href: '/stock', label: 'Stock' })
    }
    return links
  }
  const links = getLinks()
  const handleLogout = async () => {
    await supabase.auth.signOut()
    setUsuario(null)
    router.push('/')
  }
  const handleConfirmarPedido = async () => {
    if (!usuario) {
      showWarning('Debes iniciar sesión para realizar un pedido')
      router.push('/login')
      return
    }
    if (items.length === 0) {
      showWarning('El carrito está vacío')
      return
    }
    setProcesandoPedido(true)
    try {
      await crearPedido(usuario, items)
      clearCart()
      setCarritoAbierto(false)
      showSuccess('¡Pedido realizado con éxito! Puedes recogerlo en tienda.')
      router.push('/pedidos')
    } catch (error) {
      console.error('Error al crear pedido:', error)
      showError(error.message || 'Error al procesar el pedido. Por favor intenta de nuevo.')
    } finally {
      setProcesandoPedido(false)
    }
  }
  return (
    <>
      <header className="flex justify-between items-center px-6 py-4 bg-white shadow-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-red-800">LP</span>
          <span className="text-xl font-semibold text-gray-800">La Piconera</span>
        </div>
        <nav className="hidden md:flex items-center gap-4 text-gray-600 font-medium">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`px-3 py-2 rounded-full transition ${
                router.pathname === link.href
                  ? 'bg-[#3B82F6] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setCarritoAbierto(true)}
            className="relative text-orange-600 hover:text-orange-700 transition-colors"
            aria-label="Carrito"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {items.reduce((acc, i) => acc + i.qty, 0) > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
                {items.reduce((acc, i) => acc + i.qty, 0)}
              </span>
            )}
          </button>
          {usuario ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                {(usuario.role === 'employee' || usuario.role === 'admin') && (
                  <a
                    href="https://oeakibkrouxtehvwjmlz.supabase.co/storage/v1/object/public/apk/piconera.apk"
                    download
                    className="flex items-center gap-1 text-green-600 hover:text-green-700 transition-colors"
                    title="Descargar App"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </a>
                )}
                {usuario.role === 'employee' && (
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span>Trabajador</span>
                  </span>
                )}
                {usuario.role === 'admin' && (
                  <button
                    onClick={() => router.push('/admin')}
                    className="hover:text-[#3B82F6] transition-colors"
                    aria-label="Panel Admin"
                    title="Panel Admin"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </button>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {usuario.name}
                </span>
                <button
                  onClick={handleLogout}
                  className="text-sm text-red-600 hover:underline"
                >
                  Cerrar sesión
                </button>
              </div>
            </>
          ) : (
            <a
              href="/login"
              className="hidden md:block ml-2 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-[#3B82F6] hover:text-[#3B82F6] transition"
            >
              Iniciar Sesión
            </a>
          )}
          <button
            className="md:hidden"
            onClick={() => setMenuAbierto(!menuAbierto)}
            aria-label="Abrir menú"
          >
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>
      {menuAbierto && (
        <div className="md:hidden bg-white shadow-md p-4 space-y-3">
          {links.map(link => (
            <a
              key={link.href}
              href={link.href}
              className={`block px-3 py-2 rounded-full ${
                router.pathname === link.href
                  ? 'bg-[#3B82F6] text-white font-semibold'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              {link.label}
            </a>
          ))}
          {usuario ? (
            <>
              {(usuario.role === 'employee' || usuario.role === 'admin') && (
                <a
                  href="https://oeakibkrouxtehvwjmlz.supabase.co/storage/v1/object/public/apk/piconera.apk"
                  download
                  className="flex items-center gap-2 px-3 py-2 text-green-600 hover:bg-green-50 rounded-full transition"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Descargar App
                </a>
              )}
              <button
                onClick={handleLogout}
                className="block text-red-600 mt-2"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <a
              href="/login"
              className="block border border-gray-300 text-gray-700 px-4 py-2 rounded hover:border-[#3B82F6] hover:text-[#3B82F6] transition"
            >
              Iniciar Sesión
            </a>
          )}
        </div>
      )}
      <Carrito
        abierto={carritoAbierto}
        onClose={() => setCarritoAbierto(false)}
        items={items}
        onIncrement={(id) => increment(id, showError)}
        onDecrement={decrement}
        onRemove={removeFromCart}
        onClear={clearCart}
        onConfirm={handleConfirmarPedido}
        procesando={procesandoPedido}
      />
    </>
  )
}
