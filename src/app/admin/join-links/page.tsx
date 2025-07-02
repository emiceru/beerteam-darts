'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Logo from '@/components/logo'

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
  status: string
  registrationOpen: boolean
}

interface JoinLink {
  id: string
  code: string
  leagueId: string
  isActive: boolean
  expiresAt: string | null
  maxUses: number | null
  currentUses: number
  createdAt: string
  league: League
}

interface CreateLinkForm {
  leagueId: string
  expiresAt: string
  maxUses: string
}

export default function JoinLinksManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [joinLinks, setJoinLinks] = useState<JoinLink[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [createForm, setCreateForm] = useState<CreateLinkForm>({
    leagueId: '',
    expiresAt: '',
    maxUses: ''
  })

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
        
        setUser(data.user)
      } catch {
        router.push('/login')
      }
    }

    const loadData = async () => {
      try {
        // Cargar ligas
        const leaguesResponse = await fetch('/api/leagues/simple')
        if (leaguesResponse.ok) {
          const leaguesData = await leaguesResponse.json()
          setLeagues(leaguesData.leagues || [])
        }

        // Cargar enlaces de inscripción
        const linksResponse = await fetch('/api/join-links')
        if (linksResponse.ok) {
          const linksData = await linksResponse.json()
          setJoinLinks(linksData.joinLinks || [])
        }
      } catch (error) {
        console.error('Error cargando datos:', error)
        setError('Error cargando datos')
      } finally {
        setLoading(false)
      }
    }

    checkAuth().then(() => {
      loadData()
    })
  }, [router])

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError('')

    try {
      const requestData: { leagueId: string; expiresAt?: string; maxUses?: number } = {
        leagueId: createForm.leagueId
      }

      if (createForm.expiresAt) {
        requestData.expiresAt = new Date(createForm.expiresAt).toISOString()
      }

      if (createForm.maxUses) {
        requestData.maxUses = parseInt(createForm.maxUses)
      }

      const response = await fetch('/api/join-links', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Enlace creado exitosamente')
        setShowCreateForm(false)
        setCreateForm({ leagueId: '', expiresAt: '', maxUses: '' })
        
        // Recargar enlaces
        const linksResponse = await fetch('/api/join-links')
        if (linksResponse.ok) {
          const linksData = await linksResponse.json()
          setJoinLinks(linksData.joinLinks || [])
        }
      } else {
        setError(data.error || 'Error creando enlace')
      }
    } catch {
      setError('Error de conexión')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = async (code: string) => {
    const url = `${window.location.origin}/join/${code}`
    try {
      await navigator.clipboard.writeText(url)
      setSuccess('Enlace copiado al portapapeles')
    } catch {
      setError('Error copiando enlace')
    }
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignorar error
    }
    router.push('/login')
  }

  const filteredLinks = selectedLeague 
    ? joinLinks.filter(link => link.leagueId === selectedLeague)
    : joinLinks

  const openRegistrationLeagues = leagues.filter(league => league.registrationOpen)

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando enlaces...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/admin" className="flex items-center">
                <Logo size="lg" showText={false} />
                <span className="ml-3 text-lg text-gray-700">Enlaces de Inscripción</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user?.name}</span>
              <button
                onClick={logout}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesión
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/admin" className="text-gray-700 hover:text-primary-600 inline-flex items-center">
                Panel Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Enlaces de Inscripción</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <p className="text-primary-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Lista de Enlaces */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Enlaces de Inscripción ({filteredLinks.length})
                  </h2>
                  
                  {/* Filtro por liga */}
                  <select
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
                  >
                    <option value="">Todas las ligas</option>
                    {leagues.map(league => (
                      <option key={league.id} value={league.id}>
                        {league.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button
                  onClick={() => setShowCreateForm(!showCreateForm)}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  + Nuevo Enlace
                </button>
              </div>

              {/* Formulario de creación */}
              {showCreateForm && (
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <form onSubmit={handleCreateLink} className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Liga *
                      </label>
                      <select
                        value={createForm.leagueId}
                        onChange={(e) => setCreateForm({ ...createForm, leagueId: e.target.value })}
                        className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar liga</option>
                        {openRegistrationLeagues.map(league => (
                          <option key={league.id} value={league.id}>
                            {league.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de expiración (opcional)
                      </label>
                      <input
                        type="datetime-local"
                        value={createForm.expiresAt}
                        onChange={(e) => setCreateForm({ ...createForm, expiresAt: e.target.value })}
                        className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Máximo de usos (opcional)
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={createForm.maxUses}
                        onChange={(e) => setCreateForm({ ...createForm, maxUses: e.target.value })}
                        className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ilimitado"
                      />
                    </div>

                    <div className="flex items-end space-x-2">
                      <button
                        type="submit"
                        disabled={creating}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {creating ? 'Creando...' : 'Crear Enlace'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCreateForm(false)}
                        className="border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Lista de enlaces */}
              <div className="p-6">
                {filteredLinks.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-2xl">🔗</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No hay enlaces de inscripción
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Crea enlaces únicos para permitir inscripción pública a las ligas
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredLinks.map((link) => (
                      <div
                        key={link.id}
                        className={`border rounded-lg p-4 ${
                          link.isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">{link.league.name}</h4>
                              <span className={`px-2 py-1 text-xs rounded ${
                                link.isActive ? 'bg-green-100 text-green-800' : 'bg-primary-100 text-primary-800'
                              }`}>
                                {link.isActive ? 'Activo' : 'Inactivo'}
                              </span>
                            </div>
                            
                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Código:</strong> {link.code}</p>
                              <p><strong>URL:</strong> 
                                <code className="ml-2 px-2 py-1 bg-gray-100 rounded text-xs">
                                  /join/{link.code}
                                </code>
                              </p>
                              <div className="flex items-center space-x-4">
                                <span><strong>Usos:</strong> {link.currentUses}{link.maxUses ? ` / ${link.maxUses}` : ' (ilimitado)'}</span>
                                {link.expiresAt && (
                                  <span><strong>Expira:</strong> {new Date(link.expiresAt).toLocaleDateString('es-ES')}</span>
                                )}
                                <span><strong>Creado:</strong> {new Date(link.createdAt).toLocaleDateString('es-ES')}</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex space-x-2">
                            <button
                              onClick={() => copyToClipboard(link.code)}
                              className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                            >
                              Copiar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Panel Lateral */}
          <div className="space-y-6">
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Estadísticas</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total enlaces:</span>
                  <span className="font-semibold">{joinLinks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Enlaces activos:</span>
                  <span className="font-semibold text-green-600">
                    {joinLinks.filter(link => link.isActive).length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total usos:</span>
                  <span className="font-semibold">
                    {joinLinks.reduce((sum, link) => sum + link.currentUses, 0)}
                  </span>
                </div>
              </div>
            </div>

            {/* Ayuda */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">💡 Cómo funciona</h3>
              <div className="text-sm text-gray-700 space-y-2">
                <p>Los enlaces de inscripción permiten que cualquier persona se inscriba en una liga sin necesidad de crear una cuenta primero.</p>
                <p><strong>Características:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Códigos únicos y seguros</li>
                  <li>Límite de usos opcional</li>
                  <li>Fecha de expiración opcional</li>
                  <li>Activación/desactivación instantánea</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 