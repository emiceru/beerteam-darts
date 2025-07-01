import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id },
      select: { id: true }
    });

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      );
    }

    // Obtener partidos de la liga
    const matches = await prisma.match.findMany({
      where: { leagueId: id },
      include: {
        team1: {
          include: {
            player1: {
              select: {
                id: true,
                name: true
              }
            },
            player2: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        team2: {
          include: {
            player1: {
              select: {
                id: true,
                name: true
              }
            },
            player2: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        winnerTeam: {
          include: {
            player1: {
              select: {
                id: true,
                name: true
              }
            },
            player2: {
              select: {
                id: true,
                name: true
              }
            }
          }
        },
        results: {
          select: {
            teamId: true,
            pointsScored: true
          }
        }
      },
      orderBy: [
        { round: 'asc' },
        { matchNumber: 'asc' }
      ]
    });

    // Formatear datos para la vista pública
    const publicMatches = matches.map((match: any) => {

      return {
        id: match.id,
        round: match.round,
        matchNumber: match.matchNumber,
        team1: {
          id: match.team1.id,
          name: match.team1.name,
          player1: match.team1.player1,
          player2: match.team1.player2
        },
        team2: {
          id: match.team2.id,
          name: match.team2.name,
          player1: match.team2.player1,
          player2: match.team2.player2
        },
        scheduledDate: match.scheduledDate,
        actualDate: match.actualDate,
        status: match.status,
        winner: match.winnerTeam ? {
          id: match.winnerTeam.id,
          name: match.winnerTeam.name,
          player1: match.winnerTeam.player1,
          player2: match.winnerTeam.player2
        } : null,
        score: match.status === 'COMPLETED' && (match.team1Score !== null || match.team2Score !== null) ? {
          team1Score: match.team1Score || 0,
          team2Score: match.team2Score || 0
        } : null
      };
    });

    return NextResponse.json(publicMatches);
  } catch (error) {
    console.error('Error fetching public matches:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 