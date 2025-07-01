import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { verifyToken } from '@/lib/auth';

interface CompetitionStats {
  matches: number;
  wins: number;
  totalScore: number;
  highestScore: number;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verificar autenticación
    const token = request.cookies.get('auth_token')?.value;
    if (!token) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      );
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const requesterId = decoded.userId;

    // Solo el propio usuario o un admin puede ver estadísticas detalladas
    if (requesterId !== userId && decoded.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Acceso denegado' },
        { status: 403 }
      );
    }

    // Obtener información básica del usuario
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Usuario no encontrado' },
        { status: 404 }
      );
    }

    // Obtener participaciones del usuario
    const participations = await prisma.leagueParticipant.findMany({
      where: { userId },
      include: {
        league: {
          include: {
            competitionType: true,
            season: true
          }
        }
      }
    });

    // Obtener equipos donde participa el usuario
    const userTeams = await prisma.team.findMany({
      where: {
        OR: [
          { player1Id: userId },
          { player2Id: userId }
        ]
      },
      select: { id: true }
    });

    const teamIds = userTeams.map(team => team.id);

    // Obtener partidos donde participan los equipos del usuario
    const matches = await prisma.match.findMany({
      where: {
        OR: [
          { team1Id: { in: teamIds } },
          { team2Id: { in: teamIds } }
        ],
        status: 'COMPLETED'
      },
      include: {
        league: {
          include: {
            competitionType: true
          }
        },
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
        results: {
          where: { playerId: userId }
        }
      },
      orderBy: {
        actualDate: 'desc'
      }
    });

    // Calcular estadísticas generales
    const totalMatches = matches.length;
    const wins = matches.filter(match => {
      // Determinar si el usuario está en team1 o team2
      const userInTeam1 = match.team1.player1Id === userId || match.team1.player2Id === userId;
      const userInTeam2 = match.team2.player1Id === userId || match.team2.player2Id === userId;
      
      if (userInTeam1) {
        return (match.team1Score || 0) > (match.team2Score || 0);
      } else if (userInTeam2) {
        return (match.team2Score || 0) > (match.team1Score || 0);
      }
      return false;
    }).length;
    const losses = totalMatches - wins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    // Estadísticas por tipo de competición
    const statsByCompetition: Record<string, CompetitionStats> = {};
    for (const match of matches) {
      const compType = match.league.competitionType.name;
      if (!statsByCompetition[compType]) {
        statsByCompetition[compType] = {
          matches: 0,
          wins: 0,
          totalScore: 0,
          highestScore: 0
        };
      }

      statsByCompetition[compType].matches++;
      
      // Usar resultados individuales del jugador si están disponibles
      const userResult = match.results.find(r => r.playerId === userId);
      const userScore = userResult ? userResult.pointsScored : 0;
      
      // Determinar si ganó
      const userInTeam1 = match.team1.player1Id === userId || match.team1.player2Id === userId;
      const teamWon = userInTeam1 ? 
        (match.team1Score || 0) > (match.team2Score || 0) :
        (match.team2Score || 0) > (match.team1Score || 0);

      if (teamWon) {
        statsByCompetition[compType].wins++;
      }

      statsByCompetition[compType].totalScore += userScore;
      if (userScore > statsByCompetition[compType].highestScore) {
        statsByCompetition[compType].highestScore = userScore;
      }
    }

    // Rendimiento por mes (últimos 12 meses)
    const monthlyPerformance = [];
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const nextMonth = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      
      const monthMatches = matches.filter(match => 
        match.actualDate && 
        new Date(match.actualDate) >= date && 
        new Date(match.actualDate) < nextMonth
      );

      const monthWins = monthMatches.filter(match => {
        const userInTeam1 = match.team1.player1Id === userId || match.team1.player2Id === userId;
        const userInTeam2 = match.team2.player1Id === userId || match.team2.player2Id === userId;
        
        if (userInTeam1) {
          return (match.team1Score || 0) > (match.team2Score || 0);
        } else if (userInTeam2) {
          return (match.team2Score || 0) > (match.team1Score || 0);
        }
        return false;
      }).length;

      monthlyPerformance.push({
        month: date.toLocaleString('es', { month: 'short', year: 'numeric' }),
        matches: monthMatches.length,
        wins: monthWins,
        winRate: monthMatches.length > 0 ? (monthWins / monthMatches.length) * 100 : 0
      });
    }

    // Últimos partidos
    const recentMatches = matches.slice(0, 10).map(match => {
      const userInTeam1 = match.team1.player1Id === userId || match.team1.player2Id === userId;
      const userTeam = userInTeam1 ? match.team1 : match.team2;
      const opponentTeam = userInTeam1 ? match.team2 : match.team1;
      const userResult = match.results.find(r => r.playerId === userId);
      
      // Determinar nombre del oponente
      let opponentName = '';
      if (opponentTeam.player1Id !== userId) {
        opponentName = opponentTeam.player1.name;
        if (opponentTeam.player2) {
          opponentName += ` & ${opponentTeam.player2.name}`;
        }
      }

      return {
        id: match.id,
        date: match.actualDate,
        league: match.league.name,
        competitionType: match.league.competitionType.name,
        opponent: opponentName,
        userScore: userResult ? userResult.pointsScored : 0,
        opponentScore: userInTeam1 ? (match.team2Score || 0) : (match.team1Score || 0),
        result: userInTeam1 ? 
          ((match.team1Score || 0) > (match.team2Score || 0) ? 'win' : 'loss') :
          ((match.team2Score || 0) > (match.team1Score || 0) ? 'win' : 'loss')
      };
    });

    // Calcular racha actual
    let currentStreak = 0;
    let streakType = 'none';
    for (const match of matches) {
      const userInTeam1 = match.team1.player1Id === userId || match.team1.player2Id === userId;
      const isWin = userInTeam1 ? 
        (match.team1Score || 0) > (match.team2Score || 0) :
        (match.team2Score || 0) > (match.team1Score || 0);
      
      if (currentStreak === 0) {
        currentStreak = 1;
        streakType = isWin ? 'win' : 'loss';
      } else if ((streakType === 'win' && isWin) || (streakType === 'loss' && !isWin)) {
        currentStreak++;
      } else {
        break;
      }
    }

    const stats = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        memberSince: user.createdAt
      },
      overview: {
        totalMatches,
        wins,
        losses,
        winRate: Math.round(winRate * 100) / 100,
        totalLeagues: participations.length,
        activeLeagues: participations.filter(p => p.league.status === 'ACTIVE').length,
        currentStreak,
        streakType
      },
      byCompetition: statsByCompetition,
      monthlyPerformance,
      recentMatches,
      achievements: {
        perfectGames: matches.filter(match => {
          const userResult = match.results.find(r => r.playerId === userId);
          return userResult && userResult.pointsScored === 501; // Para Cricket sería diferente
        }).length,
        comebackWins: 0, // Se puede calcular con más detalle
        longestWinStreak: 0, // Se puede calcular analizando todo el historial
      }
    };

    return NextResponse.json({ success: true, stats });

  } catch (error) {
    console.error('Error obteniendo estadísticas del jugador:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 