import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    const leagues = await prisma.league.findMany({
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
            name: true
          }
        },
        competitionType: {
          select: {
            id: true,
            name: true
          }
        },
        participants: {
          select: {
            id: true
          }
        },
        matches: {
          select: {
            id: true,
            status: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { leagueStart: 'desc' }
      ]
    });

    const leaguesWithStats = leagues.map((league: any) => ({
      id: league.id,
      name: league.name,
      description: league.description,
      status: league.status,
      competitionType: league.competitionType.name,
      season: league.season.name,
      creator: league.creator.name,
      startDate: league.leagueStart,
      endDate: league.leagueEnd,
      participantCount: league.participants.length,
      matchCount: league.matches.length,
      completedMatches: league.matches.filter((match: any) => match.status === 'COMPLETED').length
    }));

    return NextResponse.json(leaguesWithStats);
  } catch (error) {
    console.error('Error fetching public leagues:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 