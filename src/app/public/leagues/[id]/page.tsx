'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import LeagueStats from '@/components/league-stats';

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

export default function PublicLeagueStatsPage() {
  const params = useParams();
  const leagueId = params.id as string;
  const [league, setLeague] = useState<League | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchLeague();
  }, [leagueId]);

  const fetchLeague = async () => {
    try {
      const response = await fetch(`/api/leagues/${leagueId}/public`);
      if (!response.ok) {
        if (response.status === 404) {
          setError('Liga no encontrada');
        } else {
          setError('Error al cargar la liga');
        }
        return;
      }
      const data = await response.json();
      setLeague(data);
    } catch (error) {
      console.error('Error fetching league:', error);
      setError('Error al cargar la liga');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'COMPLETED':
        return 'bg-gray-100 text-gray-800';
      case 'DRAFT':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Activa';
      case 'COMPLETED':
        return 'Finalizada';
      case 'DRAFT':
        return 'Borrador';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando estadísticas...</p>
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
              className="bg-red-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-red-700 transition-colors"
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
                className="text-red-100 hover:text-white text-sm mb-2 inline-flex items-center transition-colors"
              >
                ← Volver a Competiciones
              </Link>
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2 truncate">
                📊 {league.name}
              </h1>
              <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-red-100">
                <span className="text-sm sm:text-base">{league.season}</span>
                <span className="hidden sm:inline">•</span>
                <span className="text-sm sm:text-base">{league.competitionType}</span>
                <span className="hidden sm:inline">•</span>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(league.status)}`}>
                  {getStatusText(league.status)}
                </span>
              </div>
            </div>
            <div className="mt-4 sm:mt-0 sm:ml-4 flex flex-col sm:flex-row gap-2">
              <Link
                href={`/public/leagues/${leagueId}/matches`}
                className="bg-white text-red-600 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors text-center"
              >
                ⚽ Ver Partidos
              </Link>
            </div>
          </div>
          
          {league.description && (
            <p className="text-red-100 mt-4 text-sm sm:text-base max-w-3xl">
              {league.description}
            </p>
          )}
        </div>
      </div>

      {/* Info adicional */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500 block">Fecha de inicio:</span>
              <span className="font-semibold">
                {league.startDate ? new Date(league.startDate).toLocaleDateString('es') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Fecha de fin:</span>
              <span className="font-semibold">
                {league.endDate ? new Date(league.endDate).toLocaleDateString('es') : 'N/A'}
              </span>
            </div>
            <div>
              <span className="text-gray-500 block">Organizador:</span>
              <span className="font-semibold">{league.creator}</span>
            </div>
            <div>
              <span className="text-gray-500 block">Temporada:</span>
              <span className="font-semibold">{league.season}</span>
            </div>
          </div>
        </div>

        {/* Estadísticas de la liga */}
        <LeagueStats leagueId={leagueId} />
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