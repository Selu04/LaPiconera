import { useState } from 'react'
import { useRouter } from 'next/router'
import { useCart } from '../context/CartContext'
import { useUser } from '../context/UserContext'
import { useNotification } from '../context/NotificationContext'
export default function ProductoCard({ producto, allTags = [], allAlergenos = [] }) {
  const { addToCart } = useCart()
  const { usuario, loading } = useUser()
  const { showWarning, showError } = useNotification()
  const router = useRouter()
  const handleAddToCart = (e) => {
    e.stopPropagation()
    if (loading) return
    if (!usuario) {
      showWarning('Debes iniciar sesión para añadir productos al carrito')
      router.push('/login')
      return
    }
    addToCart(producto, showError)
  }
  const handleCardClick = () => {
    router.push(`/producto/${producto.id}`)
  }
  const tieneAlergenos = producto.allergens && producto.allergens.length > 0
  const tieneTags = producto.tags && producto.tags.length > 0
  const esStaff = usuario && (usuario.role === 'admin' || usuario.role === 'employee')
  const productoTags = tieneTags 
    ? producto.tags.map(tagIdOrName => 
        allTags.find(t => t.id === tagIdOrName || t.name === tagIdOrName)
      ).filter(Boolean)
    : []
  const productoAlergenos = tieneAlergenos
    ? producto.allergens.map(alergenoIdOrName =>
        allAlergenos.find(a => a.id === alergenoIdOrName || a.name === alergenoIdOrName)
      ).filter(Boolean)
    : []
  return (
    <div 
      onClick={handleCardClick}
      className="border rounded-lg shadow-sm hover:shadow-lg transition bg-white flex flex-col h-full cursor-pointer"
    >
      <div className="w-full aspect-[4/3] overflow-hidden rounded-t-lg relative bg-gray-50">
        <img
          src={producto.image}
          alt={producto.name}
          className="w-full h-full object-contain"
        />
        {tieneAlergenos && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold flex items-center gap-1">
            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            {producto.allergens.length}
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h2 className="font-bold text-lg text-gray-900">{producto.name}</h2>
        <p className="text-sm text-gray-600 mt-1">{producto.description}</p>
        {tieneAlergenos && productoAlergenos.length > 0 && (
          <div className="mt-2">
            <p className="text-xs text-red-600 font-semibold flex items-center gap-1">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Alérgenos: {productoAlergenos.slice(0, 3).map(a => a.name).join(', ')}
              {productoAlergenos.length > 3 && '...'}
            </p>
          </div>
        )}
        {tieneTags && productoTags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {productoTags.slice(0, 2).map((tag) => (
              <span 
                key={tag.id}
                className="text-xs px-2 py-1 rounded-full flex items-center gap-1"
                style={{ 
                  backgroundColor: tag.color ? `${tag.color}20` : '#E0E7FF',
                  color: tag.color || '#4F46E5'
                }}
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                </svg>
                {tag.name}
              </span>
            ))}
            {productoTags.length > 2 && (
              <span className="text-xs text-gray-500 px-2 py-1">
                +{productoTags.length - 2}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-auto pt-3">
          <p className="font-bold text-xl">
            €{Number(producto.price).toFixed(2)}
          </p>
          {esStaff && (
            <div className={`text-sm font-semibold px-2 py-1 rounded ${
              producto.stock_quantity > 10 ? 'bg-green-100 text-green-700' :
              producto.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' :
              'bg-red-100 text-red-700'
            }`}>
              Stock: {producto.stock_quantity}
            </div>
          )}
        </div>
        <button
          onClick={ producto.stock_quantity > 0
            ? handleAddToCart
            : (e) => { e.stopPropagation() }
          }
          disabled={loading}
          className={
              producto.stock_quantity > 0
                  ? "bg-orange-600 text-white px-4 py-2 mt-3 rounded hover:bg-orange-700 hover:font-bold w-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  : "bg-red-700 text-white px-4 py-2 mt-3 rounded w-full transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          }
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {producto.stock_quantity > 0 ? 'Añadir al carrito' : 'Producto agotado'}
        </button>
      </div>
    </div>
  )
}
