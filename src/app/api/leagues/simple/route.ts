import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { createLeagueSchema } from '@/lib/validations'

// GET /api/leagues/simple - Obtener todas las ligas (versión simplificada)
export async function GET() {
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

// POST /api/leagues/simple - Crear nueva liga (completa)
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
    
    // Validar con el schema completo
    const validation = createLeagueSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Verificar que la temporada y tipo de competición existen
    const [season, competitionType] = await Promise.all([
      prisma.season.findUnique({ where: { id: data.seasonId } }),
      prisma.competitionType.findUnique({ where: { id: data.competitionTypeId } })
    ])

    if (!season) {
      return NextResponse.json(
        { error: 'Temporada no encontrada' },
        { status: 404 }
      )
    }

    if (!competitionType) {
      return NextResponse.json(
        { error: 'Tipo de competición no encontrado' },
        { status: 404 }
      )
    }

    // Generar slug único
    const baseSlug = data.name.toLowerCase()
      .replace(/[^a-z0-9\s]/gi, '')
      .replace(/\s+/g, '-')
      .substring(0, 50)
    
    let slug = baseSlug
    let counter = 1
    
    // Verificar que el slug sea único
    while (await prisma.league.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Preparar configuraciones JSON
    const scoringConfig = {
      points_win: data.pointsWin,
      points_draw: data.pointsDraw,
      points_loss: data.pointsLoss,
    }

    const matchDataConfig = {
      track_detailed_score: data.trackDetailedScore,
      track_game_by_game: data.trackGameByGame,
      track_throw_count: data.trackThrowCount,
      track_time: data.trackTime,
    }

    const league = await prisma.league.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        rulesDescription: data.rulesDescription,
        seasonId: data.seasonId,
        competitionTypeId: data.competitionTypeId,
        createdBy: user.id,
        gameMode: data.gameMode,
        tournamentFormat: data.tournamentFormat,
        maxParticipants: data.maxParticipants,
        status: 'DRAFT',
        isPublic: true,
        registrationOpen: true,
        autoApproveRegistrations: data.autoApproveRegistrations,
        scoringConfig,
        matchDataConfig,
        registrationStart: new Date(data.registrationStart),
        registrationEnd: new Date(data.registrationEnd),
        leagueStart: new Date(data.leagueStart),
        leagueEnd: new Date(data.leagueEnd),
      },
      include: {
        season: {
          select: {
            id: true,
            name: true,
            year: true,
          }
        },
        competitionType: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        }
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