import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// PATCH /api/admin/matches/[matchId]/result - Registrar resultado de partido
export async function PATCH(
  request: NextRequest,
  { params }: { params: { matchId: string } }
) {
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
        { error: 'No tienes permisos para registrar resultados' },
        { status: 403 }
      )
    }

    const { matchId } = params
    const body = await request.json()
    const { team1Score, team2Score } = body

    if (typeof team1Score !== 'number' || typeof team2Score !== 'number') {
      return NextResponse.json(
        { error: 'Puntuaciones inválidas' },
        { status: 400 }
      )
    }

    // Verificar que el partido existe
    const match = await prisma.match.findUnique({
      where: { id: matchId },
      include: {
        league: {
          select: {
            id: true,
            scoringConfig: true,
            tournamentFormat: true,
          }
        },
        team1: { select: { id: true } },
        team2: { select: { id: true } }
      }
    })

    if (!match) {
      return NextResponse.json(
        { error: 'Partido no encontrado' },
        { status: 404 }
      )
    }

    if (match.status === 'COMPLETED') {
      return NextResponse.json(
        { error: 'El partido ya ha sido finalizado' },
        { status: 400 }
      )
    }

    // Determinar ganador
    let winnerTeamId: string | null = null
    if (team1Score > team2Score) {
      winnerTeamId = match.team1Id
    } else if (team2Score > team1Score) {
      winnerTeamId = match.team2Id
    }
    // Si es empate, winnerTeamId queda null

    // Actualizar partido
    const updatedMatch = await prisma.match.update({
      where: { id: matchId },
      data: {
        team1Score,
        team2Score,
        winnerTeamId,
                 status: 'COMPLETED',
        actualDate: new Date(),
        resultEnteredBy: user.id,
        resultEnteredAt: new Date(),
      }
    })

    // Actualizar clasificaciones si es round robin
    if (match.league.tournamentFormat === 'ROUND_ROBIN') {
      await updateStandings(match.leagueId, match.team1Id, match.team2Id, team1Score, team2Score, match.league.scoringConfig)
    }

    return NextResponse.json({
      success: true,
      message: 'Resultado registrado exitosamente',
      match: updatedMatch
    })

  } catch (error) {
    console.error('Error registrando resultado:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// Función auxiliar para actualizar clasificaciones
async function updateStandings(
  leagueId: string, 
  team1Id: string, 
  team2Id: string, 
  team1Score: number, 
  team2Score: number,
          scoringConfig: any
) {
  const config = scoringConfig || { points_win: 3, points_draw: 1, points_loss: 0 }
  
  // Obtener clasificaciones actuales
  const [team1Standing, team2Standing] = await Promise.all([
    prisma.standing.findUnique({
      where: { leagueId_teamId: { leagueId, teamId: team1Id } }
    }),
    prisma.standing.findUnique({
      where: { leagueId_teamId: { leagueId, teamId: team2Id } }
    })
  ])

  if (!team1Standing || !team2Standing) {
    throw new Error('Clasificaciones no encontradas')
  }

  let team1Points = 0, team2Points = 0
  let team1Wins = 0, team1Draws = 0, team1Losses = 0
  let team2Wins = 0, team2Draws = 0, team2Losses = 0

  if (team1Score > team2Score) {
    // Team1 gana
    team1Points = config.points_win
    team2Points = config.points_loss
    team1Wins = 1
    team2Losses = 1
  } else if (team2Score > team1Score) {
    // Team2 gana
    team1Points = config.points_loss
    team2Points = config.points_win
    team1Losses = 1
    team2Wins = 1
  } else {
    // Empate
    team1Points = config.points_draw
    team2Points = config.points_draw
    team1Draws = 1
    team2Draws = 1
  }

  // Actualizar clasificaciones
  await Promise.all([
    prisma.standing.update({
      where: { leagueId_teamId: { leagueId, teamId: team1Id } },
      data: {
        matchesPlayed: { increment: 1 },
        matchesWon: { increment: team1Wins },
        matchesDrawn: { increment: team1Draws },
        matchesLost: { increment: team1Losses },
        points: { increment: team1Points },
        gamesWon: { increment: team1Score },
        gamesLost: { increment: team2Score },
        pointsFor: { increment: team1Score },
        pointsAgainst: { increment: team2Score },
        pointDifference: { increment: team1Score - team2Score },
        lastUpdated: new Date(),
      }
    }),
    prisma.standing.update({
      where: { leagueId_teamId: { leagueId, teamId: team2Id } },
      data: {
        matchesPlayed: { increment: 1 },
        matchesWon: { increment: team2Wins },
        matchesDrawn: { increment: team2Draws },
        matchesLost: { increment: team2Losses },
        points: { increment: team2Points },
        gamesWon: { increment: team2Score },
        gamesLost: { increment: team1Score },
        pointsFor: { increment: team2Score },
        pointsAgainst: { increment: team1Score },
        pointDifference: { increment: team2Score - team1Score },
        lastUpdated: new Date(),
      }
    })
  ])

  // Recalcular posiciones
  await recalculatePositions(leagueId)
}

// Función auxiliar para recalcular posiciones
async function recalculatePositions(leagueId: string) {
  const standings = await prisma.standing.findMany({
    where: { leagueId },
    orderBy: [
      { points: 'desc' },
      { pointDifference: 'desc' },
      { pointsFor: 'desc' }
    ]
  })

  // Actualizar posiciones
  for (let i = 0; i < standings.length; i++) {
    await prisma.standing.update({
      where: { id: standings[i].id },
      data: { position: i + 1 }
    })
  }
} 