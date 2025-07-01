import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

type Context = {
  params: Promise<{ id: string }>
}

const bulkActionSchema = z.object({
  action: z.enum(['approve', 'reject', 'delete']),
  participantIds: z.array(z.string().cuid()).min(1, 'Selecciona al menos un participante'),
  reason: z.string().optional(), // Para rechazos
})

// GET /api/leagues/[id]/participants - Obtener participantes de una liga
export async function GET(
  request: NextRequest,
  { params }: Context
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
        { error: 'No tienes permisos para gestionar participantes' },
        { status: 403 }
      )
    }

    const { id: leagueId } = await params

    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        autoApproveRegistrations: true,
      }
    })

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // Obtener parámetros de filtro
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const registrationType = searchParams.get('registrationType')

    // Construir filtros
    const where: any = {
      leagueId
    }

    if (status) {
      where.status = status
    }

    if (registrationType) {
      where.registrationType = registrationType
    }

    if (search) {
      where.OR = [
        {
          user: {
            name: {
              contains: search,
              mode: 'insensitive'
            }
          }
        },
        {
          user: {
            email: {
              contains: search,
              mode: 'insensitive'
            }
          }
        }
      ]
    }

    // Obtener participantes con información completa
    const participants = await prisma.leagueParticipant.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            avatarUrl: true,
            emailVerified: true,
            isActive: true,
            createdAt: true,
          }
        },
        joinLink: {
          select: {
            id: true,
            code: true,
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
          }
        }
      },
      orderBy: [
        { status: 'asc' }, // PENDING primero
        { createdAt: 'desc' }
      ]
    })

    // Obtener estadísticas
    const stats = await prisma.leagueParticipant.groupBy({
      by: ['status'],
      where: { leagueId },
      _count: {
        status: true
      }
    })

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    const totalParticipants = participants.length
    const pendingCount = statsMap.PENDING || 0
    const approvedCount = statsMap.APPROVED || 0
    const rejectedCount = statsMap.REJECTED || 0
    const withdrawnCount = statsMap.WITHDRAWN || 0

    return NextResponse.json({
      success: true,
      league,
      participants,
      stats: {
        total: totalParticipants,
        pending: pendingCount,
        approved: approvedCount,
        rejected: rejectedCount,
        withdrawn: withdrawnCount,
      }
    })

  } catch (error) {
    console.error('Error obteniendo participantes:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PUT /api/leagues/[id]/participants - Acciones en lote sobre participantes
export async function PUT(
  request: NextRequest,
  { params }: Context
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
        { error: 'No tienes permisos para gestionar participantes' },
        { status: 403 }
      )
    }

    const { id: leagueId } = await params
    const body = await request.json()

    // Validar datos de entrada
    const validation = bulkActionSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { action, participantIds, reason } = validation.data

    // Verificar que la liga existe
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: { id: true, name: true }
    })

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    // Verificar que todos los participantes pertenecen a esta liga
    const participants = await prisma.leagueParticipant.findMany({
      where: {
        id: { in: participantIds },
        leagueId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (participants.length !== participantIds.length) {
      return NextResponse.json(
        { error: 'Algunos participantes no pertenecen a esta liga' },
        { status: 400 }
      )
    }

    let updateData: any = {}
    let message = ''

    switch (action) {
      case 'approve':
        updateData = {
          status: 'APPROVED',
          approvedBy: user.id,
          approvedAt: new Date(),
        }
        message = `${participants.length} participante(s) aprobado(s) exitosamente`
        break

      case 'reject':
        const existingData = participants[0]?.registrationData as Record<string, any> || {}
        updateData = {
          status: 'REJECTED',
          approvedBy: user.id,
          approvedAt: new Date(),
          registrationData: {
            ...existingData,
            rejectionReason: reason || 'Sin especificar',
            rejectedAt: new Date().toISOString(),
          }
        }
        message = `${participants.length} participante(s) rechazado(s) exitosamente`
        break

      case 'delete':
        // Eliminar completamente los participantes
        await prisma.leagueParticipant.deleteMany({
          where: {
            id: { in: participantIds },
            leagueId
          }
        })

        message = `${participants.length} participante(s) eliminado(s) exitosamente`

        return NextResponse.json({
          success: true,
          message,
          deletedCount: participants.length,
          deletedParticipants: participants.map(p => ({
            id: p.id,
            userName: p.user.name,
            userEmail: p.user.email,
          }))
        })
    }

    // Actualizar participantes para approve y reject
    await prisma.leagueParticipant.updateMany({
      where: {
        id: { in: participantIds },
        leagueId
      },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      message,
      updatedCount: participants.length,
      action,
      updatedParticipants: participants.map(p => ({
        id: p.id,
        userName: p.user.name,
        userEmail: p.user.email,
      }))
    })

  } catch (error) {
    console.error('Error procesando acción en lote:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 