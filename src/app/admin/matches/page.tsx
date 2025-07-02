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
}

interface Match {
  id: string
  round: number
  matchNumber: number
  status: string
  scheduledDate: string | null
  actualDate: string | null
  team1Score: number | null
  team2Score: number | null
  league: {
    id: string
    name: string
    slug: string
  }
  team1: {
    id: string
    name: string
  }
  team2: {
    id: string
    name: string
  }
  winnerTeam?: {
    id: string
    name: string
  }
}

export default function MatchesManagement() {
  const [user, setUser] = useState<User | null>(null)
  const [leagues, setLeagues] = useState<League[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [selectedLeague, setSelectedLeague] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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

        // Cargar todos los partidos si no hay liga seleccionada
        const matchesResponse = await fetch('/api/admin/matches')
        if (matchesResponse.ok) {
          const matchesData = await matchesResponse.json()
          setMatches(matchesData.matches || [])
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

  const loadMatchesForLeague = async (leagueId: string) => {
    if (!leagueId) {
      // Cargar todos los partidos
      const response = await fetch('/api/admin/matches')
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
      return
    }

    try {
      const response = await fetch(`/api/admin/matches?leagueId=${leagueId}`)
      if (response.ok) {
        const data = await response.json()
        setMatches(data.matches || [])
      }
    } catch (error) {
      console.error('Error cargando partidos:', error)
    }
  }

  const generateMatches = async (leagueId: string) => {
    try {
      const response = await fetch('/api/admin/matches/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leagueId }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(`Se generaron ${data.matchesCreated} partidos`)
        await loadMatchesForLeague(selectedLeague)
      } else {
        setError(data.error || 'Error generando partidos')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const updateMatchResult = async (matchId: string, team1Score: number, team2Score: number) => {
    try {
      const response = await fetch(`/api/admin/matches/${matchId}/result`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ team1Score, team2Score }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Resultado actualizado')
        await loadMatchesForLeague(selectedLeague)
      } else {
        setError(data.error || 'Error actualizando resultado')
      }
    } catch {
      setError('Error de conexión')
    }
  }

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      'SCHEDULED': 'Programado',
      'IN_PROGRESS': 'En progreso',
      'FINISHED': 'Finalizado',
      'CANCELLED': 'Cancelado'
    }
    return statuses[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'SCHEDULED': 'bg-blue-100 text-blue-800',
      'IN_PROGRESS': 'bg-yellow-100 text-yellow-800',
      'FINISHED': 'bg-green-100 text-green-800',
      'CANCELLED': 'bg-primary-100 text-primary-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignorar error
    }
    router.push('/login')
  }

  const filteredMatches = selectedLeague 
    ? matches.filter(match => match.league.id === selectedLeague)
    : matches

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando partidos...</p>
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
                <span className="ml-3 text-lg text-gray-700">Admin Panel</span>
              </Link>
              <span className="mx-3 text-gray-400">/</span>
              <span className="text-lg text-gray-700">Gestión de Partidos</span>
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
        {/* Success/Error Messages */}
        {success && (
          <div className="mb-6 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        {error && (
          <div className="mb-6 bg-primary-100 border border-primary-400 text-primary-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-4">
              <label htmlFor="league-select" className="text-sm font-medium text-gray-700">
                Filtrar por liga:
              </label>
              <select
                id="league-select"
                value={selectedLeague}
                onChange={(e) => {
                  setSelectedLeague(e.target.value)
                  loadMatchesForLeague(e.target.value)
                }}
                className="border text-gray-900 border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="">Todas las ligas</option>
                {leagues.map((league) => (
                  <option key={league.id} value={league.id}>
                    {league.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedLeague && (
              <button
                onClick={() => generateMatches(selectedLeague)}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Generar Partidos
              </button>
            )}
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              Partidos ({filteredMatches.length})
            </h2>
          </div>
          <div className="p-6">
            {filteredMatches.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🎯</span>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No hay partidos
                </h3>
                <p className="text-gray-600 mb-4">
                  {selectedLeague 
                    ? 'Genera partidos para esta liga o selecciona otra liga'
                    : 'Selecciona una liga para ver o generar partidos'
                  }
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredMatches.map((match) => (
                  <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4 mb-2">
                          <span className="text-sm text-gray-500">
                            {match.league.name} - Jornada {match.round} - Partido {match.matchNumber}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded ${getStatusColor(match.status)}`}>
                            {formatStatus(match.status)}
                          </span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <span className="font-medium">{match.team1.name}</span>
                            <span className="text-gray-500">vs</span>
                            <span className="font-medium">{match.team2.name}</span>
                          </div>
                          
                          {match.status === 'FINISHED' && match.team1Score !== null && match.team2Score !== null ? (
                            <div className="text-lg font-bold">
                              {match.team1Score} - {match.team2Score}
                            </div>
                          ) : match.status === 'SCHEDULED' ? (
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                placeholder="0"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                id={`score1-${match.id}`}
                              />
                              <span>-</span>
                              <input
                                type="number"
                                placeholder="0"
                                className="w-16 px-2 py-1 border border-gray-300 rounded text-center"
                                id={`score2-${match.id}`}
                              />
                              <button
                                onClick={() => {
                                  const score1Input = document.getElementById(`score1-${match.id}`) as HTMLInputElement
                                  const score2Input = document.getElementById(`score2-${match.id}`) as HTMLInputElement
                                  const score1 = parseInt(score1Input.value) || 0
                                  const score2 = parseInt(score2Input.value) || 0
                                  updateMatchResult(match.id, score1, score2)
                                }}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm"
                              >
                                Registrar
                              </button>
                            </div>
                          ) : null}
                        </div>

                        {match.scheduledDate && (
                          <div className="mt-2 text-sm text-gray-500">
                            Programado: {new Date(match.scheduledDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
} 