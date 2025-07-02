'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar
} from 'recharts';
import { format } from 'date-fns';

interface LeagueStatsProps {
  leagueId: string;
}

interface PlayerStats {
  id: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  points: number;
  position: number;
}

interface LeagueStats {
  league: {
    id: string;
    name: string;
    description: string;
    status: string;
    competitionType: string;
    season: string;
    creator: string;
    isPublic: boolean;
    createdAt: string;
    startDate: string;
    endDate: string;
  };
  overview: {
    totalParticipants: number;
    totalMatches: number;
    completedMatches: number;
    pendingMatches: number;
    completionRate: number;
    averageMatchesPerPlayer: number;
  };
  rankings: {
    topByWins: PlayerStats[];
    topByWinRate: PlayerStats[];
    topByAverage: PlayerStats[];
    topByHighest: PlayerStats[];
  };
  activity: {
    dailyActivity: Array<{
      date: string;
      matches: number;
      day: string;
    }>;
    activityByHour: Array<{
      hour: string;
      matches: number;
    }>;
  };
  analysis: {
    scoreDistribution: Array<{
      range: string;
      count: number;
      percentage: number;
    }>;
    averageScore: number;
    highestScore: number;
    mostActiveDay: {
      date: string;
      matches: number;
      day: string;
    };
    peakHour: {
      hour: string;
      matches: number;
    };
  };
}

export default function LeagueStats({ leagueId }: LeagueStatsProps) {
  const [stats, setStats] = useState<LeagueStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchStats();
  }, [leagueId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats/league/${leagueId}`);
      
      if (!response.ok) {
        throw new Error('Error al cargar estadísticas');
      }

      const data = await response.json();
      setStats(data.stats);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
        <h3 className="text-primary-800 font-semibold">Error</h3>
        <p className="text-primary-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  const tabs = [
    { id: 'overview', name: 'Resumen' },
    { id: 'rankings', name: 'Rankings' },
    { id: 'activity', name: 'Actividad' },
    { id: 'analysis', name: 'Análisis' }
  ];

  return (
    <div className="space-y-6">
      {/* Header de la liga */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.league.name}</h1>
            <p className="text-gray-600">{stats.league.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <span className="text-sm text-gray-500">
                {stats.league.competitionType} • {stats.league.season}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                stats.league.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                stats.league.status === 'FINISHED' ? 'bg-gray-100 text-gray-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {stats.league.status}
              </span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-primary-600">{stats.overview.completionRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Completitud</p>
          </div>
        </div>
      </div>

      {/* Navegación por pestañas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-6 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Pestaña Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Participantes</h3>
                  <p className="text-3xl font-bold text-blue-600">{stats.overview.totalParticipants}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Partidos</h3>
                  <p className="text-3xl font-bold text-green-600">{stats.overview.totalMatches}</p>
                  <p className="text-sm text-gray-600">
                    {stats.overview.completedMatches} completados, {stats.overview.pendingMatches} pendientes
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Promedio por Jugador</h3>
                  <p className="text-3xl font-bold text-purple-600">
                    {stats.overview.averageMatchesPerPlayer.toFixed(1)}
                  </p>
                  <p className="text-sm text-gray-600">partidos por jugador</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Progreso de la Liga</h3>
                <div className="w-full bg-gray-200 rounded-full h-4">
                  <div 
                    className="bg-primary-600 h-4 rounded-full transition-all duration-300"
                    style={{ width: `${stats.overview.completionRate}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {stats.overview.completedMatches} de {stats.overview.totalMatches} partidos completados
                </p>
              </div>
            </div>
          )}

          {/* Pestaña Rankings */}
          {activeTab === 'rankings' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top por Victorias</h3>
                  <div className="space-y-2">
                    {stats.rankings.topByWins.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="font-bold text-green-600">{player.wins} victorias</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top por Porcentaje de Victorias</h3>
                  <div className="space-y-2">
                    {stats.rankings.topByWinRate.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="font-bold text-blue-600">{player.winRate.toFixed(1)}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top por Promedio de Puntos</h3>
                  <div className="space-y-2">
                    {stats.rankings.topByAverage.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="font-bold text-purple-600">{player.averageScore.toFixed(1)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Top por Puntuación Máxima</h3>
                  <div className="space-y-2">
                    {stats.rankings.topByHighest.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-bold text-lg">{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <span className="font-bold text-primary-600">{player.highestScore}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Activity */}
          {activeTab === 'activity' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad Diaria (Últimos 30 días)</h3>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={stats.activity.dailyActivity}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={(date) => format(new Date(date), 'dd/MM')}
                      />
                      <YAxis />
                      <Tooltip 
                        labelFormatter={(date) => format(new Date(date), 'dd/MM/yyyy')}
                        formatter={(value: number) => [value, 'Partidos']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="matches" 
                        stroke="#DC143C" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Actividad por Hora</h3>
                <div className="h-48 sm:h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.activity.activityByHour}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip formatter={(value: number) => [value, 'Partidos']} />
                      <Bar dataKey="matches" fill="#FFD700" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Día Más Activo</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.analysis.mostActiveDay.day}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.analysis.mostActiveDay.matches} partidos el{' '}
                    {format(new Date(stats.analysis.mostActiveDay.date), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Hora Pico</h4>
                  <p className="text-2xl font-bold text-green-600">
                    {stats.analysis.peakHour.hour}
                  </p>
                  <p className="text-sm text-gray-600">
                    {stats.analysis.peakHour.matches} partidos
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pestaña Analysis */}
          {activeTab === 'analysis' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Puntuación Promedio</h4>
                  <p className="text-2xl font-bold text-blue-600">
                    {stats.analysis.averageScore.toFixed(1)}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Puntuación Más Alta</h4>
                  <p className="text-2xl font-bold text-primary-600">
                    {stats.analysis.highestScore}
                  </p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Total de Puntuaciones</h4>
                  <p className="text-2xl font-bold text-purple-600">
                    {stats.analysis.scoreDistribution.reduce((sum, range) => sum + range.count, 0)}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Distribución de Puntuaciones</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.analysis.scoreDistribution}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="range" />
                      <YAxis />
                      <Tooltip 
                        formatter={(value: number, name: string) => [
                          name === 'percentage' ? `${value.toFixed(1)}%` : value,
                          name === 'percentage' ? 'Porcentaje' : 'Cantidad'
                        ]}
                      />
                      <Bar dataKey="count" fill="#DC143C" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 