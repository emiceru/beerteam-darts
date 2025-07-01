import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET /api/leagues/[id] - Obtener liga por ID o slug
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Intentar buscar por ID primero, luego por slug
    let league = await prisma.league.findUnique({
      where: { id },
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
            description: true,
            rulesDescription: true,
          }
        },
        creator: {
          select: {
            id: true,
            name: true,
          }
        },
        _count: {
          select: {
            participants: true,
          }
        }
      }
    })

    // Si no se encuentra por ID, intentar por slug
    if (!league) {
      league = await prisma.league.findUnique({
        where: { slug: id },
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
              description: true,
              rulesDescription: true,
            }
          },
          creator: {
            select: {
              id: true,
              name: true,
            }
          },
          _count: {
            select: {
              participants: true,
            }
          }
        }
      })
    }

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      league
    })

  } catch (error) {
    console.error('Error obteniendo liga:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 