import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'
import Header from '../components/Header'
import { useNotification } from '../context/NotificationContext'
import { enviarContacto, enviarSugerencia } from './api/contacto'
import { supabase } from './api/supabaseClient'
import { getCategorias } from './api/categorias'
export default function Contacto() {
  const [usuario, setUsuario] = useState(null)
  const { showSuccess, showError, showWarning } = useNotification()
  const [tipoFormulario, setTipoFormulario] = useState('contacto')
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [categorias, setCategorias] = useState([])
  const router = useRouter()
  const [contactoForm, setContactoForm] = useState({
    asunto: '',
    mensaje: ''
  })
  const [sugerenciaForm, setSugerenciaForm] = useState({
    product_name: '',
    description: '',
    category: ''
  })
  useEffect(() => {
    cargarUsuario()
    cargarCategorias()
  }, [])
  const cargarCategorias = async () => {
    try {
      const data = await getCategorias()
      setCategorias(data || [])
    } catch (error) {
      console.error('Error al cargar categorías:', error)
      setCategorias([])
    }
  }
  const cargarUsuario = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase
          .from('users')
          .select('id, email, name, role')
          .eq('id', user.id)
          .single()
        setUsuario({
          id: user.id,
          email: user.email,
          name: perfil?.name || user.email,
          role: perfil?.role || 'customer'
        })
      } else {
        setUsuario(null)
      }
    } catch (error) {
      setUsuario(null)
    } finally {
      setLoading(false)
    }
  }
  const handleEnviarContacto = async (e) => {
    e.preventDefault()
    if (!usuario) {
      showWarning('Debes iniciar sesión para enviar un mensaje')
      router.push('/login')
      return
    }
    setEnviando(true)
    try {
      await enviarContacto({
        nombre: usuario.name,
        email: usuario.email,
        asunto: contactoForm.asunto,
        mensaje: contactoForm.mensaje
      })
      showSuccess('Mensaje enviado correctamente. Te contactaremos pronto.')
      setContactoForm({
        asunto: '',
        mensaje: ''
      })
    } catch (error) {
      console.error('Error al enviar contacto:', error)
      showError('Error al enviar el mensaje. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }
  const handleEnviarSugerencia = async (e) => {
    e.preventDefault()
    if (!usuario) {
      showWarning('Debes iniciar sesión para enviar una sugerencia')
      router.push('/login')
      return
    }
    setEnviando(true)
    try {
      await enviarSugerencia({
        user_name: usuario.name,
        user_email: usuario.email,
        product_name: sugerenciaForm.product_name,
        description: sugerenciaForm.description,
        category: sugerenciaForm.category
      })
      showSuccess('Sugerencia enviada correctamente. ¡Gracias por tu aporte!')
      setSugerenciaForm({
        product_name: '',
        description: '',
        category: ''
      })
    } catch (error) {
      console.error('Error al enviar sugerencia:', error)
      showError('Error al enviar la sugerencia. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Contáctanos</h1>
            <p className="text-gray-600">Estamos aquí para ayudarte</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="flex gap-4">
              <button
                onClick={() => setTipoFormulario('contacto')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  tipoFormulario === 'contacto'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Mensaje General
              </button>
              <button
                onClick={() => setTipoFormulario('sugerencia')}
                className={`flex-1 py-3 px-6 rounded-lg font-semibold transition flex items-center justify-center gap-2 ${
                  tipoFormulario === 'sugerencia'
                    ? 'bg-[#3B82F6] text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                Sugerencia de Producto
              </button>
            </div>
          </div>
          {tipoFormulario === 'contacto' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Mensaje General</h2>
              {!usuario ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-4">
                    Debes iniciar sesión para enviar un mensaje
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition font-semibold"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    ¿Tienes alguna pregunta, comentario o necesitas ayuda? Escríbenos y te responderemos lo antes posible.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Enviando como:</span> {usuario.name} ({usuario.email})
                    </p>
                  </div>
                  <form onSubmit={handleEnviarContacto} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Asunto *
                      </label>
                      <input
                        type="text"
                        value={contactoForm.asunto}
                        onChange={(e) => setContactoForm({ ...contactoForm, asunto: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                        placeholder="¿En qué podemos ayudarte?"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Mensaje *
                      </label>
                      <textarea
                        value={contactoForm.mensaje}
                        onChange={(e) => setContactoForm({ ...contactoForm, mensaje: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900 resize-none"
                        placeholder="Escribe tu mensaje aquí..."
                        rows="6"
                        required
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full bg-[#3B82F6] text-white font-semibold py-3 rounded-lg hover:bg-[#2563EB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? 'Enviando...' : 'Enviar Mensaje'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
          {tipoFormulario === 'sugerencia' && (
            <div className="bg-white rounded-lg shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Sugerencia de Producto</h2>
              {!usuario ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
                  <p className="text-gray-700 mb-4">
                    Debes iniciar sesión para enviar una sugerencia de producto
                  </p>
                  <button
                    onClick={() => router.push('/login')}
                    className="bg-[#3B82F6] text-white px-6 py-2 rounded-lg hover:bg-[#2563EB] transition font-semibold"
                  >
                    Iniciar Sesión
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-gray-600 mb-6">
                    ¿Tienes una idea para un nuevo producto o mejora? ¡Nos encantaría escucharla! Tu sugerencia será revisada por nuestro equipo.
                  </p>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-700">
                      <span className="font-semibold">Enviando como:</span> {usuario.name} ({usuario.email})
                    </p>
                  </div>
                  <form onSubmit={handleEnviarSugerencia} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre del Producto *
                      </label>
                      <input
                        type="text"
                        value={sugerenciaForm.product_name}
                        onChange={(e) => setSugerenciaForm({ ...sugerenciaForm, product_name: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                        placeholder="Ej: Galletas sin gluten, Mermelada casera..."
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Descripción *
                      </label>
                      <textarea
                        value={sugerenciaForm.description}
                        onChange={(e) => setSugerenciaForm({ ...sugerenciaForm, description: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900 resize-none"
                        placeholder="Describe el producto, ingredientes, características, por qué te gustaría verlo en nuestra tienda..."
                        rows="6"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Categoría Sugerida
                      </label>
                      <select
                        value={sugerenciaForm.category}
                        onChange={(e) => setSugerenciaForm({ ...sugerenciaForm, category: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none text-gray-900"
                      >
                        <option value="">Selecciona una categoría</option>
                        {categorias.map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <p className="text-sm text-gray-700 flex items-start gap-2">
                        <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        <span><span className="font-semibold">Tip:</span> Cuanto más detallada sea tu sugerencia, más fácil será para nosotros evaluarla y considerarla.</span>
                      </p>
                    </div>
                    <button
                      type="submit"
                      disabled={enviando}
                      className="w-full bg-[#3B82F6] text-white font-semibold py-3 rounded-lg hover:bg-[#2563EB] transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {enviando ? 'Enviando...' : 'Enviar Sugerencia'}
                    </button>
                  </form>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  )
}
