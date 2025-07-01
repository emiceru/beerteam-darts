import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// GET /api/users/me/leagues - Obtener ligas del usuario autenticado
export async function GET(request: NextRequest) {
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

    // Obtener participaciones del usuario
    const participations = await prisma.leagueParticipant.findMany({
      where: {
        userId: user.id,
        status: 'APPROVED'
      },
      include: {
        league: {
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
            leagueStart: true,
            leagueEnd: true,
            createdAt: true,
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
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Obtener equipos del usuario
    const teams = await prisma.team.findMany({
      where: {
        OR: [
          { player1Id: user.id },
          { player2Id: user.id }
        ],
        isActive: true
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            status: true,
          }
        },
        player1: {
          select: {
            id: true,
            name: true,
          }
        },
        player2: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    // Formatear respuesta
    const userLeagues = participations.map(participation => ({
      participationId: participation.id,
      registrationType: participation.registrationType,
      joinedAt: participation.createdAt,
      league: participation.league,
      // Encontrar el equipo correspondiente
      team: teams.find(team => team.league.id === participation.league.id)
    }))

    return NextResponse.json({
      success: true,
      leagues: userLeagues,
      totalLeagues: userLeagues.length
    })

  } catch (error) {
    console.error('Error obteniendo ligas del usuario:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 