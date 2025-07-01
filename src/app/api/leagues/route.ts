import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// Schema para crear liga
const createLeagueSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  description: z.string().min(10, 'La descripción debe tener al menos 10 caracteres'),
  rulesDescription: z.string().optional(),
  seasonId: z.string().cuid('ID de temporada inválido'),
  competitionTypeId: z.string().cuid('ID de tipo de competición inválido'),
  gameMode: z.enum(['INDIVIDUAL', 'PAIRS']),
  tournamentFormat: z.enum(['ROUND_ROBIN', 'KNOCKOUT', 'HYBRID']),
  maxParticipants: z.number().int().min(2).max(100).optional(),
  registrationOpen: z.boolean().default(true),
  autoApproveRegistrations: z.boolean().default(false),
  isPublic: z.boolean().default(true),
})

// GET /api/leagues - Obtener todas las ligas
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const isPublic = searchParams.get('public')
    const seasonId = searchParams.get('seasonId')

    // Construir filtros
    const where: any = {}
    
    if (status && ['DRAFT', 'REGISTRATION', 'ACTIVE', 'FINISHED', 'CANCELLED'].includes(status)) {
      where.status = status
    }
    
    if (isPublic === 'true') {
      where.isPublic = true
    }
    
    if (seasonId) {
      where.seasonId = seasonId
    }

    // Obtener ligas básicas
    const leagues = await prisma.league.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        gameMode: true,
        tournamentFormat: true,
        maxParticipants: true,
        status: true,
        isPublic: true,
        registrationOpen: true,
        registrationStart: true,
        registrationEnd: true,
        leagueStart: true,
        leagueEnd: true,
        createdAt: true,
        season: {
          select: {
            id: true,
            name: true,
            isActive: true,
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
      orderBy: [
        { status: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Obtener conteo de participantes por separado
    const leaguesWithCounts = await Promise.all(
      leagues.map(async (league) => {
        const participantCount = await prisma.leagueParticipant.count({
          where: {
            leagueId: league.id,
            status: 'APPROVED'
          }
        })

        return {
          ...league,
          participantCount
        }
      })
    )

    return NextResponse.json({
      success: true,
      leagues: leaguesWithCounts
    })

  } catch (error) {
    console.error('Error obteniendo ligas:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/leagues - Crear nueva liga
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
    if (!user) {
      return NextResponse.json(
        { error: 'Token inválido o expirado' },
        { status: 401 }
      )
    }

    // Solo administradores pueden crear ligas
    if (user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No tienes permisos para crear ligas' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = createLeagueSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const data = validation.data

    // Generar slug único
    const baseSlug = data.name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()

    let slug = baseSlug
    let counter = 1

    while (await prisma.league.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`
      counter++
    }

    // Verificar que la temporada existe
    const season = await prisma.season.findUnique({
      where: { id: data.seasonId }
    })

    if (!season) {
      return NextResponse.json(
        { error: 'Temporada no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que el tipo de competición existe
    const competitionType = await prisma.competitionType.findUnique({
      where: { id: data.competitionTypeId }
    })

    if (!competitionType) {
      return NextResponse.json(
        { error: 'Tipo de competición no encontrado' },
        { status: 404 }
      )
    }

    // Crear liga
    const league = await prisma.league.create({
      data: {
        name: data.name,
        slug,
        description: data.description,
        rulesDescription: data.rulesDescription || '',
        seasonId: data.seasonId,
        competitionTypeId: data.competitionTypeId,
        createdBy: user.id,
        gameMode: data.gameMode,
        tournamentFormat: data.tournamentFormat,
        maxParticipants: data.maxParticipants,
        registrationOpen: data.registrationOpen,
        autoApproveRegistrations: data.autoApproveRegistrations,
        isPublic: data.isPublic,
        status: 'DRAFT',
        scoringConfig: competitionType.defaultScoringConfig || {},
        matchDataConfig: {
          track_detailed_score: true,
          track_game_by_game: true,
          track_throw_count: false,
          track_time: false,
          required_fields: ['team1_score', 'team2_score', 'winner']
        }
      },
      include: {
        season: true,
        competitionType: true,
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