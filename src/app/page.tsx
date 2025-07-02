'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Logo from '@/components/logo'

export default function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          setIsLoggedIn(true)
          setUser(data.user)
        }
      } catch {
        setIsLoggedIn(false)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleDashboard = () => {
    if (user?.role === 'ADMIN') {
      router.push('/admin')
    } else {
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Logo size="xl" textPosition="bottom" />
              <span className="ml-3 text-lg text-gray-700">Darts League</span>
            </div>
            <div className="flex items-center space-x-4">
              {isLoggedIn ? (
                <>
                  <span className="text-gray-700">Hola, {user?.name}</span>
                  <button
                    onClick={handleDashboard}
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    {user?.role === 'ADMIN' ? 'Panel Admin' : 'Dashboard'}
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-700 hover:text-primary-600 transition-colors"
                  >
                    Iniciar Sesión
                  </Link>
                  <Link
                    href="/register"
                    className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">🎯</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="text-primary-600">Beer Team</span> Darts League
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            La plataforma definitiva para gestionar tus ligas de dardos. 
            Organiza torneos, rastrea estadísticas y conecta con la comunidad de dardos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isLoggedIn && (
              <>
                <Link
                  href="/register"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Comenzar Gratis
                </Link>
                <Link
                  href="/join/ejemplo-501-2024"
                  className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
                >
                  Ver Liga de Ejemplo
                </Link>
              </>
            )}
            <Link
              href="/public"
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg flex items-center gap-2"
            >
              📊 Ver Competiciones Públicas
            </Link>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">👨‍💼</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Panel de Administrador
            </h3>
            <p className="text-gray-600">
              Gestiona ligas, participantes, resultados y estadísticas desde un panel completo e intuitivo.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">🎯</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Dashboard de Jugadores
            </h3>
            <p className="text-gray-600">
              Sigue tus estadísticas, clasificaciones y próximos partidos en tiempo real.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📱</span>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              PWA Móvil
            </h3>
            <p className="text-gray-600">
              Aplicación instalable que funciona offline. Recibe notificaciones de partidos.
            </p>
          </div>
        </div>

        {/* Competition Types */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Tipos de Competición Soportados
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary-600">501</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                501 con Cierre Doble
              </h3>
              <p className="text-gray-600">
                El clásico juego de 501 puntos con cierre obligatorio en doble. 
                Perfecto para competiciones serias.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🏏</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Cricket
              </h3>
              <p className="text-gray-600">
                El estratégico juego de Cricket. Cierra números y puntúa para ganar.
                Ideal para jugadores tácticos.
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">¿Por qué elegir Beer Team Darts?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-yellow-300">100%</div>
              <div className="text-primary-100">Gratuito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">∞</div>
              <div className="text-primary-100">Ligas Ilimitadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">📱</div>
              <div className="text-primary-100">Aplicación PWA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-yellow-300">⚡</div>
              <div className="text-primary-100">Tiempo Real</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        {!isLoggedIn && (
          <div className="text-center mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              ¿Listo para organizar tu primera liga?
            </h2>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Únete a cientos de organizadores que ya confían en Beer Team Darts 
              para gestionar sus competiciones de dardos.
            </p>
            <Link
              href="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block"
            >
              Crear Cuenta Gratis 🚀
            </Link>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <span className="text-2xl font-bold text-primary-500">Beer Team</span>
            <span className="ml-3 text-gray-300">Darts League Manager</span>
          </div>
          <p className="text-gray-400">
            Desarrollado con ❤️ para la comunidad de dardos
          </p>
        </div>
      </footer>
    </div>
  )
}
