import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/seasons - Obtener todas las temporadas
export async function GET(request: NextRequest) {
  try {
    const seasons = await prisma.season.findMany({
      select: {
        id: true,
        name: true,
        year: true,
        startDate: true,
        endDate: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: [
        { isActive: 'desc' }, // Activas primero
        { startDate: 'desc' }  // Más recientes primero
      ]
    })

    return NextResponse.json({
      success: true,
      seasons
    })

  } catch (error) {
    console.error('Error obteniendo temporadas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 