import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

type Context = {
  params: Promise<{ id: string; participantId: string }>
}

const updateParticipantSchema = z.object({
  action: z.enum(['approve', 'reject', 'withdraw']),
  reason: z.string().optional(), // Para rechazos o retiros
  notes: z.string().optional(), // Notas adicionales
})

// GET /api/leagues/[id]/participants/[participantId] - Obtener detalles de un participante
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
        { error: 'No tienes permisos para ver este participante' },
        { status: 403 }
      )
    }

    const { id: leagueId, participantId } = await params

    // Obtener participante con información completa
    const participant = await prisma.leagueParticipant.findFirst({
      where: {
        id: participantId,
        leagueId
      },
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
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
          }
        },
        joinLink: {
          select: {
            id: true,
            code: true,
            createdAt: true,
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      )
    }

    // Obtener historial de cambios si existe
    const registrationData = participant.registrationData as any || {}

    return NextResponse.json({
      success: true,
      participant: {
        ...participant,
        registrationData,
      }
    })

  } catch (error) {
    console.error('Error obteniendo participante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/leagues/[id]/participants/[participantId] - Actualizar estado de un participante
export async function PATCH(
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

    const { id: leagueId, participantId } = await params
    const body = await request.json()

    // Validar datos de entrada
    const validation = updateParticipantSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { action, reason, notes } = validation.data

    // Verificar que el participante existe y pertenece a la liga
    const participant = await prisma.leagueParticipant.findFirst({
      where: {
        id: participantId,
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

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {
      approvedBy: user.id,
      approvedAt: new Date(),
    }

    const existingData = participant.registrationData as Record<string, any> || {}
    let newStatus = ''
    let message = ''

    switch (action) {
      case 'approve':
        updateData.status = 'APPROVED'
        newStatus = 'APPROVED'
        message = `Participante ${participant.user.name} aprobado exitosamente`
        
        updateData.registrationData = {
          ...existingData,
          approvedAt: new Date().toISOString(),
          approvedBy: user.name,
          approvalNotes: notes,
        }
        break

      case 'reject':
        updateData.status = 'REJECTED'
        newStatus = 'REJECTED'
        message = `Participante ${participant.user.name} rechazado exitosamente`
        
        updateData.registrationData = {
          ...existingData,
          rejectedAt: new Date().toISOString(),
          rejectedBy: user.name,
          rejectionReason: reason || 'Sin especificar',
          rejectionNotes: notes,
        }
        break

      case 'withdraw':
        updateData.status = 'WITHDRAWN'
        newStatus = 'WITHDRAWN'
        message = `Participante ${participant.user.name} retirado de la liga`
        
        updateData.registrationData = {
          ...existingData,
          withdrawnAt: new Date().toISOString(),
          withdrawnBy: user.name,
          withdrawalReason: reason || 'Sin especificar',
          withdrawalNotes: notes,
        }
        break
    }

    // Actualizar participante
    const updatedParticipant = await prisma.leagueParticipant.update({
      where: { id: participantId },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        approver: {
          select: {
            id: true,
            name: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message,
      participant: {
        id: updatedParticipant.id,
        status: newStatus,
        user: updatedParticipant.user,
        approver: updatedParticipant.approver,
        approvedAt: updatedParticipant.approvedAt,
        registrationData: updatedParticipant.registrationData,
      }
    })

  } catch (error) {
    console.error('Error actualizando participante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/leagues/[id]/participants/[participantId] - Eliminar un participante
export async function DELETE(
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
        { error: 'No tienes permisos para eliminar participantes' },
        { status: 403 }
      )
    }

    const { id: leagueId, participantId } = await params

    // Verificar que el participante existe y pertenece a la liga
    const participant = await prisma.leagueParticipant.findFirst({
      where: {
        id: participantId,
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

    if (!participant) {
      return NextResponse.json(
        { error: 'Participante no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar participante
    await prisma.leagueParticipant.delete({
      where: { id: participantId }
    })

    return NextResponse.json({
      success: true,
      message: `Participante ${participant.user.name} eliminado exitosamente`,
      deletedParticipant: {
        id: participant.id,
        userName: participant.user.name,
        userEmail: participant.user.email,
      }
    })

  } catch (error) {
    console.error('Error eliminando participante:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 