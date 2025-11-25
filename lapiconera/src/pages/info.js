import { useState, useEffect } from 'react'
import Header from '../components/Header'
import { useNotification } from '../context/NotificationContext'
import { getConfiguracion, updateConfiguracion } from './api/configuracion'
import { supabase } from './api/supabaseClient'
export default function Informacion() {
  const [usuario, setUsuario] = useState(null)
  const { showSuccess, showError } = useNotification()
  const [editandoContacto, setEditandoContacto] = useState(false)
  const [editandoHorarios, setEditandoHorarios] = useState(false)
  const [loading, setLoading] = useState(true)
  const [guardandoContacto, setGuardandoContacto] = useState(false)
  const [guardandoHorarios, setGuardandoHorarios] = useState(false)
  const [config, setConfig] = useState({
    telefono: '602219877',
    email: 'tiendalapiconera@gmail.com',
    horario_lunes_viernes: '8:00 - 17:00',
    horario_sabados: '9:00 - 14:00',
    horario_festivos: '9:00 - 15:00'
  })
  useEffect(() => {
    let mounted = true
    const cargarDatosAsync = async () => {
      await cargarDatos()
    }
    if (mounted) {
      cargarDatosAsync()
    }
    return () => {
      mounted = false
    }
  }, [])
  const cargarDatos = async () => {
    try {
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
      } catch (userError) {
        setUsuario(null)
      }
      const configuracion = await getConfiguracion()
      if (configuracion) {
        setConfig(configuracion)
      }
    } catch (error) {
      console.error('Error al cargar configuración:', error)
    } finally {
      setLoading(false)
    }
  }
  const handleGuardarContacto = async () => {
    setGuardandoContacto(true)
    try {
      await updateConfiguracion(config)
      setEditandoContacto(false)
      showSuccess('Contacto actualizado correctamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      showError('Error al guardar el contacto')
    } finally {
      setGuardandoContacto(false)
    }
  }
  const handleCancelarContacto = () => {
    setEditandoContacto(false)
    cargarDatos()
  }
  const handleGuardarHorarios = async () => {
    setGuardandoHorarios(true)
    try {
      await updateConfiguracion(config)
      setEditandoHorarios(false)
      showSuccess('Horarios actualizados correctamente')
    } catch (error) {
      console.error('Error al guardar:', error)
      showError('Error al guardar los horarios')
    } finally {
      setGuardandoHorarios(false)
    }
  }
  const handleCancelarHorarios = () => {
    setEditandoHorarios(false)
    cargarDatos()
  }
  const isAdmin = usuario?.role === 'admin'
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:row-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Ubicación - La Piconera</h2>
                <div className="mb-4 bg-gray-200 h-64 rounded-lg flex items-center justify-center overflow-hidden">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3167.845!2d-6.0745!3d36.9197!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd11d0c4c8e1e2c5%3A0x8b1e8e8e8e8e8e8!2sAv.%20Oc%C3%A9ano%20Atl%C3%A1ntico%2C%2056%2C%2041740%20Lebrija%2C%20Sevilla!5e0!3m2!1ses!2ses!4v1234567890"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen=""
                    loading="lazy"
                    title="Ubicación La Piconera"
                  ></iframe>
                </div>
                <div className="mb-4 text-gray-700 text-sm">
                  <p className="font-semibold mb-1">Av. Océano Atlántico, 56</p>
                  <p>41740 Lebrija, Sevilla</p>
                </div>
                <a
                  href="https://maps.app.goo.gl/prDhEdJCM6Z3hJvZA"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-[#3B82F6] text-white text-center py-3 rounded-lg hover:bg-[#2563EB] transition font-semibold"
                >
                Ver en Google Maps
              </a>
            </div>
            <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-800 mb-4">Nuestros servicios</h2>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Productos Frescos</h3>
                  <p className="text-gray-600 text-sm">
                    Frutas, verduras, carnes y pescados de frescura excepcional
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Calidad Garantizada</h3>
                  <p className="text-gray-600 text-sm">
                    Productos de alta calidad con las mejores marcas
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 mb-1">Atención Personalizada</h3>
                  <p className="text-gray-600 text-sm">
                    Nuestro equipo está disponible para ayudarte en todo momento
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-gray-800">Contacto</h2>
                  {isAdmin && !editandoContacto && (
                    <button
                      onClick={() => setEditandoContacto(true)}
                      className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-semibold"
                    >
                      Editar
                    </button>
                  )}
                </div>
                {editandoContacto ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono
                      </label>
                      <input
                        type="text"
                        value={config.telefono}
                        onChange={(e) => setConfig({ ...config, telefono: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none text-gray-900"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                      </label>
                      <input
                        type="email"
                        value={config.email}
                        onChange={(e) => setConfig({ ...config, email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none text-gray-900"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleGuardarContacto}
                        disabled={guardandoContacto}
                        className="flex-1 bg-[#3B82F6] text-white py-2 rounded-lg hover:bg-[#2563EB] transition font-semibold disabled:opacity-50"
                      >
                        {guardandoContacto ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={handleCancelarContacto}
                        disabled={guardandoContacto}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Teléfono</p>
                      <p className="text-gray-600">{config.telefono}</p>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-700 mb-1">Email</p>
                      <p className="text-gray-600">{config.email}</p>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <a
                        href="https://www.facebook.com/lapiconeratiendalebrija/?locale=es_ES"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center hover:bg-blue-700 transition"
                        title="Facebook"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                        </svg>
                      </a>
                      <a
                        href="https://www.instagram.com/tiendalapiconera/#"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-10 h-10 bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 text-white rounded-full flex items-center justify-center hover:opacity-90 transition"
                        title="Instagram"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                        </svg>
                      </a>
                    </div>
                  </div>
                )}
            </div>
            <div className="bg-green-50 border border-green-200 rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">Horarios</h2>
                  {isAdmin && !editandoHorarios && (
                    <button
                      onClick={() => setEditandoHorarios(true)}
                      className="text-[#3B82F6] hover:text-[#2563EB] text-sm font-semibold"
                    >
                      Editar
                    </button>
                  )}
              </div>
              {editandoHorarios ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Lunes a Viernes
                      </label>
                      <input
                        type="text"
                        value={config.horario_lunes_viernes}
                        onChange={(e) => setConfig({ ...config, horario_lunes_viernes: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none text-gray-900"
                        placeholder="8:00 - 17:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Sábados
                      </label>
                      <input
                        type="text"
                        value={config.horario_sabados}
                        onChange={(e) => setConfig({ ...config, horario_sabados: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none text-gray-900"
                        placeholder="9:00 - 14:00"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Festivos
                      </label>
                      <input
                        type="text"
                        value={config.horario_festivos}
                        onChange={(e) => setConfig({ ...config, horario_festivos: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] outline-none text-gray-900"
                        placeholder="9:00 - 15:00"
                      />
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={handleGuardarHorarios}
                        disabled={guardandoHorarios}
                        className="flex-1 bg-[#3B82F6] text-white py-2 rounded-lg hover:bg-[#2563EB] transition font-semibold disabled:opacity-50"
                      >
                        {guardandoHorarios ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        onClick={handleCancelarHorarios}
                        disabled={guardandoHorarios}
                        className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition font-semibold"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
              ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-800">Lunes a Viernes</p>
                        <p className="text-gray-600 text-sm">{config.horario_lunes_viernes}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-800">Sábados</p>
                        <p className="text-gray-600 text-sm">{config.horario_sabados}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                      <div>
                        <p className="font-semibold text-gray-800">Festivos</p>
                        <p className="text-gray-600 text-sm">{config.horario_festivos}</p>
                      </div>
                    </div>
                  </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
