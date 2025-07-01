import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// GET /api/admin/matches - Obtener partidos (solo admin)
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación de admin
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
        { error: 'No tienes permisos para acceder a los partidos' },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')

    // Construir filtros
    const where = leagueId ? { leagueId } : {}

    const matches = await prisma.match.findMany({
      where,
      include: {
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        },
        team1: {
          select: {
            id: true,
            name: true,
          }
        },
        team2: {
          select: {
            id: true,
            name: true,
          }
        },
        winnerTeam: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { league: { name: 'asc' } },
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      matches
    })

  } catch (error) {
    console.error('Error obteniendo partidos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 