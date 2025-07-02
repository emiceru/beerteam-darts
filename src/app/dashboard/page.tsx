'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'


interface User {
  id: string
  email: string
  name: string
  role: string
}

interface League {
  id: string
  name: string
  slug: string
  description: string
  status: string
  gameMode: string
  tournamentFormat: string
  season: {
    name: string
  }
  competitionType: {
    name: string
  }
}

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/me')
        if (!response.ok) {
          router.push('/login')
          return
        }
        const data = await response.json()
        
        // Si es admin, redirigir a panel admin
        if (data.user.role === 'ADMIN') {
          router.push('/admin')
          return
        }
        
        setUser(data.user)
      } catch {
        router.push('/login')
      }
    }

    const loadLeagues = async () => {
      try {
        const response = await fetch('/api/users/me/leagues')
        if (response.ok) {
          const data = await response.json()
          setLeagues(data.leagues || [])
        }
      } catch (error) {
        console.error('Error cargando ligas:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth().then(() => {
      if (user) {
        loadLeagues()
      }
    })
  }, [router, user])



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header title="Mi Dashboard" subtitle="Gestiona tus ligas y estadísticas" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                ¡Bienvenido, {user?.name}! 🎯
              </h2>
              <p className="text-gray-600">
                Desde aquí puedes ver tus ligas, estadísticas y próximos partidos.
              </p>
            </div>
            <Link
              href={`/stats/player/${user?.id}`}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg transition-all duration-200 font-semibold flex items-center space-x-2"
            >
              <span>📊</span>
              <span>Mis Estadísticas</span>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Mis Ligas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Mis Ligas</h3>
              </div>
              <div className="p-6">
                {leagues.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🎯</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No estás en ninguna liga aún
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Únete a una liga para empezar a competir
                    </p>
                    <Link
                      href="/leagues"
                      className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg transition-colors inline-block"
                    >
                      Explorar Ligas
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leagues.map((league) => (
                      <div
                        key={league.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{league.name}</h4>
                            <p className="text-sm text-gray-600 mt-1">{league.description}</p>
                            <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                              <span>{league.competitionType.name}</span>
                              <span>•</span>
                              <span>{league.season.name}</span>
                              <span>•</span>
                              <span className={`px-2 py-1 rounded ${
                                league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                league.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {league.status}
                              </span>
                            </div>
                          </div>
                          <Link
                            href={`/leagues/${league.slug}`}
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            Ver detalles →
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas Rápidas</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Ligas Activas</span>
                  <span className="font-semibold">{leagues.filter(l => l.status === 'ACTIVE').length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Ligas</span>
                  <span className="font-semibold">{leagues.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Partidos Jugados</span>
                  <span className="font-semibold">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Victorias</span>
                  <span className="font-semibold">-</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/leagues"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Explorar Ligas
                </Link>
                <Link
                  href="/profile"
                  className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Mi Perfil
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 