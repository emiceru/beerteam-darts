import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/competition-types - Obtener todos los tipos de competición
export async function GET() {
  try {
    const competitionTypes = await prisma.competitionType.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        rulesDescription: true,
        defaultScoringConfig: true,
        isActive: true,
        createdAt: true,
      },
      where: {
        isActive: true
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      competitionTypes
    })

  } catch (error) {
    console.error('Error obteniendo tipos de competición:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 