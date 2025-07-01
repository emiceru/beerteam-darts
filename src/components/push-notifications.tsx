'use client';

import { useState, useEffect } from 'react';
import { Bell, BellOff } from 'lucide-react';

interface PushNotificationsProps {
  userId?: string;
  className?: string;
}

export function PushNotifications({ userId, className = '' }: PushNotificationsProps) {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  // Clave VAPID pública (debe coincidir con la del servidor)
  const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_KEY || 'BM4L7vKdWR4WlkbSe-LOEnmEdA4yMJUaX8GBq_Rx6kFTysAl9epbjhQatyHaxJt4V8hHlQAgJDeLu94FAf3RyAs';

  useEffect(() => {
    checkSupport();
    checkSubscriptionStatus();
  }, [userId]);

  const checkSupport = () => {
    const supported = 'serviceWorker' in navigator && 'PushManager' in window;
    setIsSupported(supported);
    
    if (supported && 'Notification' in window) {
      setPermission(Notification.permission);
    }
  };

  const checkSubscriptionStatus = async () => {
    if (!isSupported || !userId) {
      setIsLoading(false);
      return;
    }

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    } catch (error) {
      console.error('Error verificando suscripción:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const requestPermission = async (): Promise<boolean> => {
    if (!('Notification' in window)) {
      alert('Este navegador no soporta notificaciones');
      return false;
    }

    const permission = await Notification.requestPermission();
    setPermission(permission);
    
    return permission === 'granted';
  };

  const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    if (!isSupported || !userId) return;

    setIsLoading(true);

    try {
      // Solicitar permiso si no se ha concedido
      const hasPermission = permission === 'granted' || await requestPermission();
      
      if (!hasPermission) {
        alert('Las notificaciones están bloqueadas. Por favor, habilítalas en la configuración del navegador.');
        setIsLoading(false);
        return;
      }

      // Obtener service worker
      const registration = await navigator.serviceWorker.ready;

      // Crear suscripción
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
      });

      // Enviar suscripción al servidor
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(true);
        
        // Mostrar notificación de prueba
        new Notification('¡Notificaciones activadas!', {
          body: 'Recibirás notificaciones sobre tus partidos y ligas.',
          icon: '/icon-192x192.png',
          badge: '/icon-96x96.png'
        });
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('Error suscribiendo a notificaciones:', error);
      alert('Error al activar notificaciones. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    if (!isSupported || !userId) return;

    setIsLoading(true);

    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        await subscription.unsubscribe();
      }

      // Notificar al servidor
      const response = await fetch('/api/notifications/subscribe', {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        setIsSubscribed(false);
      } else {
        throw new Error(data.error || 'Error desconocido');
      }

    } catch (error) {
      console.error('Error desuscribiendo notificaciones:', error);
      alert('Error al desactivar notificaciones. Inténtalo de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return (
      <div className={`text-gray-500 text-sm ${className}`}>
        <BellOff className="w-4 h-4 inline mr-1" />
        Notificaciones no soportadas
      </div>
    );
  }

  if (!userId) {
    return null;
  }

  return (
    <div className={className}>
      {isSubscribed ? (
        <button
          onClick={unsubscribe}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Bell className="w-4 h-4" />
          <span>{isLoading ? 'Procesando...' : 'Notificaciones ON'}</span>
        </button>
      ) : (
        <button
          onClick={subscribe}
          disabled={isLoading}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <BellOff className="w-4 h-4" />
          <span>{isLoading ? 'Procesando...' : 'Activar Notificaciones'}</span>
        </button>
      )}
      
      {permission === 'denied' && (
        <p className="text-xs text-red-600 mt-1">
          Las notificaciones están bloqueadas. Habilítalas en la configuración del navegador.
        </p>
      )}
    </div>
  );
}

// Hook para enviar notificaciones (solo para admin)
export function usePushNotifications() {
  const [isLoading, setIsLoading] = useState(false);

  const sendNotification = async (payload: {
    title: string;
    message: string;
    targetUsers?: string[];
    leagueId?: string;
    matchId?: string;
    url?: string;
  }) => {
    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Error enviando notificación');
      }

      return data;

    } catch (error) {
      console.error('Error enviando notificación:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    sendNotification,
    isLoading
  };
} 