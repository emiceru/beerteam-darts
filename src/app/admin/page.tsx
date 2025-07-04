'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { PushNotifications } from '@/components/push-notifications'
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
  isPublic: boolean
  registrationOpen: boolean
  createdAt: string
  season: {
    name: string
  }
  competitionType: {
    name: string
  }
  creator: {
    name: string
  }
}

export default function AdminDashboard() {
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
        
        // Solo admin puede acceder
        if (data.user.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        
        setUser(data.user)
      } catch {
        router.push('/login')
      }
    }

    const loadLeagues = async () => {
      try {
        const response = await fetch('/api/leagues/simple')
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
      loadLeagues()
    })
  }, [router])



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando panel admin...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header title="Panel de Administración" subtitle="Gestión completa de ligas y usuarios" />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Banner de Nueva Liga */}
        <div className="bg-gradient-to-r from-primary-500 to-secondary-500 rounded-xl shadow-lg p-6 mb-8 text-white">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <h2 className="text-2xl font-bold mb-2">🚀 ¡Crea una Nueva Liga!</h2>
              <p className="text-primary-100">Organiza tu próximo torneo de dardos de forma fácil y profesional</p>
            </div>
            <Link
              href="/admin/leagues/create"
              className="bg-white text-primary-600 hover:bg-primary-50 px-8 py-4 rounded-lg font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 whitespace-nowrap"
            >
              ✨ Crear Liga Ahora
            </Link>
          </div>
        </div>

        {/* Welcome Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Panel de Administración 👨‍💼
          </h2>
          <p className="text-gray-600">
            Gestiona ligas, usuarios y configuraciones de la plataforma.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Ligas</p>
                <p className="text-2xl font-bold text-gray-900">{leagues.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Ligas Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leagues.filter(l => l.status === 'ACTIVE').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📋</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">En Borrador</p>
                <p className="text-2xl font-bold text-gray-900">
                  {leagues.filter(l => l.status === 'DRAFT').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">👥</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Jugadores</p>
                <p className="text-2xl font-bold text-gray-900">-</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Gestión de Ligas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Gestión de Ligas</h3>
                <Link
                  href="/admin/leagues/create"
                  className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                >
                  ✨ + Nueva Liga
                </Link>
              </div>
              <div className="p-6">
                {leagues.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🏆</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No hay ligas creadas
                    </h4>
                    <p className="text-gray-600 mb-4">
                      Crea tu primera liga para empezar
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {leagues.slice(0, 5).map((league) => (
                      <div
                        key={league.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{league.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                league.status === 'UPCOMING' ? 'bg-blue-100 text-blue-800' :
                                league.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {league.status}
                              </span>
                              {league.isPublic && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  Pública
                                </span>
                              )}
                              {league.registrationOpen && (
                                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded">
                                  Inscripción abierta
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{league.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span>{league.competitionType.name}</span>
                              <span>•</span>
                              <span>{league.season.name}</span>
                              <span>•</span>
                              <span>Creada por {league.creator.name}</span>
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <Link
                              href={`/stats/league/${league.id}`}
                              className="text-purple-600 hover:text-purple-700 text-sm font-medium"
                            >
                              📊 Stats
                            </Link>
                            <Link
                              href={`/admin/leagues/${league.id}/edit`}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Editar
                            </Link>
                            <Link
                              href={`/leagues/${league.id}`}
                              className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                            >
                              Ver →
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                    {leagues.length > 5 && (
                      <div className="text-center pt-4">
                        <Link
                          href="/admin/leagues"
                          className="text-primary-600 hover:text-primary-700 font-medium"
                        >
                          Ver todas las ligas ({leagues.length}) →
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Menu Lateral */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Acciones Rápidas</h3>
              <div className="space-y-3">
                <Link
                  href="/admin/leagues/create"
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white text-center py-3 px-4 rounded-lg font-semibold shadow-md hover:shadow-lg transition-all duration-200"
                >
                  🎯 Nueva Liga
                </Link>
                <Link
                  href="/admin/join-links"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Enlaces de Inscripción
                </Link>
                <Link
                  href="/admin/matches"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Gestionar Partidos
                </Link>
                <Link
                  href="/admin/users"
                  className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Gestionar Usuarios
                </Link>
                <Link
                  href="/admin/seasons"
                  className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Temporadas
                </Link>
                <Link
                  href="/admin/settings"
                  className="block w-full border border-gray-300 text-gray-700 hover:bg-gray-50 text-center py-2 px-4 rounded-lg transition-colors"
                >
                  Configuración
                </Link>
              </div>
            </div>

            {/* Notificaciones Push */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📱 Notificaciones Push</h3>
              <p className="text-gray-600 text-sm mb-4">
                Recibe notificaciones administrativas y mantente conectado con la actividad de las ligas.
              </p>
              <PushNotifications userId={user?.id} className="w-full mb-4" />
              
              {/* Área para enviar notificaciones */}
              <div className="border-t pt-4 mt-4">
                <Link
                  href="/admin/notifications"
                  className="block w-full bg-yellow-600 hover:bg-yellow-700 text-white text-center py-2 px-4 rounded-lg transition-colors text-sm"
                >
                  📢 Enviar Notificación
                </Link>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Reciente</h3>
              <div className="space-y-3 text-sm">
                <p className="text-gray-600">No hay actividad reciente</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 