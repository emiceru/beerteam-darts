import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

// POST /api/admin/matches/generate - Generar partidos para una liga
export async function POST(request: NextRequest) {
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
        { error: 'No tienes permisos para generar partidos' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { leagueId } = body

    if (!leagueId) {
      return NextResponse.json(
        { error: 'ID de liga requerido' },
        { status: 400 }
      )
    }

    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        tournamentFormat: true,
        status: true,
      }
    })

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que no hay partidos ya generados
    const existingMatches = await prisma.match.count({
      where: { leagueId }
    })

    if (existingMatches > 0) {
      return NextResponse.json(
        { error: 'Ya existen partidos para esta liga' },
        { status: 400 }
      )
    }

    // Obtener equipos aprobados de la liga
    const teams = await prisma.team.findMany({
      where: {
        leagueId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
      }
    })

    if (teams.length < 2) {
      return NextResponse.json(
        { error: 'Se necesitan al menos 2 equipos para generar partidos' },
        { status: 400 }
      )
    }

    let matches: any[] = []

    if (league.tournamentFormat === 'ROUND_ROBIN') {
      // Generar partidos de todos contra todos
      let matchNumber = 1
      const rounds = teams.length - 1
      
      for (let round = 1; round <= rounds; round++) {
        for (let i = 0; i < teams.length / 2; i++) {
          const team1 = teams[i]
          const team2 = teams[teams.length - 1 - i]
          
          if (team1 && team2) {
            matches.push({
              leagueId,
              round,
              matchNumber: matchNumber++,
              team1Id: team1.id,
              team2Id: team2.id,
              status: 'SCHEDULED',
              createdBy: user.id,
            })
          }
        }
        
        // Rotar equipos (excepto el primero)
        const last = teams.pop()
        if (last) {
          teams.splice(1, 0, last)
        }
      }
    } else if (league.tournamentFormat === 'KNOCKOUT') {
      // Generar partidos de eliminación directa
      let currentRound = 1
      let currentTeams = [...teams]
      let matchNumber = 1

      while (currentTeams.length > 1) {
        const roundMatches = []
        
        for (let i = 0; i < currentTeams.length; i += 2) {
          if (currentTeams[i + 1]) {
            roundMatches.push({
              leagueId,
              round: currentRound,
              matchNumber: matchNumber++,
              team1Id: currentTeams[i].id,
              team2Id: currentTeams[i + 1].id,
              status: 'SCHEDULED',
              createdBy: user.id,
            })
          }
        }
        
        matches.push(...roundMatches)
        currentRound++
        
        // Para knockout, los equipos de la siguiente ronda se determinarán después de los resultados
        currentTeams = currentTeams.slice(0, Math.floor(currentTeams.length / 2))
      }
    } else {
      return NextResponse.json(
        { error: 'Formato de torneo no soportado' },
        { status: 400 }
      )
    }

    // Crear partidos en la base de datos
    await prisma.match.createMany({
      data: matches
    })

    // Si el formato es round robin, crear tabla de clasificación inicial
    if (league.tournamentFormat === 'ROUND_ROBIN') {
      const standingsData = teams.map((team, index) => ({
        leagueId,
        teamId: team.id,
        position: index + 1,
        matchesPlayed: 0,
        matchesWon: 0,
        matchesDrawn: 0,
        matchesLost: 0,
        points: 0,
        gamesWon: 0,
        gamesLost: 0,
        pointsFor: 0,
        pointsAgainst: 0,
        winPercentage: 0,
        pointDifference: 0,
      }))

      await prisma.standing.createMany({
        data: standingsData
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Partidos generados exitosamente',
      matchesCreated: matches.length
    }, { status: 201 })

  } catch (error) {
    console.error('Error generando partidos:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 