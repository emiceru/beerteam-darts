'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

interface League {
  id: string;
  name: string;
  description: string;
  status: string;
  competitionType: string;
  season: string;
  creator: string;
  startDate: string;
  endDate: string;
}

interface Match {
  id: string;
  round: number;
  matchNumber: number;
  team1: {
    id: string;
    name: string;
    player1: { name: string };
    player2?: { name: string };
  };
  team2: {
    id: string;
    name: string;
    player1: { name: string };
    player2?: { name: string };
  };
  scheduledDate: string | null;
  actualDate: string | null;
  status: string;
  winner: {
    id: string;
    name: string;
  } | null;
  score: {
    team1Score: number;
    team2Score: number;
  } | null;
}

export default function PublicLeagueMatchesPage() {
  const params = useParams();
  const leagueId = params.id as string;
  const [league, setLeague] = useState<League | null>(null);
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchData();
  }, [leagueId]);

  const fetchData = async () => {
    try {
      const [leagueResponse, matchesResponse] = await Promise.all([
        fetch(`/api/leagues/${leagueId}/public`),
        fetch(`/api/leagues/${leagueId}/matches/public`)
      ]);

      if (!leagueResponse.ok) {
        setError('Liga no encontrada');
        return;
      }

      if (!matchesResponse.ok) {
        setError('Error al cargar los partidos');
        return;
      }

      const leagueData = await leagueResponse.json();
      const matchesData = await matchesResponse.json();

      setLeague(leagueData);
      setMatches(matchesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const filteredMatches = matches.filter(match => {
    if (filter === 'all') return true;
    if (filter === 'completed') return match.status === 'COMPLETED';
    if (filter === 'scheduled') return match.status === 'SCHEDULED';
    if (filter === 'pending') return match.status === 'PENDING';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800';
      case 'SCHEDULED':
        return 'bg-blue-100 text-blue-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'CANCELLED':
        return 'bg-primary-100 text-primary-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Finalizado';
      case 'SCHEDULED':
        return 'Programado';
      case 'PENDING':
        return 'Pendiente';
      case 'CANCELLED':
        return 'Cancelado';
      default:
        return status;
    }
  };

  const getTeamDisplayName = (team: any) => {
    if (team.name) return team.name;
    if (team.player2) {
      return `${team.player1.name} & ${team.player2.name}`;
    }
    return team.player1.name;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando partidos...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-6xl mb-4">❌</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{error || 'Liga no encontrada'}</h3>
            <p className="text-gray-600 mb-6">La liga solicitada no existe o no está disponible públicamente.</p>
            <Link
              href="/public"
              className="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
            >
              ← Volver a Competiciones
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-red-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="flex-1 min-w-0">
              <Link
                href="/public"
                className="text-primary-100 hover:text-white text-sm mb-2 inline-flex items-center transition-colors"
              >
                ← Volver a Competiciones
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
                ⚽ Partidos - {league.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-primary-100">
                <span className="text-sm sm:text-base">{league.season}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-sm sm:text-base">{league.competitionType}</span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
              <Link
                href={`/public/leagues/${leagueId}`}
                className="bg-white text-primary-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-center"
              >
                📊 Ver Estadísticas
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Partidos</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todos' },
              { value: 'completed', label: 'Finalizados' },
              { value: 'scheduled', label: 'Programados' },
              { value: 'pending', label: 'Pendientes' }
            ].map((option) => (
              <button
                key={option.value}
                onClick={() => setFilter(option.value)}
                className={`px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === option.value
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lista de Partidos */}
        {filteredMatches.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">⚽</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay partidos disponibles</h3>
            <p className="text-gray-600">No se encontraron partidos con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((match) => (
              <div key={match.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                    <div className="flex items-center gap-2 mb-2 sm:mb-0">
                      <span className="text-sm font-medium text-gray-500">
                        Ronda {match.round} - Partido {match.matchNumber}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(match.status)}`}>
                        {getStatusText(match.status)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {match.actualDate ? (
                        <>
                          <span className="font-medium">Jugado:</span>{' '}
                          {new Date(match.actualDate).toLocaleDateString('es', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      ) : match.scheduledDate ? (
                        <>
                          <span className="font-medium">Programado:</span>{' '}
                          {new Date(match.scheduledDate).toLocaleDateString('es', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </>
                      ) : (
                        'Fecha por determinar'
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-center">
                    {/* Equipo 1 */}
                    <div className="text-center sm:text-right">
                      <div className={`font-semibold text-base sm:text-lg ${
                        match.winner?.id === match.team1.id ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {getTeamDisplayName(match.team1)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {match.team1.player2 ? 'Pareja' : 'Individual'}
                      </div>
                    </div>

                    {/* Resultado */}
                    <div className="text-center">
                      {match.status === 'COMPLETED' && match.score ? (
                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                          {match.score.team1Score} - {match.score.team2Score}
                        </div>
                      ) : (
                        <div className="text-xl text-gray-400">
                          VS
                        </div>
                      )}
                      {match.winner && (
                        <div className="text-xs text-green-600 font-medium mt-1">
                          🏆 {getTeamDisplayName(match.winner)}
                        </div>
                      )}
                    </div>

                    {/* Equipo 2 */}
                    <div className="text-center sm:text-left">
                      <div className={`font-semibold text-base sm:text-lg ${
                        match.winner?.id === match.team2.id ? 'text-green-600' : 'text-gray-900'
                      }`}>
                        {getTeamDisplayName(match.team2)}
                      </div>
                      <div className="text-sm text-gray-500 mt-1">
                        {match.team2.player2 ? 'Pareja' : 'Individual'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="mb-4">🍺 Beer Team Darts League Manager</p>
          <div className="flex flex-col sm:flex-row justify-center gap-4 text-sm text-gray-300">
            <Link href="/login" className="hover:text-white transition-colors">
              🔐 Iniciar Sesión
            </Link>
            <Link href="/register" className="hover:text-white transition-colors">
              📝 Registrarse
            </Link>
            <Link href="/join" className="hover:text-white transition-colors">
              🎯 Unirse a Liga
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
} 