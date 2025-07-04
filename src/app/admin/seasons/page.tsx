'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/components/header'

interface Season {
  id: string
  name: string
  year: number
  startDate: string | null
  endDate: string | null
  isActive: boolean
  createdAt: string
  leaguesCount: number
}

export default function AdminSeasons() {
  const [, setCurrentUser] = useState<any>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newSeason, setNewSeason] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: ''
  })
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
        
        if (data.user.role !== 'ADMIN') {
          router.push('/dashboard')
          return
        }
        
        setCurrentUser(data.user)
      } catch {
        router.push('/login')
      }
    }

    const loadSeasons = async () => {
      try {
        const response = await fetch('/api/admin/seasons')
        if (response.ok) {
          const data = await response.json()
          setSeasons(data.seasons || [])
        }
      } catch (error) {
        console.error('Error cargando temporadas:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth().then(() => {
      loadSeasons()
    })
  }, [router])

  const handleCreateSeason = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      const response = await fetch('/api/admin/seasons', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSeason),
      })

      if (response.ok) {
        const data = await response.json()
        setSeasons([data.season, ...seasons])
        setNewSeason({ name: '', description: '', startDate: '', endDate: '' })
        alert('Temporada creada exitosamente')
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creando temporada:', error)
      alert('Error interno del servidor')
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando temporadas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      <Header title="Gestión de Temporadas" subtitle="Organiza tus torneos por temporadas" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-8" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/admin" className="text-gray-700 hover:text-gray-900">
                Panel Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="text-gray-400">/</span>
                <span className="ml-1 text-gray-500 md:ml-2">Temporadas</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Temporadas</p>
                <p className="text-2xl font-bold text-gray-900">{seasons.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">✅</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Activas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seasons.filter(s => s.isActive).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">🏆</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Con Ligas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seasons.filter(s => s.leaguesCount > 0).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-xl">📊</span>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Ligas</p>
                <p className="text-2xl font-bold text-gray-900">
                  {seasons.reduce((acc, s) => acc + s.leaguesCount, 0)}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Crear Nueva Temporada */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                ➕ Nueva Temporada
              </h3>
              <form onSubmit={handleCreateSeason} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={newSeason.name}
                    onChange={(e) => setNewSeason({...newSeason, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Ej: Temporada 2024-2025"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={newSeason.description}
                    onChange={(e) => setNewSeason({...newSeason, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    placeholder="Descripción opcional..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Inicio
                  </label>
                  <input
                    type="date"
                    value={newSeason.startDate}
                    onChange={(e) => setNewSeason({...newSeason, startDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Fin
                  </label>
                  <input
                    type="date"
                    value={newSeason.endDate}
                    onChange={(e) => setNewSeason({...newSeason, endDate: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
                <button
                  type="submit"
                  disabled={creating}
                  className="w-full bg-primary-600 hover:bg-primary-700 text-white py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
                >
                  {creating ? 'Creando...' : 'Crear Temporada'}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Temporadas */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Temporadas Existentes</h3>
              </div>
              <div className="p-6">
                {seasons.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">📅</span>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">
                      No hay temporadas creadas
                    </h4>
                    <p className="text-gray-600">
                      Crea tu primera temporada para organizar las ligas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {seasons.map((season) => (
                      <div
                        key={season.id}
                        className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{season.name}</h4>
                              {season.isActive && (
                                <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                                  Activa
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <span>Año {season.year}</span>
                              {season.startDate && (
                                <>
                                  <span>•</span>
                                  <span>
                                    {new Date(season.startDate).toLocaleDateString()} 
                                    {season.endDate && ` - ${new Date(season.endDate).toLocaleDateString()}`}
                                  </span>
                                </>
                              )}
                            </div>
                            <div className="text-sm text-gray-600">
                              {season.leaguesCount} liga{season.leaguesCount !== 1 ? 's' : ''} asociada{season.leaguesCount !== 1 ? 's' : ''}
                            </div>
                          </div>
                          <div className="flex space-x-2">
                            <span className="text-xs text-gray-500">
                              Creada: {new Date(season.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 