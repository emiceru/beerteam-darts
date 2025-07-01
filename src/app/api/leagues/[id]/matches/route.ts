import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/leagues/[id]/matches - Obtener partidos de una liga
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Buscar liga por ID o slug
    let league = await prisma.league.findUnique({
      where: { id },
      select: { id: true }
    })

    if (!league) {
      league = await prisma.league.findUnique({
        where: { slug: id },
        select: { id: true }
      })
    }

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    const matches = await prisma.match.findMany({
      where: {
        leagueId: league.id
      },
      include: {
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