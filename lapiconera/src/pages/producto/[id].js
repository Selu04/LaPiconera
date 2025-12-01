import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../../components/Header'
import { useCart } from '../../context/CartContext'
import { useUser } from '../../context/UserContext'
import { useNotification } from '../../context/NotificationContext'
import { supabase } from '../api/supabaseClient'

export default function ProductoDetalle() {
  const router = useRouter()
  const { id } = router.query
  const { addToCart } = useCart()
  const { usuario } = useUser()
  const { showSuccess, showError } = useNotification()
  
  const [producto, setProducto] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editandoFAQ, setEditandoFAQ] = useState(false)
  const [nuevaPregunta, setNuevaPregunta] = useState('')
  const [nuevaRespuesta, setNuevaRespuesta] = useState('')
  const [faqs, setFaqs] = useState([])
  const [editandoFAQIndex, setEditandoFAQIndex] = useState(null)
  const [editandoAlergenos, setEditandoAlergenos] = useState(false)
  const [alergenosDisponibles, setAlergenosDisponibles] = useState([])
  const [alergenosSeleccionados, setAlergenosSeleccionados] = useState([])

  useEffect(() => {
    if (id) {
      cargarProducto()
      cargarAlergenos()
    }
  }, [id])

  const cargarProducto = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) throw error

      setProducto(data)
      setFaqs(data.faqs || [])
      setAlergenosSeleccionados(data.allergens || [])
    } catch (error) {
      console.error('Error al cargar producto:', error)
      showError('Error al cargar el producto')
    } finally {
      setLoading(false)
    }
  }

  const cargarAlergenos = async () => {
    try {
      const { data, error } = await supabase
        .from('allergens')
        .select('*')
        .order('name', { ascending: true })

      if (error) throw error

      setAlergenosDisponibles(data)
    } catch (error) {
      console.error('Error al cargar alérgenos:', error)
    }
  }

  const handleAddToCart = () => {
    if (!usuario) {
      showError('Debes iniciar sesión para añadir productos al carrito')
      router.push('/login')
      return
    }
    addToCart(producto, showError)
    showSuccess('Producto añadido al carrito')
  }

  const agregarFAQ = async () => {
    if (!nuevaPregunta.trim() || !nuevaRespuesta.trim()) {
      showError('Por favor completa la pregunta y respuesta')
      return
    }

    const nuevoFAQ = {
      question: nuevaPregunta.trim(),
      answer: nuevaRespuesta.trim()
    }

    const nuevasFAQs = [...faqs, nuevoFAQ]

    try {
      const { error } = await supabase
        .from('products')
        .update({ faqs: nuevasFAQs })
        .eq('id', id)

      if (error) throw error

      setFaqs(nuevasFAQs)
      setNuevaPregunta('')
      setNuevaRespuesta('')
      setEditandoFAQ(false)
      showSuccess('Pregunta frecuente añadida correctamente')
    } catch (error) {
      console.error('Error:', error)
      showError('Error al añadir la pregunta')
    }
  }

  const editarFAQ = async (index, pregunta, respuesta) => {
    const nuevasFAQs = [...faqs]
    nuevasFAQs[index] = { question: pregunta, answer: respuesta }

    try {
      const { error } = await supabase
        .from('products')
        .update({ faqs: nuevasFAQs })
        .eq('id', id)

      if (error) throw error

      setFaqs(nuevasFAQs)
      setEditandoFAQIndex(null)
      showSuccess('Pregunta actualizada correctamente')
    } catch (error) {
      console.error('Error:', error)
      showError('Error al actualizar la pregunta')
    }
  }

  const eliminarFAQ = async (index) => {
    if (!confirm('¿Eliminar esta pregunta frecuente?')) return

    const nuevasFAQs = faqs.filter((_, i) => i !== index)

    try {
      const { error } = await supabase
        .from('products')
        .update({ faqs: nuevasFAQs })
        .eq('id', id)

      if (error) throw error

      setFaqs(nuevasFAQs)
      showSuccess('Pregunta eliminada correctamente')
    } catch (error) {
      console.error('Error:', error)
      showError('Error al eliminar la pregunta')
    }
  }

  const toggleAlergeno = (alergenoId) => {
    setAlergenosSeleccionados(prev => {
      if (prev.includes(alergenoId)) {
        return prev.filter(id => id !== alergenoId)
      } else {
        return [...prev, alergenoId]
      }
    })
  }

  const guardarAlergenos = async () => {
    try {
      const { error } = await supabase
        .from('products')
        .update({ allergens: alergenosSeleccionados })
        .eq('id', id)

      if (error) throw error

      setProducto({ ...producto, allergens: alergenosSeleccionados })
      setEditandoAlergenos(false)
      showSuccess('Alérgenos actualizados correctamente')
    } catch (error) {
      console.error('Error:', error)
      showError('Error al actualizar alérgenos')
    }
  }

  const cancelarEdicionAlergenos = () => {
    setAlergenosSeleccionados(producto.allergens || [])
    setEditandoAlergenos(false)
  }

  const esAdmin = usuario && (usuario.role === 'admin' || usuario.role === 'employee')

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-500">Cargando producto...</p>
        </div>
      </>
    )
  }

  if (!producto) {
    return (
      <>
        <Header />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-500 text-lg">Producto no encontrado</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
            >
              Volver al inicio
            </button>
          </div>
        </div>
      </>
    )
  }

  const tieneAlergenos = producto.allergens && producto.allergens.length > 0
  const tieneTags = producto.tags && producto.tags.length > 0

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4 max-w-6xl">
          <button
            onClick={() => router.back()}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Volver
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Imagen del producto */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden bg-gray-50">
              <img
                src={producto.image}
                alt={producto.name}
                className="w-full h-[500px] object-contain"
              />
            </div>

            {/* Información del producto */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{producto.name}</h1>
              <p className="text-gray-600 text-lg mb-6">{producto.description}</p>

              <div className="flex items-center justify-between mb-6 pb-6 border-b">
                <span className="text-4xl font-bold text-orange-600">
                  €{Number(producto.price).toFixed(2)}
                </span>
                {producto.stock_quantity !== undefined && (
                  <span className={`px-4 py-2 rounded-full font-semibold ${
                    producto.stock_quantity > 0 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {producto.stock_quantity > 0 ? 'Disponible' : 'Agotado'}
                  </span>
                )}
              </div>

              {/* Alérgenos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                    Alérgenos
                  </h3>
                  {esAdmin && !editandoAlergenos && (
                    <button
                      onClick={() => setEditandoAlergenos(true)}
                      className="px-3 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm flex items-center gap-1"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Editar
                    </button>
                  )}
                </div>

                {editandoAlergenos ? (
                  <div className="p-4 bg-blue-50 rounded-lg border-2 border-blue-500">
                    <p className="text-sm text-gray-600 mb-3">Selecciona los alérgenos del producto:</p>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {alergenosDisponibles.map((alergeno) => (
                        <label
                          key={alergeno.id}
                          className={`flex items-center gap-2 p-3 rounded-lg border-2 cursor-pointer transition ${
                            alergenosSeleccionados.includes(alergeno.id)
                              ? 'border-red-500 bg-red-50'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={alergenosSeleccionados.includes(alergeno.id)}
                            onChange={() => toggleAlergeno(alergeno.id)}
                            className="w-4 h-4 text-red-600 rounded focus:ring-red-500"
                          />
                          <span className="text-sm font-medium text-gray-900">{alergeno.name}</span>
                        </label>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={guardarAlergenos}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={cancelarEdicionAlergenos}
                        className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : tieneAlergenos ? (
                  <div className="flex flex-wrap gap-2">
                    {producto.allergens.map((alergeno, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-semibold"
                      >
                        {alergeno}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Sin alérgenos</p>
                )}
              </div>

              {/* Tags */}
              {tieneTags && (
                <div className="mb-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                    Características
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {producto.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold flex items-center gap-1"
                      >
                        {tag === 'vegetarian' && (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Vegetariano
                          </>
                        )}
                        {tag === 'vegan' && (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Vegano
                          </>
                        )}
                        {tag === 'gluten-free' && (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                            Sin Gluten
                          </>
                        )}
                        {tag === 'local' && (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Local
                          </>
                        )}
                        {tag === 'organic' && (
                          <>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                            </svg>
                            Orgánico
                          </>
                        )}
                        {!['vegetarian', 'vegan', 'gluten-free', 'local', 'organic'].includes(tag) && tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={handleAddToCart}
                disabled={producto.stock_quantity === 0}
                className="w-full bg-orange-600 text-white px-6 py-4 rounded-lg hover:bg-orange-700 transition font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                {producto.stock_quantity === 0 ? 'Producto agotado' : 'Añadir al carrito'}
              </button>
            </div>
          </div>

          {/* Preguntas Frecuentes */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Preguntas Frecuentes
              </h2>
              {esAdmin && !editandoFAQ && (
                <button
                  onClick={() => setEditandoFAQ(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Añadir FAQ
                </button>
              )}
            </div>

            {editandoFAQ && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-orange-600">
                <h3 className="font-semibold text-gray-900 mb-3">Nueva Pregunta Frecuente</h3>
                <input
                  type="text"
                  placeholder="Pregunta"
                  value={nuevaPregunta}
                  onChange={(e) => setNuevaPregunta(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-gray-900"
                />
                <textarea
                  placeholder="Respuesta"
                  value={nuevaRespuesta}
                  onChange={(e) => setNuevaRespuesta(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-gray-900"
                />
                <div className="flex gap-2">
                  <button
                    onClick={agregarFAQ}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditandoFAQ(false)
                      setNuevaPregunta('')
                      setNuevaRespuesta('')
                    }}
                    className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {faqs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-gray-500">No hay preguntas frecuentes aún</p>
                {esAdmin && (
                  <p className="text-gray-400 text-sm mt-2">Añade preguntas frecuentes para ayudar a tus clientes</p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <FAQItem
                    key={index}
                    faq={faq}
                    index={index}
                    esAdmin={esAdmin}
                    editandoIndex={editandoFAQIndex}
                    onEdit={(pregunta, respuesta) => editarFAQ(index, pregunta, respuesta)}
                    onDelete={() => eliminarFAQ(index)}
                    onStartEdit={() => setEditandoFAQIndex(index)}
                    onCancelEdit={() => setEditandoFAQIndex(null)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

function FAQItem({ faq, index, esAdmin, editandoIndex, onEdit, onDelete, onStartEdit, onCancelEdit }) {
  const [pregunta, setPregunta] = useState(faq.question)
  const [respuesta, setRespuesta] = useState(faq.answer)
  const [expandido, setExpandido] = useState(false)
  const estaEditando = editandoIndex === index

  return (
    <div className="border border-gray-200 rounded-lg">
      {estaEditando ? (
        <div className="p-4 bg-blue-50">
          <input
            type="text"
            value={pregunta}
            onChange={(e) => setPregunta(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-gray-900"
          />
          <textarea
            value={respuesta}
            onChange={(e) => setRespuesta(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-3 text-gray-900"
          />
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(pregunta, respuesta)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm"
            >
              Guardar
            </button>
            <button
              onClick={() => {
                setPregunta(faq.question)
                setRespuesta(faq.answer)
                onCancelEdit()
              }}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500 text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      ) : (
        <>
          <button
            onClick={() => setExpandido(!expandido)}
            className="w-full p-4 flex items-center justify-between hover:bg-gray-50 transition"
          >
            <span className="font-semibold text-gray-900 text-left">{faq.question}</span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${expandido ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {expandido && (
            <div className="p-4 pt-0 border-t">
              <p className="text-gray-600">{faq.answer}</p>
              {esAdmin && (
                <div className="flex gap-2 mt-4">
                  <button
                    onClick={onStartEdit}
                    className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Editar
                  </button>
                  <button
                    onClick={onDelete}
                    className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 text-sm flex items-center gap-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Eliminar
                  </button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}
