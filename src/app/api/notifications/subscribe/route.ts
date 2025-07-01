import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { subscription } = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: 'Datos de suscripción inválidos' },
        { status: 400 }
      );
    }

    // Buscar o crear configuración de notificaciones
    const notificationSettings = await prisma.notificationSetting.upsert({
      where: {
        userId: decoded.userId
      },
      update: {
        pushEnabled: true,
        pushEndpoint: subscription.endpoint,
        pushP256dh: subscription.keys.p256dh,
        pushAuth: subscription.keys.auth,
      },
      create: {
        userId: decoded.userId,
        pushEnabled: true,
        pushEndpoint: subscription.endpoint,
        pushP256dh: subscription.keys.p256dh,
        pushAuth: subscription.keys.auth,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción a notificaciones activada',
      settings: {
        pushEnabled: notificationSettings.pushEnabled,
        pushMatchReminders: notificationSettings.pushMatchReminders,
        pushResults: notificationSettings.pushResults,
        pushLeagueUpdates: notificationSettings.pushLeagueUpdates,
      }
    });

  } catch (error) {
    console.error('Error en suscripción push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    // Deshabilitar notificaciones push
    await prisma.notificationSetting.update({
      where: {
        userId: decoded.userId
      },
      data: {
        pushEnabled: false,
        pushEndpoint: null,
        pushP256dh: null,
        pushAuth: null,
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Suscripción a notificaciones desactivada'
    });

  } catch (error) {
    console.error('Error deshabilitando push:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 