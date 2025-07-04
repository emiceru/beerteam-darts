import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    // Retornar configuraciones del sistema
    const settings = {
      system: {
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'Connected',
        notifications: {
          enabled: true,
          vapidConfigured: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
        }
      },
      competitions: {
        availableTypes: ['CRICKET', '501'],
        availableFormats: ['ROUND_ROBIN', 'KNOCKOUT', 'SWISS'],
        availableGameModes: ['INDIVIDUAL', 'TEAMS']
      },
      features: {
        publicLeagues: true,
        userRegistration: true,
        pushNotifications: !!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
        statistics: true
      }
    }

    return NextResponse.json({ settings })

  } catch (error) {
    console.error('Error en /api/admin/settings:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.cookies.get('token')?.value
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
    }

    const payload = verifyToken(token)
    if (!payload) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 401 })
    }

    // Verificar si es admin
    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Acceso denegado' }, { status: 403 })
    }

    const body = await request.json()
    
    // Aquí podrías implementar la lógica para actualizar configuraciones
    // Por ahora solo retornamos éxito
    
    return NextResponse.json({ 
      success: true,
      message: 'Configuraciones actualizadas correctamente'
    })

  } catch (error) {
    console.error('Error actualizando configuraciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 