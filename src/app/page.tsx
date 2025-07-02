'use client'

import Link from 'next/link'
import Header from '@/components/header'

export default function HomePage() {

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header title="Beer Team Darts League" subtitle="Plataforma definitiva para ligas de dardos" />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-3xl text-white">🎯</span>
            </div>
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4">
            <span className="text-primary-600 font-black">Beer Team</span> Darts League
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto mb-8">
            La plataforma definitiva para gestionar tus ligas de dardos. 
            Organiza torneos, rastrea estadísticas y conecta con la comunidad de dardos.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors shadow-lg"
            >
              Comenzar Gratis
            </Link>
            <Link
              href="/join/ejemplo-501-2024"
              className="border-2 border-primary-600 text-primary-600 hover:bg-primary-600 hover:text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
            >
              Ver Liga de Ejemplo
            </Link>
            <Link
              href="/public"
              className="bg-gradient-to-r from-secondary-500 to-secondary-600 hover:from-secondary-600 hover:to-secondary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-all shadow-lg flex items-center gap-2"
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
        <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-lg shadow-lg p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-8">¿Por qué elegir Beer Team Darts?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div>
              <div className="text-3xl font-bold text-secondary-300">100%</div>
              <div className="text-primary-100">Gratuito</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-300">∞</div>
              <div className="text-primary-100">Ligas Ilimitadas</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-300">📱</div>
              <div className="text-primary-100">Aplicación PWA</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-secondary-300">⚡</div>
              <div className="text-primary-100">Tiempo Real</div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center mt-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            ¿Listo para organizar tu primera liga?
          </h2>
          <p className="text-gray-700 mb-8 max-w-2xl mx-auto">
            Únete a cientos de organizadores que ya confían en Beer Team Darts 
            para gestionar sus competiciones de dardos.
          </p>
          <Link
            href="/register"
            className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors inline-block shadow-lg"
          >
            Crear Cuenta Gratis 🚀
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex justify-center items-center mb-4">
            <span className="text-2xl font-bold text-primary-400">Beer Team</span>
            <span className="ml-3 text-gray-200">Darts League Manager</span>
          </div>
          <p className="text-gray-300">
            Desarrollado con ❤️ para la comunidad de dardos
          </p>
        </div>
      </footer>
    </div>
  )
}
