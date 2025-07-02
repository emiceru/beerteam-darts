'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '@/components/header';

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
  participantCount: number;
  matchCount: number;
  completedMatches: number;
}

export default function PublicLeaguesPage() {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchPublicLeagues();
  }, []);

  const fetchPublicLeagues = async () => {
    try {
      const response = await fetch('/api/leagues/public');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data);
      }
    } catch (error) {
      console.error('Error fetching public leagues:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeagues = leagues.filter(league => {
    if (filter === 'all') return true;
    if (filter === 'active') return league.status === 'active';
    if (filter === 'completed') return league.status === 'completed';
    if (filter === 'upcoming') return league.status === 'pending';
    return true;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'pending':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'completed':
        return 'Finalizada';
      case 'pending':
        return 'Próximamente';
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando competiciones...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50">
      {/* Header */}
      <Header title="Competiciones Públicas" subtitle="Explora estadísticas y resultados de todas las competiciones" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 mb-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Filtrar Competiciones</h2>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'all', label: 'Todas' },
              { value: 'active', label: 'Activas' },
              { value: 'completed', label: 'Finalizadas' },
              { value: 'upcoming', label: 'Próximamente' }
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

        {/* Lista de Ligas */}
        {filteredLeagues.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay competiciones disponibles</h3>
            <p className="text-gray-600">No se encontraron competiciones con los filtros seleccionados.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLeagues.map((league) => (
              <div key={league.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">
                        {league.name}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">
                        {league.season} • {league.competitionType}
                      </p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${getStatusColor(league.status)}`}>
                      {getStatusText(league.status)}
                    </span>
                  </div>

                  <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                    {league.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4 text-sm">
                    <div>
                      <span className="text-gray-500">Participantes:</span>
                      <span className="ml-1 font-semibold text-blue-600">{league.participantCount}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Partidos:</span>
                      <span className="ml-1 font-semibold text-green-600">
                        {league.completedMatches}/{league.matchCount}
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-gray-500 mb-4">
                    <div>
                      Inicio: {league.startDate ? new Date(league.startDate).toLocaleDateString('es') : 'N/A'}
                    </div>
                    {league.endDate && (
                      <div>
                        Fin: {new Date(league.endDate).toLocaleDateString('es')}
                      </div>
                    )}
                    <div className="mt-1">
                      Organizador: {league.creator}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Link
                      href={`/public/leagues/${league.id}`}
                      className="flex-1 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors text-center"
                    >
                      📊 Ver Estadísticas
                    </Link>
                    <Link
                      href={`/public/leagues/${league.id}/matches`}
                      className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-700 transition-colors text-center"
                    >
                      ⚽ Ver Partidos
                    </Link>
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