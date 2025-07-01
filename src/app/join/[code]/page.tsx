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
  gameMode: string
  tournamentFormat: string
  status: string
  registrationOpen: boolean
  registrationStart: string | null
  registrationEnd: string | null
  leagueStart: string | null
  leagueEnd: string | null
  maxParticipants: number | null
  season: {
    name: string
    year: number
  }
  competitionType: {
    name: string
    description: string
    rulesDescription: string
  }
  _count: {
    participants: number
  }
}

interface JoinLink {
  id: string
  code: string
  expiresAt: string | null
  maxUses: number | null
  currentUses: number
}

interface FormData {
  name: string
  email: string
  password: string
  createAccount: boolean
}

export default function JoinPage() {
  const params = useParams()
  const router = useRouter()
  const code = params.code as string

  const [league, setLeague] = useState<League | null>(null)
  const [joinLink, setJoinLink] = useState<JoinLink | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    password: '',
    createAccount: false
  })

  // Cargar información del enlace
  useEffect(() => {
    const fetchJoinLink = async () => {
      try {
        const response = await fetch(`/api/join/${code}`)
        const data = await response.json()

        if (data.success) {
          setLeague(data.league)
          setJoinLink(data.joinLink)
        } else {
          setError(data.error || 'Error cargando la liga')
        }
      } catch (err) {
        setError('Error de conexión')
      } finally {
        setLoading(false)
      }
    }

    if (code) {
      fetchJoinLink()
    }
  }, [code])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError('')

    try {
      const response = await fetch(`/api/join/${code}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        setSuccess(data.message)
        
        // Si se creó cuenta, redirigir al dashboard después de un momento
        if (data.user) {
          setTimeout(() => {
            router.push('/dashboard')
          }, 2000)
        }
      } else {
        setError(data.error || 'Error en la inscripción')
      }
    } catch (err) {
      setError('Error de conexión')
    } finally {
      setSubmitting(false)
    }
  }

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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
      </div>
    )
  }

  if (error && !league) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-red-600 text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Enlace no válido
          </h1>
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

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <div className="text-green-600 text-5xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            ¡Inscripción exitosa!
          </h1>
          <p className="text-gray-600 mb-6">{success}</p>
          <div className="space-y-3">
            <Link
              href="/dashboard"
              className="block w-full px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Ir al Dashboard
            </Link>
            <Link
              href="/"
              className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center text-red-600 hover:text-red-700 mb-4">
            ← Volver al inicio
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Beer Team Darts League
          </h1>
          <p className="text-gray-600">Inscríbete en la liga</p>
        </div>

        {/* Liga Info */}
        {league && (
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{league.name}</h2>
                <p className="text-sm text-gray-500">
                  {league.season.name} {league.season.year} • {league.competitionType.name}
                </p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                Inscripción abierta
              </span>
            </div>

            {league.description && (
              <p className="text-gray-700 mb-4">{league.description}</p>
            )}

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Modalidad:</span>
                <span className="ml-2 text-gray-600">{formatGameMode(league.gameMode)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Formato:</span>
                <span className="ml-2 text-gray-600">{formatTournamentFormat(league.tournamentFormat)}</span>
              </div>
              <div>
                <span className="font-medium text-gray-900">Participantes:</span>
                <span className="ml-2 text-gray-600">
                  {league._count.participants}
                  {league.maxParticipants && ` / ${league.maxParticipants}`}
                </span>
              </div>
              {league.leagueStart && (
                <div>
                  <span className="font-medium text-gray-900">Inicio:</span>
                  <span className="ml-2 text-gray-600">
                    {new Date(league.leagueStart).toLocaleDateString('es-ES')}
                  </span>
                </div>
              )}
            </div>

            {league.rulesDescription && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Reglas de la liga:</h3>
                <p className="text-sm text-gray-700">{league.rulesDescription}</p>
              </div>
            )}

            {league.competitionType.rulesDescription && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">Reglas del {league.competitionType.name}:</h3>
                <p className="text-sm text-gray-700">{league.competitionType.rulesDescription}</p>
              </div>
            )}
          </div>
        )}

        {/* Formulario de inscripción */}
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">
            Completa tu inscripción
          </h3>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nombre completo *
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                id="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                required
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                id="createAccount"
                checked={formData.createAccount}
                onChange={(e) => setFormData({ ...formData, createAccount: e.target.checked })}
                className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
              <label htmlFor="createAccount" className="ml-2 block text-sm text-gray-700">
                Crear cuenta para acceder al dashboard
              </label>
            </div>

            {formData.createAccount && (
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Contraseña *
                </label>
                <input
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  required={formData.createAccount}
                  minLength={6}
                />
                <p className="mt-1 text-xs text-gray-500">Mínimo 6 caracteres</p>
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {submitting ? 'Inscribiendo...' : 'Inscribirse'}
              </button>
            </div>
          </form>

          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              <strong>Nota:</strong> Si no creas una cuenta, recibirás un email con instrucciones para acceder a tu información de la liga.
            </p>
          </div>
        </div>

        {/* Info del enlace */}
        {joinLink && (
          <div className="mt-6 bg-gray-100 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información del enlace:</h4>
            <div className="text-sm text-gray-600 space-y-1">
              {joinLink.maxUses && (
                <p>Usos: {joinLink.currentUses} / {joinLink.maxUses}</p>
              )}
              {joinLink.expiresAt && (
                <p>Expira: {new Date(joinLink.expiresAt).toLocaleDateString('es-ES')}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 