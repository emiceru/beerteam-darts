'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface League {
  id: string
  name: string
  slug: string
  description: string
  rulesDescription: string
  status: string
  gameMode: string
  tournamentFormat: string
  maxParticipants: number | null
  registrationOpen: boolean
  registrationStart: string | null
  registrationEnd: string | null
  leagueStart: string | null
  leagueEnd: string | null
  season: {
    name: string
    year: number
  }
  competitionType: {
    name: string
    description: string
  }
  creator: {
    name: string
  }
  _count: {
    participants: number
  }
}

interface Participant {
  id: string
  status: string
  registeredAt: string
  user: {
    id: string
    name: string
    email: string
  }
  team?: {
    id: string
    name: string
    player1: {
      name: string
    }
    player2?: {
      name: string
    }
  }
}

interface Standing {
  id: string
  position: number
  wins: number
  draws: number
  losses: number
  points: number
  team: {
    id: string
    name: string
    player1: {
      name: string
    }
    player2?: {
      name: string
    }
  }
}

interface Match {
  id: string
  round: number
  matchNumber: number
  status: string
  scheduledAt: string | null
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
  score1: number | null
  score2: number | null
}

export default function LeaguePage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [league, setLeague] = useState<League | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [standings, setStandings] = useState<Standing[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [activeTab, setActiveTab] = useState<'info' | 'participants' | 'standings' | 'matches'>('info')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // Verificar autenticación
        const authResponse = await fetch('/api/auth/me')
        if (authResponse.ok) {
          const authData = await authResponse.json()
          setUser(authData.user)
        }

        // Cargar datos de la liga
        const [leagueRes, participantsRes, standingsRes, matchesRes] = await Promise.all([
          fetch(`/api/leagues/${id}`),
          fetch(`/api/leagues/${id}/participants`),
          fetch(`/api/leagues/${id}/standings`),
          fetch(`/api/leagues/${id}/matches`)
        ])

        if (leagueRes.ok) {
          const leagueData = await leagueRes.json()
          setLeague(leagueData.league)
        } else {
          setError('Liga no encontrada')
        }

        if (participantsRes.ok) {
          const participantsData = await participantsRes.json()
          setParticipants(participantsData.participants || [])
        }

        if (standingsRes.ok) {
          const standingsData = await standingsRes.json()
          setStandings(standingsData.standings || [])
        }

        if (matchesRes.ok) {
          const matchesData = await matchesRes.json()
          setMatches(matchesData.matches || [])
        }

      } catch (err) {
        setError('Error cargando la liga')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      loadData()
    }
  }, [id])

  const formatGameMode = (mode: string) => {
    const modes: Record<string, string> = {
      'INDIVIDUAL': 'Individual',
      'PAIRS': 'Parejas',
      'MIXED': 'Mixto'
    }
    return modes[mode] || mode
  }

  const formatTournamentFormat = (format: string) => {
    const formats: Record<string, string> = {
      'ROUND_ROBIN': 'Todos contra todos',
      'KNOCKOUT': 'Eliminación directa', 
      'HYBRID': 'Híbrido'
    }
    return formats[format] || format
  }

  const formatStatus = (status: string) => {
    const statuses: Record<string, string> = {
      'DRAFT': 'Borrador',
      'UPCOMING': 'Próxima',
      'ACTIVE': 'Activa',
      'FINISHED': 'Finalizada',
      'CANCELLED': 'Cancelada'
    }
    return statuses[status] || status
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'DRAFT': 'bg-yellow-100 text-yellow-800',
      'UPCOMING': 'bg-blue-100 text-blue-800',
      'ACTIVE': 'bg-green-100 text-green-800',
      'FINISHED': 'bg-gray-100 text-gray-800',
      'CANCELLED': 'bg-red-100 text-red-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Liga no encontrada</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Volver al inicio
          </Link>
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
              <Link href="/" className="flex items-center">
                <h1 className="text-2xl font-bold text-red-600">Beer Team</h1>
              </Link>
              <span className="mx-3 text-gray-400">/</span>
              <span className="text-lg text-gray-700">{league.name}</span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <Link
                  href={user.role === 'ADMIN' ? '/admin' : '/dashboard'}
                  className="text-gray-700 hover:text-red-600 transition-colors"
                >
                  {user.role === 'ADMIN' ? 'Panel Admin' : 'Dashboard'}
                </Link>
              ) : (
                <Link
                  href="/login"
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Liga Info Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{league.name}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(league.status)}`}>
                  {formatStatus(league.status)}
                </span>
                {league.registrationOpen && (
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    Inscripción abierta
                  </span>
                )}
              </div>
              <p className="text-gray-600 mb-4 max-w-3xl">{league.description}</p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Tipo:</span>
                  <div className="font-medium">{league.competitionType.name}</div>
                </div>
                <div>
                  <span className="text-gray-500">Modalidad:</span>
                  <div className="font-medium">{formatGameMode(league.gameMode)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Formato:</span>
                  <div className="font-medium">{formatTournamentFormat(league.tournamentFormat)}</div>
                </div>
                <div>
                  <span className="text-gray-500">Participantes:</span>
                  <div className="font-medium">
                    {league._count.participants}
                    {league.maxParticipants && ` / ${league.maxParticipants}`}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { key: 'info', label: 'Información', icon: '📋' },
              { key: 'participants', label: 'Participantes', icon: '👥' },
              { key: 'standings', label: 'Clasificación', icon: '🏆' },
              { key: 'matches', label: 'Partidos', icon: '🎯' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.key
                    ? 'border-red-500 text-red-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'info' && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Información de la Liga</h2>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Detalles</h3>
                <dl className="space-y-3">
                  <div>
                    <dt className="text-sm text-gray-500">Temporada</dt>
                    <dd className="text-sm font-medium text-gray-900">{league.season.name} ({league.season.year})</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-500">Creada por</dt>
                    <dd className="text-sm font-medium text-gray-900">{league.creator.name}</dd>
                  </div>
                  {league.leagueStart && (
                    <div>
                      <dt className="text-sm text-gray-500">Inicio de liga</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(league.leagueStart).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                  {league.leagueEnd && (
                    <div>
                      <dt className="text-sm text-gray-500">Fin de liga</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(league.leagueEnd).toLocaleDateString()}
                      </dd>
                    </div>
                  )}
                </dl>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-3">Descripción del tipo de competición</h3>
                <p className="text-gray-600 text-sm">{league.competitionType.description}</p>
                
                {league.rulesDescription && (
                  <>
                    <h3 className="text-lg font-medium text-gray-900 mb-3 mt-6">Reglas específicas</h3>
                    <div className="prose prose-sm text-gray-600">
                      {league.rulesDescription.split('\n').map((line, i) => (
                        <p key={i}>{line}</p>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'participants' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Participantes ({participants.length})
              </h2>
            </div>
            <div className="p-6">
              {participants.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">👥</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay participantes aún</h3>
                  <p className="text-gray-600">Los participantes aparecerán aquí cuando se inscriban</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {participants.map((participant) => (
                    <div key={participant.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900">
                          {participant.team ? participant.team.name : participant.user.name}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded ${
                          participant.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                          participant.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {participant.status}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {participant.team ? (
                          <div>
                            <div>{participant.team.player1.name}</div>
                            {participant.team.player2 && (
                              <div>{participant.team.player2.name}</div>
                            )}
                          </div>
                        ) : (
                          <div>{participant.user.email}</div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Inscrito: {new Date(participant.registeredAt).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'standings' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Clasificación</h2>
            </div>
            <div className="overflow-x-auto">
              {standings.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🏆</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay clasificación aún</h3>
                  <p className="text-gray-600">La clasificación aparecerá cuando se jueguen partidos</p>
                </div>
              ) : (
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pos
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Equipo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        V
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        E
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        D
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pts
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {standings.map((standing) => (
                      <tr key={standing.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {standing.position}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{standing.team.name}</div>
                          <div className="text-sm text-gray-500">
                            {standing.team.player1.name}
                            {standing.team.player2 && ` / ${standing.team.player2.name}`}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.wins}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.draws}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {standing.losses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {standing.points}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        )}

        {activeTab === 'matches' && (
          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Partidos</h2>
            </div>
            <div className="p-6">
              {matches.length === 0 ? (
                <div className="text-center py-8">
                  <span className="text-4xl mb-4 block">🎯</span>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No hay partidos programados</h3>
                  <p className="text-gray-600">Los partidos aparecerán cuando se genere el calendario</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {matches.map((match) => (
                    <div key={match.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div className="flex-1">
                          <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-500">
                              Jornada {match.round} - Partido {match.matchNumber}
                            </span>
                            <span className={`px-2 py-1 text-xs rounded ${
                              match.status === 'SCHEDULED' ? 'bg-blue-100 text-blue-800' :
                              match.status === 'IN_PROGRESS' ? 'bg-yellow-100 text-yellow-800' :
                              match.status === 'FINISHED' ? 'bg-green-100 text-green-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {match.status}
                            </span>
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="font-medium">{match.team1.name}</span>
                              <span className="text-gray-500">vs</span>
                              <span className="font-medium">{match.team2.name}</span>
                            </div>
                            {match.score1 !== null && match.score2 !== null && (
                              <div className="text-lg font-bold">
                                {match.score1} - {match.score2}
                              </div>
                            )}
                          </div>
                          {match.scheduledAt && (
                            <div className="mt-1 text-sm text-gray-500">
                              {new Date(match.scheduledAt).toLocaleString()}
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
        )}
      </main>
    </div>
  )
}