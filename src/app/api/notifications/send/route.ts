import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';
import webpush from 'web-push';

// Configurar web-push con claves VAPID
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'BM4L7vKdWR4WlkbSe-LOEnmEdA4yMJUaX8GBq_Rx6kFTysAl9epbjhQatyHaxJt4V8hHlQAgJDeLu94FAf3RyAs',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'wFnK_8vCMYog8IHQCmV7FNCzmmTXM3lF4fFNEkrCvI4'
};

webpush.setVapidDetails(
  'mailto:admin@beerteam.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación - solo admin puede enviar notificaciones
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado - Se requiere permisos de administrador' },
        { status: 403 }
      );
    }

    const { 
      title, 
      message, 
      targetUsers, 
      leagueId, 
      matchId,
      icon = '/icon-192x192.png',
      badge = '/icon-96x96.png',
      url = '/dashboard'
    } = await request.json();

    if (!title || !message) {
      return NextResponse.json(
        { error: 'Título y mensaje son requeridos' },
        { status: 400 }
      );
    }

    // Obtener usuarios objetivo
    let usersToNotify = [];
    
    if (targetUsers && targetUsers.length > 0) {
      // Usuarios específicos
      usersToNotify = await prisma.notificationSetting.findMany({
        where: {
          userId: { in: targetUsers },
          pushEnabled: true,
          pushEndpoint: { not: null }
        },
        include: {
          user: true
        }
      });
    } else if (leagueId) {
      // Todos los participantes de una liga
      usersToNotify = await prisma.notificationSetting.findMany({
        where: {
          pushEnabled: true,
          pushEndpoint: { not: null },
          user: {
            participations: {
              some: {
                league: { id: leagueId }
              }
            }
          }
        },
        include: {
          user: true
        }
      });
    } else {
      // Todos los usuarios con notificaciones habilitadas
      usersToNotify = await prisma.notificationSetting.findMany({
        where: {
          pushEnabled: true,
          pushEndpoint: { not: null }
        },
        include: {
          user: true
        }
      });
    }

    const payload = JSON.stringify({
      title,
      body: message,
      icon,
      badge,
      data: {
        url,
        leagueId,
        matchId,
        timestamp: Date.now()
      },
      actions: [
        {
          action: 'open',
          title: 'Ver detalles'
        }
      ]
    });

    let successCount = 0;
    let errorCount = 0;
    const results = [];

    // Enviar notificaciones a cada usuario
    for (const userSetting of usersToNotify) {
      try {
        const subscription = {
          endpoint: userSetting.pushEndpoint!,
          keys: {
            p256dh: userSetting.pushP256dh!,
            auth: userSetting.pushAuth!
          }
        };

        await webpush.sendNotification(subscription, payload);
        
        // Registrar notificación en la base de datos
        await prisma.notification.create({
          data: {
            userId: userSetting.userId,
            type: 'push',
            title,
            message,
            data: { leagueId, matchId, url },
            sentPush: true,
            leagueId,
            matchId
          }
        });

        successCount++;
        results.push({
          userId: userSetting.userId,
          userName: userSetting.user.name,
          status: 'success'
        });

      } catch (error) {
        console.error(`Error enviando push a ${userSetting.user.name}:`, error);
        errorCount++;
        results.push({
          userId: userSetting.userId,
          userName: userSetting.user.name,
          status: 'error',
          error: error instanceof Error ? error.message : 'Error desconocido'
        });

        // Si la suscripción es inválida, deshabilitar
        if (error instanceof Error && (
          error.message.includes('410') || 
          error.message.includes('invalid') ||
          error.message.includes('expired')
        )) {
          await prisma.notificationSetting.update({
            where: { userId: userSetting.userId },
            data: { 
              pushEnabled: false,
              pushEndpoint: null,
              pushP256dh: null,
              pushAuth: null
            }
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: `Notificaciones enviadas: ${successCount} exitosas, ${errorCount} fallidas`,
      stats: {
        total: usersToNotify.length,
        success: successCount,
        errors: errorCount
      },
      results
    });

  } catch (error) {
    console.error('Error enviando notificaciones:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 