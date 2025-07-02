'use client'

import { useState, useEffect } from 'react'
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

interface Participant {
  id: string
  status: string
  joinedAt: string
  registrationData: any
  user: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
  }
  approvedAt?: string
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LeagueParticipants({ params }: PageProps) {
  const [user, setUser] = useState<User | null>(null)
  const [league, setLeague] = useState<League | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [loading, setLoading] = useState(true)
  const [leagueId, setLeagueId] = useState<string>('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    const initPage = async () => {
      const resolvedParams = await params
      setLeagueId(resolvedParams.id)
      
      await checkAuth()
      await loadLeague(resolvedParams.id)
      await loadParticipants(resolvedParams.id)
      setLoading(false)
    }

    initPage()
  }, [params])

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

  const loadLeague = async (id: string) => {
    try {
      const response = await fetch(`/api/leagues/${id}`)
      if (response.ok) {
        const data = await response.json()
        setLeague(data.league)
      }
    } catch (error) {
      console.error('Error loading league:', error)
    }
  }

  const loadParticipants = async (id: string) => {
    try {
      const response = await fetch(`/api/leagues/${id}/participants`)
      if (response.ok) {
        const data = await response.json()
        setParticipants(data.participants || [])
      }
    } catch (error) {
      console.error('Error loading participants:', error)
    }
  }

  const handleParticipantAction = async (participantId: string, action: string, reason?: string, notes?: string) => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/participants/${participantId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, reason, notes }),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        await loadParticipants(leagueId)
      } else {
        setError(data.error || 'Error actualizando participante')
      }
    } catch {
      setError('Error de conexion')
    }
  }

  const deleteParticipant = async (participantId: string) => {
    if (!confirm('¿Estas seguro de eliminar este participante?')) {
      return
    }

    try {
      const response = await fetch(`/api/leagues/${leagueId}/participants/${participantId}`, {
        method: 'DELETE',
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        await loadParticipants(leagueId)
      } else {
        setError(data.error || 'Error eliminando participante')
      }
    } catch {
      setError('Error de conexion')
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 text-yellow-800',
      'APPROVED': 'bg-green-100 text-green-800',
      'REJECTED': 'bg-primary-100 text-primary-800',
      'WITHDRAWN': 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const getStatusText = (status: string) => {
    const texts: Record<string, string> = {
      'PENDING': 'Pendiente',
      'APPROVED': 'Aprobado',
      'REJECTED': 'Rechazado',
      'WITHDRAWN': 'Retirado'
    }
    return texts[status] || status
  }

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' })
    } catch {
      // Ignorar error
    }
    router.push('/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando participantes...</p>
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
                <span className="ml-3 text-lg text-gray-700">Participantes</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user?.name}</span>
              <button
                onClick={logout}
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesion
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
              <Link href="/admin" className="text-gray-700 hover:text-primary-600">
                Panel Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">{league?.name || 'Liga'}</span>
              </div>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Participantes</span>
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

        {/* League Info */}
        {league && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">{league.name}</h2>
            <p className="text-gray-600">Gestion de participantes de la liga</p>
          </div>
        )}

        {/* Participants List */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">
              Participantes ({participants.length})
            </h3>
          </div>

          {participants.length === 0 ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">👥</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay participantes
              </h3>
              <p className="text-gray-600">
                Aun no se han registrado participantes en esta liga.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {participants.map((participant) => (
                <div key={participant.id} className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {participant.user.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-medium text-gray-900">
                          {participant.user.name}
                        </h4>
                        <p className="text-sm text-gray-600">{participant.user.email}</p>
                        <p className="text-xs text-gray-500">
                          Registrado: {new Date(participant.joinedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 text-xs rounded ${getStatusColor(participant.status)}`}>
                        {getStatusText(participant.status)}
                      </span>

                      {participant.status === 'PENDING' && (
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleParticipantAction(participant.id, 'approve')}
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Aprobar
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Razon del rechazo (opcional):')
                              handleParticipantAction(participant.id, 'reject', reason || undefined)
                            }}
                            className="bg-primary-600 hover:bg-primary-700 text-white px-3 py-1 rounded text-sm"
                          >
                            Rechazar
                          </button>
                        </div>
                      )}

                      {participant.status === 'APPROVED' && (
                        <button
                          onClick={() => {
                            const reason = prompt('Razon de la retirada (opcional):')
                            handleParticipantAction(participant.id, 'withdraw', reason || undefined)
                          }}
                          className="bg-yellow-600 hover:bg-yellow-700 text-white px-3 py-1 rounded text-sm"
                        >
                          Retirar
                        </button>
                      )}

                      <button
                        onClick={() => deleteParticipant(participant.id)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>

                  {participant.approver && (
                    <div className="mt-3 pl-14">
                      <p className="text-xs text-gray-500">
                        {participant.status === 'APPROVED' ? 'Aprobado' : 'Procesado'} por{' '}
                        {participant.approver.name} el{' '}
                        {participant.approvedAt ? new Date(participant.approvedAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
