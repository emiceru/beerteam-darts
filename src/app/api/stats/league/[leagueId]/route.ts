import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface PlayerStats {
  id: string;
  name: string;
  matches: number;
  wins: number;
  losses: number;
  winRate: number;
  totalScore: number;
  averageScore: number;
  highestScore: number;
  points: number;
  position: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { leagueId: string } }
) {
  try {
    // Verificar autenticación (opcional para acceso público)
    let decoded = null;
    const token = request.cookies.get('auth_token')?.value;
    
    if (token) {
      decoded = verifyToken(token);
    }

    const { leagueId } = params;

    // Obtener información de la liga
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      include: {
        competitionType: true,
        season: true,
        creator: {
          select: { id: true, name: true }
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, email: true }
            }
          }
        },
        matches: {
          include: {
            team1: {
              include: {
                player1: { select: { id: true, name: true } },
                player2: { select: { id: true, name: true } }
              }
            },
            team2: {
              include: {
                player1: { select: { id: true, name: true } },
                player2: { select: { id: true, name: true } }
              }
            },
            results: true
          },
          orderBy: {
            actualDate: 'desc'
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

    // Verificar acceso (solo si hay usuario autenticado)
    if (decoded) {
      const isParticipant = league.participants.some(p => p.userId === decoded.userId);
      const isCreator = league.creator.id === decoded.userId;
      const isAdmin = decoded.role === 'ADMIN';

      if (!isParticipant && !isCreator && !isAdmin && !league.isPublic) {
        return NextResponse.json(
          { error: 'Acceso denegado' },
          { status: 403 }
        );
      }
    }
    // Si no hay usuario autenticado, permitir acceso público a todas las ligas

    const matches = league.matches;
    const participants = league.participants;

    // Estadísticas generales de la liga
    const totalMatches = matches.length;
    const completedMatches = matches.filter(m => m.status === 'COMPLETED').length;
    const pendingMatches = matches.filter(m => m.status === 'SCHEDULED').length;
    const totalParticipants = participants.length;

    // Estadísticas de partidos por día (últimos 31 días)
    const matchesPerDay: Record<string, number> = {};
    const now = new Date();
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayMatches = matches.filter(match => 
        match.actualDate && 
        new Date(match.actualDate).toISOString().split('T')[0] === dateStr
      );

      matchesPerDay[dateStr] = dayMatches.length;
    }

    const dailyActivity = Object.entries(matchesPerDay).map(([date, count]) => ({
      date,
      matches: count,
      day: new Date(date).toLocaleDateString('es', { weekday: 'short' })
    }));

    // Estadísticas por jugador
    const playerStatsMap: Record<string, PlayerStats> = {};
    
    // Inicializar estadísticas para todos los participantes
    for (const participant of participants) {
      const userId = participant.userId;
      const userName = participant.user.name;

      playerStatsMap[userId] = {
        id: userId,
        name: userName,
        matches: 0,
        wins: 0,
        losses: 0,
        winRate: 0,
        totalScore: 0,
        averageScore: 0,
        highestScore: 0,
        points: 0, // Se puede obtener desde standings si existe
        position: 0
      };
    }

    // Procesar resultados de partidos
    const completedMatchesList = matches.filter(m => m.status === 'COMPLETED');
    
    for (const match of completedMatchesList) {
             // Obtener jugadores de ambos equipos
       const team1Players = [match.team1.player1Id, match.team1.player2Id].filter((id): id is string => id !== null);
       const team2Players = [match.team2.player1Id, match.team2.player2Id].filter((id): id is string => id !== null);
      const allPlayers = [...team1Players, ...team2Players];

      // Determinar equipo ganador
      const team1Won = (match.team1Score || 0) > (match.team2Score || 0);

      for (const playerId of allPlayers) {
        if (!playerStatsMap[playerId]) continue;

        playerStatsMap[playerId].matches++;

        // Determinar si este jugador ganó
        const playerInTeam1 = team1Players.includes(playerId);
        const playerWon = playerInTeam1 ? team1Won : !team1Won;

        if (playerWon) {
          playerStatsMap[playerId].wins++;
        } else {
          playerStatsMap[playerId].losses++;
        }

        // Buscar resultado individual del jugador
        const playerResult = match.results.find(r => r.playerId === playerId);
        if (playerResult) {
          const score = playerResult.pointsScored;
          playerStatsMap[playerId].totalScore += score;
          if (score > playerStatsMap[playerId].highestScore) {
            playerStatsMap[playerId].highestScore = score;
          }
        }
      }
    }

    // Calcular promedios y porcentajes
    for (const playerId in playerStatsMap) {
      const stats = playerStatsMap[playerId];
      if (stats.matches > 0) {
        stats.winRate = (stats.wins / stats.matches) * 100;
        stats.averageScore = stats.totalScore / stats.matches;
      }
    }

    // Ordenar jugadores por diferentes métricas
    const playerArray = Object.values(playerStatsMap);
    const topByWins = [...playerArray].sort((a, b) => b.wins - a.wins).slice(0, 5);
    const topByWinRate = [...playerArray]
      .filter(p => p.matches >= 3) // Solo jugadores con al menos 3 partidos
      .sort((a, b) => b.winRate - a.winRate).slice(0, 5);
    const topByAverage = [...playerArray]
      .filter(p => p.matches >= 3)
      .sort((a, b) => b.averageScore - a.averageScore).slice(0, 5);
    const topByHighest = [...playerArray]
      .sort((a, b) => b.highestScore - a.highestScore).slice(0, 5);

    // Distribución de puntuaciones
    const scoreDistribution: Record<string, number> = {};
    
    for (const match of completedMatchesList) {
      const scores = [match.team1Score || 0, match.team2Score || 0];
      for (const score of scores) {
        const range = Math.floor(score / 50) * 50; // Agrupar en rangos de 50
        const rangeKey = `${range}-${range + 49}`;
        scoreDistribution[rangeKey] = (scoreDistribution[rangeKey] || 0) + 1;
      }
    }

    const scoreRanges = Object.entries(scoreDistribution).map(([range, count]) => ({
      range,
      count,
      percentage: totalMatches > 0 ? (count / (totalMatches * 2)) * 100 : 0
    }));

    // Actividad por hora
    const hourlyActivity: Record<number, number> = {};
    for (let hour = 0; hour < 24; hour++) {
      hourlyActivity[hour] = 0;
    }

    for (const match of completedMatchesList) {
      if (match.actualDate) {
        const hour = new Date(match.actualDate).getHours();
        hourlyActivity[hour]++;
      }
    }

    const activityByHour = Object.entries(hourlyActivity).map(([hour, count]) => ({
      hour: `${hour}:00`,
      matches: count
    }));

    // Encontrar el día y hora más activos
    const mostActiveDay = dailyActivity.reduce((prev, current) => 
      prev.matches > current.matches ? prev : current, { matches: 0 });
    
    const peakHour = activityByHour.reduce((prev, current) => 
      prev.matches > current.matches ? prev : current, { matches: 0 });

    const stats = {
      league: {
        id: league.id,
        name: league.name,
        description: league.description,
        status: league.status,
        competitionType: league.competitionType.name,
        season: league.season.name,
        creator: league.creator.name,
        isPublic: league.isPublic,
        createdAt: league.createdAt,
                 startDate: league.season.startDate,
         endDate: league.season.endDate
      },
      overview: {
        totalParticipants,
        totalMatches,
        completedMatches,
        pendingMatches,
        completionRate: totalMatches > 0 ? (completedMatches / totalMatches) * 100 : 0,
        averageMatchesPerPlayer: totalParticipants > 0 ? totalMatches / totalParticipants : 0
      },
      rankings: {
        topByWins,
        topByWinRate,
        topByAverage,
        topByHighest
      },
      activity: {
        dailyActivity,
        activityByHour
      },
      analysis: {
        scoreDistribution: scoreRanges,
        averageScore: completedMatchesList.length > 0 ? 
          completedMatchesList.reduce((sum, m) => sum + (m.team1Score || 0) + (m.team2Score || 0), 0) / (completedMatchesList.length * 2) : 0,
        highestScore: completedMatchesList.reduce((max, m) => 
          Math.max(max, m.team1Score || 0, m.team2Score || 0), 0),
        mostActiveDay,
        peakHour
      }
    };

    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas de la liga:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 