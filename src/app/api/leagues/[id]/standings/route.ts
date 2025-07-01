import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/leagues/[id]/standings - Obtener clasificaciones de una liga
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

    const standings = await prisma.standing.findMany({
      where: {
        leagueId: league.id
      },
      include: {
        team: {
          include: {
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
        }
      },
      orderBy: [
        { position: 'asc' }
      ]
    })

    return NextResponse.json({
      success: true,
      standings
    })

  } catch (error) {
    console.error('Error obteniendo clasificaciones:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 