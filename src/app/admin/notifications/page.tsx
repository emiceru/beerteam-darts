'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePushNotifications } from '@/components/push-notifications';

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface League {
  id: string;
  name: string;
  slug: string;
}

export default function AdminNotifications() {
  const router = useRouter();
  const { sendNotification, isLoading } = usePushNotifications();
  const [user, setUser] = useState<User | null>(null);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [authLoading, setAuthLoading] = useState(true);

  // Form state
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetType, setTargetType] = useState<'all' | 'league' | 'specific'>('all');
  const [selectedLeague, setSelectedLeague] = useState('');
  const [url, setUrl] = useState('/dashboard');

  useEffect(() => {
    checkAuth();
    loadLeagues();
  }, []);

  const checkAuth = async () => {
    try {
      const response = await fetch('/api/auth/me');
      if (response.ok) {
        const userData = await response.json();
        if (userData.role !== 'ADMIN') {
          router.push('/dashboard');
          return;
        }
        setUser(userData);
      } else {
        router.push('/login');
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      router.push('/login');
    } finally {
      setAuthLoading(false);
    }
  };

  const loadLeagues = async () => {
    try {
      const response = await fetch('/api/leagues/simple');
      if (response.ok) {
        const data = await response.json();
        setLeagues(data.leagues || []);
      }
    } catch (error) {
      console.error('Error cargando ligas:', error);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !message.trim()) {
      alert('Título y mensaje son requeridos');
      return;
    }

    try {
      const payload: { title: string; message: string; url: string; leagueId?: string } = {
        title: title.trim(),
        message: message.trim(),
        url: url.trim() || '/dashboard'
      };

      if (targetType === 'league' && selectedLeague) {
        payload.leagueId = selectedLeague;
      }

      const result = await sendNotification(payload);
      
      alert(`✅ Notificación enviada exitosamente!\n\n📊 Resultados:\n• Total: ${result.stats.total}\n• Exitosas: ${result.stats.success}\n• Errores: ${result.stats.errors}`);
      
      // Limpiar formulario
      setTitle('');
      setMessage('');
      setUrl('/dashboard');
      setTargetType('all');
      setSelectedLeague('');

    } catch (error) {
      console.error('Error enviando notificación:', error);
      alert('❌ Error enviando notificación. Inténtalo de nuevo.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">📢 Enviar Notificaciones</h1>
              <p className="text-gray-600 mt-2">
                Envía notificaciones push a los usuarios de la plataforma
              </p>
            </div>
            <button
              onClick={() => router.back()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              ← Volver
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">📝 Nueva Notificación</h2>
              
              <form onSubmit={handleSendNotification} className="space-y-6">
                {/* Título */}
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                    Título *
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: ¡Nueva liga disponible!"
                    maxLength={100}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{title.length}/100 caracteres</p>
                </div>

                {/* Mensaje */}
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Mensaje *
                  </label>
                  <textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="Ej: Se ha creado una nueva liga de dardos. ¡Únete ahora!"
                    maxLength={300}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">{message.length}/300 caracteres</p>
                </div>

                {/* Audiencia */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Audiencia
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="all"
                        checked={targetType === 'all'}
                        onChange={(e) => setTargetType(e.target.value as 'all' | 'league')}
                        className="mr-2"
                      />
                      <span className="text-sm">📢 Todos los usuarios con notificaciones activas</span>
                    </label>
                    
                    <label className="flex items-center">
                      <input
                        type="radio"
                        name="targetType"
                        value="league"
                        checked={targetType === 'league'}
                        onChange={(e) => setTargetType(e.target.value as 'all' | 'league')}
                        className="mr-2"
                      />
                      <span className="text-sm">🏆 Participantes de una liga específica</span>
                    </label>

                    {targetType === 'league' && (
                      <div className="ml-6">
                        <select
                          value={selectedLeague}
                          onChange={(e) => setSelectedLeague(e.target.value)}
                          className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                          required
                        >
                          <option value="">Seleccionar liga...</option>
                          {leagues.map((league) => (
                            <option key={league.id} value={league.id}>
                              {league.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>
                </div>

                {/* URL */}
                <div>
                  <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-2">
                    URL de destino (opcional)
                  </label>
                  <input
                    type="text"
                    id="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    className="w-full px-3 py-2 border text-gray-900 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="/dashboard, /leagues/mi-liga, etc."
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Página que se abrirá cuando el usuario haga clic en la notificación
                  </p>
                </div>

                {/* Botón */}
                <button
                  type="submit"
                  disabled={isLoading || !title.trim() || !message.trim()}
                  className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors"
                >
                  {isLoading ? 'Enviando...' : '📤 Enviar Notificación'}
                </button>
              </form>
            </div>
          </div>

          {/* Sidebar con información */}
          <div className="space-y-6">
            {/* Preview */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">👀 Vista Previa</h3>
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 bg-primary-600 rounded flex items-center justify-center">
                    <span className="text-white text-xs">🎯</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-sm text-gray-900">
                      {title || 'Título de la notificación'}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {message || 'Mensaje de la notificación aparecerá aquí...'}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Consejos */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">💡 Consejos</h3>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Mantén el título corto y descriptivo</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Incluye una llamada a la acción clara</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Usa emojis para mayor impacto visual</span>
                </div>
                <div className="flex items-start space-x-2">
                  <span className="text-green-600">✓</span>
                  <span>Verifica la URL de destino</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Estadísticas</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Usuarios registrados:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Con notificaciones activas:</span>
                  <span className="font-medium">-</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ligas activas:</span>
                  <span className="font-medium">{leagues.length}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 