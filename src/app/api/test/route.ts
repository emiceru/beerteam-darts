import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/test - Probar conectividad con la base de datos
export async function GET(request: NextRequest) {
  try {
    // Probar conexión a la base de datos
    const userCount = await prisma.user.count()
    const leagueCount = await prisma.league.count()
    const seasonCount = await prisma.season.count()
    const competitionTypeCount = await prisma.competitionType.count()

    return NextResponse.json({
      success: true,
      message: 'API funcionando correctamente',
      database: {
        connected: true,
        counts: {
          users: userCount,
          leagues: leagueCount,
          seasons: seasonCount,
          competitionTypes: competitionTypeCount
        }
      },
      timestamp: new Date().toISOString(),
      availableEndpoints: {
        auth: [
          'POST /api/auth/login',
          'POST /api/auth/register', 
          'GET /api/auth/me',
          'POST /api/auth/logout'
        ],
        leagues: [
          'GET /api/leagues/simple',
          'POST /api/leagues/simple',
          'GET /api/users/me/leagues'
        ],
        data: [
          'GET /api/seasons',
          'GET /api/competition-types'
        ],
        test: [
          'GET /api/test',
          'GET /api/health'
        ]
      }
    })

  } catch (error) {
    console.error('Error en test:', error)
    return NextResponse.json({
      success: false,
      message: 'Error de conectividad',
      error: error instanceof Error ? error.message : 'Error desconocido',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
} 