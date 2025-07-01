import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const league = await prisma.league.findUnique({
      where: { id },
      include: {
        creator: {
          select: {
            id: true,
            name: true
          }
        },
        season: {
          select: {
            id: true,
            name: true,
            year: true
          }
        },
        competitionType: {
          select: {
            id: true,
            name: true
          }
        }
      }
    });

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      );
    }

    // Devolver datos básicos de la liga para vista pública
    const publicLeagueData = {
      id: league.id,
      name: league.name,
      description: league.description,
      status: league.status,
      competitionType: league.competitionType.name,
      season: league.season.name,
      creator: league.creator.name,
      startDate: league.leagueStart,
      endDate: league.leagueEnd,
      gameMode: league.gameMode,
      tournamentFormat: league.tournamentFormat
    };

    return NextResponse.json(publicLeagueData);
  } catch (error) {
    console.error('Error fetching public league:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 