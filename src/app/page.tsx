'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Verificar si hay token de autenticación
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (response.ok) {
          const data = await response.json()
          // Redirigir según el rol
          if (data.user.role === 'ADMIN') {
            router.push('/admin')
          } else {
            router.push('/dashboard')
          }
        }
      } catch {
        // Usuario no autenticado, mantener en home
      }
    }

    checkAuth()
  }, [router])

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-yellow-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <h1 className="text-3xl font-bold text-red-600">Beer Team</h1>
              <span className="ml-3 text-xl text-gray-700">Liga de Dardos</span>
            </div>
            <div className="flex space-x-4">
              <Link
                href="/login"
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/register"
                className="border border-red-600 text-red-600 hover:bg-red-50 px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Bienvenido a la Liga de Dardos
            <span className="block text-red-600">Beer Team</span>
          </h2>
          <p className="text-xl text-gray-600 mb-12 max-w-3xl mx-auto">
            La plataforma completa para gestionar torneos de dardos. 
            Crea ligas, inscríbete en competencias, sigue tus estadísticas 
            y compite con los mejores jugadores.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎯</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Competencias</h3>
              <p className="text-gray-600">Participa en torneos de 501 y Cricket con diferentes formatos</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Estadísticas</h3>
              <p className="text-gray-600">Sigue tu progreso con estadísticas detalladas y rankings</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Comunidad</h3>
              <p className="text-gray-600">Conecta con otros jugadores y forma equipos</p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/register"
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Empezar Ahora
            </Link>
            <Link
              href="/login"
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-lg text-lg font-semibold transition-colors"
            >
              Ya tengo cuenta
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 Beer Team Liga de Dardos. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
