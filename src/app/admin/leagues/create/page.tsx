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

interface Season {
  id: string
  name: string
  year: number
  isActive: boolean
}

interface CompetitionType {
  id: string
  name: string
  slug: string
  description: string
  rulesDescription: string
}

interface FormData {
  // Informacion basica
  name: string
  description: string
  rulesDescription: string
  seasonId: string
  newSeasonName: string
  competitionTypeId: string
  
  // Configuracion de juego
  gameMode: 'INDIVIDUAL' | 'PAIRS' | 'MIXED'
  tournamentFormat: 'ROUND_ROBIN' | 'KNOCKOUT' | 'HYBRID'
  maxParticipants: string
  autoApproveRegistrations: boolean
  
  // Fechas
  registrationStart: string
  registrationEnd: string
  leagueStart: string
  leagueEnd: string
  
  // Puntuacion
  pointsWin: string
  pointsDraw: string
  pointsLoss: string
  
  // Datos de partido
  trackDetailedScore: boolean
  trackGameByGame: boolean
  trackThrowCount: boolean
  trackTime: boolean
}

export default function CreateLeague() {
  const [user, setUser] = useState<User | null>(null)
  const [seasons, setSeasons] = useState<Season[]>([])
  const [competitionTypes, setCompetitionTypes] = useState<CompetitionType[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    rulesDescription: '',
    seasonId: '',
    newSeasonName: '',
    competitionTypeId: '',
    gameMode: 'INDIVIDUAL',
    tournamentFormat: 'ROUND_ROBIN',
    maxParticipants: '',
    autoApproveRegistrations: true,
    registrationStart: '',
    registrationEnd: '',
    leagueStart: '',
    leagueEnd: '',
    pointsWin: '3',
    pointsDraw: '1',
    pointsLoss: '0',
    trackDetailedScore: true,
    trackGameByGame: true,
    trackThrowCount: false,
    trackTime: false,
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
        // Cargar temporadas
        const seasonsResponse = await fetch('/api/admin/seasons')
        if (seasonsResponse.ok) {
          const seasonsData = await seasonsResponse.json()
          setSeasons(seasonsData.seasons || [])
        }

        // Cargar tipos de competicion
        const typesResponse = await fetch('/api/competition-types')
        if (typesResponse.ok) {
          const typesData = await typesResponse.json()
          setCompetitionTypes(typesData.competitionTypes || [])
        }

        // Establecer fechas por defecto
        const today = new Date()
        const tomorrow = new Date(today)
        tomorrow.setDate(today.getDate() + 1)
        
        const regEnd = new Date(today)
        regEnd.setDate(today.getDate() + 30)
        
        const leagueStart = new Date(regEnd)
        leagueStart.setDate(regEnd.getDate() + 7)
        
        const leagueEnd = new Date(leagueStart)
        leagueEnd.setDate(leagueStart.getDate() + 60)

        setFormData(prev => ({
          ...prev,
          registrationStart: tomorrow.toISOString().split('T')[0],
          registrationEnd: regEnd.toISOString().split('T')[0],
          leagueStart: leagueStart.toISOString().split('T')[0],
          leagueEnd: leagueEnd.toISOString().split('T')[0],
        }))

      } catch {
        console.error('Error cargando datos')
        setError('Error cargando datos necesarios')
      } finally {
        setLoading(false)
      }
    }

    checkAuth().then(() => {
      loadData()
    })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      // Validar que si no hay temporada seleccionada, al menos haya nombre de nueva temporada
      if (!formData.seasonId && !formData.newSeasonName) {
        setError('Debes seleccionar una temporada existente o crear una nueva')
        setSubmitting(false)
        return
      }

      // Si se está creando nueva temporada, validar el nombre
      if (formData.seasonId === 'new' && !formData.newSeasonName.trim()) {
        setError('Debes especificar el nombre de la nueva temporada')
        setSubmitting(false)
        return
      }

      // Preparar datos para envio
      const submitData = {
        ...formData,
        maxParticipants: formData.maxParticipants && formData.maxParticipants.trim() !== '' ? parseInt(formData.maxParticipants) : null,
        pointsWin: parseInt(formData.pointsWin),
        pointsDraw: parseInt(formData.pointsDraw),
        pointsLoss: parseInt(formData.pointsLoss),
        registrationStart: `${formData.registrationStart}T00:00:00.000Z`,
        registrationEnd: `${formData.registrationEnd}T23:59:59.000Z`,
        leagueStart: `${formData.leagueStart}T00:00:00.000Z`,
        leagueEnd: `${formData.leagueEnd}T23:59:59.000Z`,
        // Si seasonId es 'new', se enviará junto con newSeasonName para que el backend maneje la creación
        seasonId: formData.seasonId || null,
        newSeasonName: formData.seasonId === 'new' ? formData.newSeasonName.trim() : undefined,
      }

      const response = await fetch('/api/leagues/simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess('Liga creada exitosamente')
        setTimeout(() => {
          router.push('/admin')
        }, 2000)
      } else {
        setError(data.error || 'Error creando la liga')
        if (data.details) {
          console.error('Detalles del error:', data.details)
        }
      }
    } catch {
      setError('Error de conexion')
    } finally {
      setSubmitting(false)
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-fuchsia-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando formulario...</p>
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
                <span className="ml-3 text-lg text-gray-700">Nueva Liga</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Admin: {user?.name}</span>
              <button
                onClick={logout}
                className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Cerrar Sesion
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex mb-6" aria-label="Breadcrumb">
          <ol className="inline-flex items-center space-x-1 md:space-x-3">
            <li className="inline-flex items-center">
              <Link href="/admin" className="text-gray-700 hover:text-fuchsia-600 inline-flex items-center">
                Panel Admin
              </Link>
            </li>
            <li>
              <div className="flex items-center">
                <span className="mx-2 text-gray-400">/</span>
                <span className="text-gray-500">Nueva Liga</span>
              </div>
            </li>
          </ol>
        </nav>

        {/* Alerts */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600">{success}</p>
          </div>
        )}

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Crear Nueva Liga</h2>
            <p className="text-sm text-gray-600 mt-1">Completa todos los campos para crear una nueva liga de dardos.</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            {/* Informacion Basica */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Informacion Basica</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre de la Liga *
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                    placeholder="Ej: Liga de Dardos Primavera 2024"
                  />
                </div>

                <div>
                  <label htmlFor="seasonId" className="block text-sm font-medium text-gray-700 mb-2">
                    Temporada
                  </label>
                  <select
                    id="seasonId"
                    value={formData.seasonId}
                    onChange={(e) => setFormData({ ...formData, seasonId: e.target.value, newSeasonName: e.target.value === 'new' ? formData.newSeasonName : '' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                  >
                    <option value="">Seleccionar temporada existente</option>
                    {seasons.map(season => (
                      <option key={season.id} value={season.id}>
                        {season.name} {season.year} {season.isActive && '(Activa)'}
                      </option>
                    ))}
                    <option value="new">+ Crear nueva temporada</option>
                  </select>
                  
                  {formData.seasonId === 'new' && (
                    <div className="mt-3">
                      <label htmlFor="newSeasonName" className="block text-sm font-medium text-gray-700 mb-2">
                        Nombre de la nueva temporada *
                      </label>
                      <input
                        type="text"
                        id="newSeasonName"
                        value={formData.newSeasonName}
                        onChange={(e) => setFormData({ ...formData, newSeasonName: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                        required={formData.seasonId === 'new'}
                        placeholder="Ej: Temporada Verano 2024"
                      />
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="competitionTypeId" className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Competicion *
                  </label>
                  <select
                    id="competitionTypeId"
                    value={formData.competitionTypeId}
                    onChange={(e) => setFormData({ ...formData, competitionTypeId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  >
                    <option value="">Seleccionar tipo de competicion</option>
                    {competitionTypes.map(type => (
                      <option key={type.id} value={type.id}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="maxParticipants" className="block text-sm font-medium text-gray-700 mb-2">
                    Maximo de Participantes
                  </label>
                  <input
                    type="number"
                    id="maxParticipants"
                    min="2"
                    max="1000"
                    value={formData.maxParticipants}
                    onChange={(e) => setFormData({ ...formData, maxParticipants: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="Dejar vacio para ilimitado"
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Descripcion Corta
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    placeholder="Descripcion breve de la liga..."
                  />
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="rulesDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Reglas de la Liga *
                  </label>
                  <textarea
                    id="rulesDescription"
                    rows={6}
                    value={formData.rulesDescription}
                    onChange={(e) => setFormData({ ...formData, rulesDescription: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                    placeholder="Describe las reglas especificas de esta liga, formato de partidos, sistema de puntuacion, etc. (Markdown soportado)"
                  />
                  <p className="mt-1 text-xs text-gray-500">Puedes usar Markdown para formatear las reglas.</p>
                </div>
              </div>
            </div>

            {/* Configuracion de Juego */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Configuracion de Juego</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="gameMode" className="block text-sm font-medium text-gray-700 mb-2">
                    Modalidad de Juego *
                  </label>
                  <select
                    id="gameMode"
                    value={formData.gameMode}
                    onChange={(e) => setFormData({ ...formData, gameMode: e.target.value as 'INDIVIDUAL' | 'PAIRS' | 'MIXED' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  >
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="PAIRS">Parejas</option>
                    <option value="MIXED">Mixto</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="tournamentFormat" className="block text-sm font-medium text-gray-700 mb-2">
                    Formato del Torneo *
                  </label>
                  <select
                    id="tournamentFormat"
                    value={formData.tournamentFormat}
                    onChange={(e) => setFormData({ ...formData, tournamentFormat: e.target.value as 'ROUND_ROBIN' | 'KNOCKOUT' | 'HYBRID' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  >
                    <option value="ROUND_ROBIN">Todos contra todos</option>
                    <option value="KNOCKOUT">Eliminacion directa</option>
                    <option value="HYBRID">Hibrido</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="autoApproveRegistrations"
                      checked={formData.autoApproveRegistrations}
                      onChange={(e) => setFormData({ ...formData, autoApproveRegistrations: e.target.checked })}
                      className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                    />
                    <label htmlFor="autoApproveRegistrations" className="ml-2 block text-sm text-gray-700">
                      Auto-aprobar inscripciones (los jugadores se unen automaticamente sin requerir aprobacion manual)
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Fechas</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="registrationStart" className="block text-sm font-medium text-gray-700 mb-2">
                    Inicio de Inscripciones *
                  </label>
                  <input
                    type="date"
                    id="registrationStart"
                    value={formData.registrationStart}
                    onChange={(e) => setFormData({ ...formData, registrationStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="registrationEnd" className="block text-sm font-medium text-gray-700 mb-2">
                    Fin de Inscripciones *
                  </label>
                  <input
                    type="date"
                    id="registrationEnd"
                    value={formData.registrationEnd}
                    onChange={(e) => setFormData({ ...formData, registrationEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="leagueStart" className="block text-sm font-medium text-gray-700 mb-2">
                    Inicio de Liga *
                  </label>
                  <input
                    type="date"
                    id="leagueStart"
                    value={formData.leagueStart}
                    onChange={(e) => setFormData({ ...formData, leagueStart: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="leagueEnd" className="block text-sm font-medium text-gray-700 mb-2">
                    Fin de Liga *
                  </label>
                  <input
                    type="date"
                    id="leagueEnd"
                    value={formData.leagueEnd}
                    onChange={(e) => setFormData({ ...formData, leagueEnd: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Puntuacion */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Sistema de Puntuacion</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="pointsWin" className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos por Victoria *
                  </label>
                  <input
                    type="number"
                    id="pointsWin"
                    min="0"
                    value={formData.pointsWin}
                    onChange={(e) => setFormData({ ...formData, pointsWin: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pointsDraw" className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos por Empate *
                  </label>
                  <input
                    type="number"
                    id="pointsDraw"
                    min="0"
                    value={formData.pointsDraw}
                    onChange={(e) => setFormData({ ...formData, pointsDraw: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="pointsLoss" className="block text-sm font-medium text-gray-700 mb-2">
                    Puntos por Derrota *
                  </label>
                  <input
                    type="number"
                    id="pointsLoss"
                    min="0"
                    value={formData.pointsLoss}
                    onChange={(e) => setFormData({ ...formData, pointsLoss: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-gray-900"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Configuracion de Datos */}
            <div className="mb-8">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Datos de Partidos a Registrar</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackDetailedScore"
                    checked={formData.trackDetailedScore}
                    onChange={(e) => setFormData({ ...formData, trackDetailedScore: e.target.checked })}
                    className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackDetailedScore" className="ml-2 block text-sm text-gray-700">
                    Registrar puntuacion detallada por leg
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackGameByGame"
                    checked={formData.trackGameByGame}
                    onChange={(e) => setFormData({ ...formData, trackGameByGame: e.target.checked })}
                    className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackGameByGame" className="ml-2 block text-sm text-gray-700">
                    Registrar resultados juego por juego
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackThrowCount"
                    checked={formData.trackThrowCount}
                    onChange={(e) => setFormData({ ...formData, trackThrowCount: e.target.checked })}
                    className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackThrowCount" className="ml-2 block text-sm text-gray-700">
                    Contar numero de dardos lanzados
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="trackTime"
                    checked={formData.trackTime}
                    onChange={(e) => setFormData({ ...formData, trackTime: e.target.checked })}
                    className="h-4 w-4 text-fuchsia-600 focus:ring-fuchsia-500 border-gray-300 rounded"
                  />
                  <label htmlFor="trackTime" className="ml-2 block text-sm text-gray-700">
                    Registrar tiempo de duracion de partidos
                  </label>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <Link
                href="/admin"
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Creando Liga...' : 'Crear Liga'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
