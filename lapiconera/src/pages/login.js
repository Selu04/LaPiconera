import { useState } from 'react'
import { useRouter } from 'next/router'
import { loginUsuario, registrarUsuario } from './api/auth'
import Header from './components/Header'
export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nombre, setNombre] = useState('')
  const [modo, setModo] = useState('login')
  const [mensaje, setMensaje] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setMensaje('')
    try {
      if (modo === 'login') {
        await loginUsuario(email, password)
        setMensaje('Sesión iniciada correctamente.')
        router.push('/')
      } else {
        if (!nombre.trim()) {
          setMensaje('Por favor ingresa tu nombre.')
          setLoading(false)
          return
        }
        await registrarUsuario(email, password, nombre)
        setMensaje('Registro exitoso. Revisa tu correo.')
      }
    } catch (err) {
      setMensaje(err.message || 'Error en la autenticación.')
      setLoading(false)
    }
  }
  const cambiarModo = () => {
    setModo(modo === 'login' ? 'registro' : 'login')
    setMensaje('')
    setEmail('')
    setPassword('')
    setNombre('')
  }
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="text-4xl font-extrabold text-[#3B82F6]">LP</span>
              <span className="text-2xl font-semibold text-gray-800">La Piconera</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-800">
              {modo === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </h1>
            <p className="text-gray-600 mt-2">
              {modo === 'login' 
                ? 'Accede a tu cuenta' 
                : 'Regístrate para hacer pedidos'}
            </p>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {modo === 'registro' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre
                </label>
                <input
                  type="text"
                  placeholder="Tu nombre completo"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition text-gray-900"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition text-gray-900"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Contraseña
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3B82F6] focus:border-transparent outline-none transition text-gray-900"
                required
                minLength={6}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B82F6] text-white font-semibold py-3 rounded-lg hover:bg-[#2563EB] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Cargando...' : modo === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          </form>
          <div className="mt-6 text-center">
            <button
              onClick={cambiarModo}
              className="text-sm text-[#3B82F6] hover:text-[#2563EB] font-medium hover:underline"
            >
              {modo === 'login' 
                ? '¿No tienes cuenta? Regístrate aquí' 
                : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>
          {mensaje && (
            <div className={`mt-4 p-3 rounded-lg text-center text-sm font-medium ${
              mensaje.includes('Error') || mensaje.includes('Por favor')
                ? 'bg-red-100 text-red-700'
                : 'bg-green-100 text-green-700'
            }`}>
              {mensaje}
            </div>
          )}
        </div>
      </div>
    </>
  )
}