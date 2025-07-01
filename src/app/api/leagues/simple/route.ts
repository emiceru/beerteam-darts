import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// GET /api/leagues/simple - Obtener todas las ligas (versión simplificada)
export async function GET(_request: NextRequest) {
  try {
    const leagues = await prisma.league.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        gameMode: true,
        tournamentFormat: true,
        status: true,
        isPublic: true,
        registrationOpen: true,
        createdAt: true,
        season: {
          select: {
            id: true,
            name: true,
          }
        },
        competitionType: {
          select: {
            id: true,
            name: true,
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      leagues
    })

  } catch (error) {
    console.error('Error obteniendo ligas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/leagues/simple - Crear nueva liga (versión simplificada)
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value || 
                  request.headers.get('authorization')?.replace('Bearer ', '')

    if (!token) {
      return NextResponse.json(
        { error: 'Token de autenticación requerido' },
        { status: 401 }
      )
    }

    const user = await getUserFromToken(token)
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear ligas' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, seasonId, competitionTypeId } = body

    if (!name || !description || !seasonId || !competitionTypeId) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Generar slug simple
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-') + '-' + Date.now()

    const league = await prisma.league.create({
      data: {
        name,
        slug,
        description,
        rulesDescription: '',
        seasonId,
        competitionTypeId,
        createdBy: user.id,
        gameMode: 'INDIVIDUAL',
        tournamentFormat: 'ROUND_ROBIN',
        status: 'DRAFT',
        isPublic: true,
        registrationOpen: true,
        autoApproveRegistrations: false,
        scoringConfig: {},
        matchDataConfig: {},
        registrationStart: new Date(),
        registrationEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 días
        leagueStart: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000),
        leagueEnd: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Liga creada exitosamente',
      league
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando liga:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 