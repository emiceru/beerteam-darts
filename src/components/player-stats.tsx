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
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface PlayerStatsProps {
  userId: string;
}

interface PlayerStats {
  user: {
    id: string;
    name: string;
    email: string;
    memberSince: string;
  };
  overview: {
    totalMatches: number;
    wins: number;
    losses: number;
    winRate: number;
    totalLeagues: number;
    activeLeagues: number;
    currentStreak: number;
    streakType: string;
  };
  byCompetition: Record<string, {
    matches: number;
    wins: number;
    totalScore: number;
    highestScore: number;
  }>;
  monthlyPerformance: Array<{
    month: string;
    matches: number;
    wins: number;
    winRate: number;
  }>;
  recentMatches: Array<{
    id: string;
    date: string;
    league: string;
    competitionType: string;
    opponent: string;
    userScore: number;
    opponentScore: number;
    result: 'win' | 'loss';
  }>;
  achievements: {
    perfectGames: number;
    comebackWins: number;
    longestWinStreak: number;
  };
}

const COLORS = ['#DC143C', '#FFD700', '#32CD32', '#1E90FF', '#FF69B4'];

export default function PlayerStats({ userId }: PlayerStatsProps) {
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, [userId]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/stats/player/${userId}`);
      
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <h3 className="text-red-800 font-semibold">Error</h3>
        <p className="text-red-700">{error}</p>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Preparar datos para gráficos
  const competitionData = Object.entries(stats.byCompetition).map(([name, data]) => ({
    name,
    matches: data.matches,
    wins: data.wins,
    winRate: data.matches > 0 ? (data.wins / data.matches) * 100 : 0,
    avgScore: data.matches > 0 ? data.totalScore / data.matches : 0
  }));

  const streakColor = stats.overview.streakType === 'win' ? '#22C55E' : '#EF4444';

  return (
    <div className="space-y-6">
      {/* Header con información del jugador */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{stats.user.name}</h1>
            <p className="text-gray-600">
              Miembro desde {format(new Date(stats.user.memberSince), 'MMMM yyyy', { locale: es })}
            </p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold text-red-600">{stats.overview.winRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600">Porcentaje de victorias</p>
          </div>
        </div>
      </div>

      {/* Resumen de estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Partidos</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.overview.totalMatches}</p>
          <p className="text-sm text-gray-600">
            {stats.overview.wins}V - {stats.overview.losses}D
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Ligas</h3>
          <p className="text-3xl font-bold text-green-600">{stats.overview.totalLeagues}</p>
          <p className="text-sm text-gray-600">
            {stats.overview.activeLeagues} activas
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Racha Actual</h3>
          <p className="text-3xl font-bold" style={{ color: streakColor }}>
            {stats.overview.currentStreak}
          </p>
          <p className="text-sm text-gray-600">
            {stats.overview.streakType === 'win' ? 'Victorias' : 'Derrotas'}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Juegos Perfectos</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.achievements.perfectGames}</p>
          <p className="text-sm text-gray-600">501 puntos</p>
        </div>
      </div>

      {/* Gráfico de rendimiento mensual */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Rendimiento Mensual</h3>
        <div className="h-64 sm:h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={stats.monthlyPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip 
                labelFormatter={(label) => `Mes: ${label}`}
                formatter={(value: number, name: string) => [
                  name === 'winRate' ? `${value.toFixed(1)}%` : value,
                  name === 'winRate' ? 'Porcentaje de victorias' : 
                  name === 'matches' ? 'Partidos' : 'Victorias'
                ]}
              />
              <Line 
                type="monotone" 
                dataKey="winRate" 
                stroke="#DC143C" 
                strokeWidth={3}
                name="winRate"
              />
              <Line 
                type="monotone" 
                dataKey="matches" 
                stroke="#FFD700" 
                strokeWidth={2}
                name="matches"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Estadísticas por tipo de competición */}
      {competitionData.length > 0 && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Partidos por Competición</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={competitionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="matches" fill="#DC143C" />
                  <Bar dataKey="wins" fill="#FFD700" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">Distribución de Victorias</h3>
            <div className="h-48 sm:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={competitionData}
                    dataKey="wins"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {competitionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* Historial de partidos recientes */}
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Partidos Recientes</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-xs sm:text-sm">Fecha</th>
                <th className="text-left py-2 text-xs sm:text-sm hidden sm:table-cell">Liga</th>
                <th className="text-left py-2 text-xs sm:text-sm hidden md:table-cell">Competición</th>
                <th className="text-left py-2 text-xs sm:text-sm">Oponente</th>
                <th className="text-left py-2 text-xs sm:text-sm">Resultado</th>
                <th className="text-left py-2 text-xs sm:text-sm">Estado</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentMatches.map((match) => (
                <tr key={match.id} className="border-b hover:bg-gray-50">
                                     <td className="py-2 text-xs sm:text-sm">
                     {match.date ? new Date(match.date).toLocaleDateString('es', { day: '2-digit', month: '2-digit' }) : 'N/A'}
                    <div className="sm:hidden text-xs text-gray-500">
                      {match.league}
                    </div>
                  </td>
                  <td className="py-2 text-xs sm:text-sm hidden sm:table-cell">{match.league}</td>
                  <td className="py-2 text-xs sm:text-sm hidden md:table-cell">{match.competitionType}</td>
                  <td className="py-2 text-xs sm:text-sm">
                    <div className="truncate max-w-24 sm:max-w-none">
                      {match.opponent || 'N/A'}
                    </div>
                    <div className="md:hidden text-xs text-gray-500">
                      {match.competitionType}
                    </div>
                  </td>
                  <td className="py-2 text-xs sm:text-sm font-mono">
                    {match.userScore} - {match.opponentScore}
                  </td>
                  <td className="py-2">
                    <span className={`px-1 sm:px-2 py-1 rounded-full text-xs font-semibold ${
                      match.result === 'win' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      <span className="hidden sm:inline">{match.result === 'win' ? 'Victoria' : 'Derrota'}</span>
                      <span className="sm:hidden">{match.result === 'win' ? 'V' : 'D'}</span>
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 