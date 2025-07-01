import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'

interface Context {
  params: { id: string }
}

// GET /api/join-links/[id] - Obtener enlace específico
export async function GET(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params

    const joinLink = await prisma.joinLink.findUnique({
      where: { id },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            status: true,
            registrationOpen: true,
            season: {
              select: {
                name: true,
              }
            },
            competitionType: {
              select: {
                name: true,
              }
            }
          }
        }
      }
    })

    if (!joinLink) {
      return NextResponse.json(
        { error: 'Enlace no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      joinLink
    })

  } catch (error) {
    console.error('Error obteniendo enlace:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// PATCH /api/join-links/[id] - Actualizar enlace (solo admin)
export async function PATCH(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params

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
        { error: 'No tienes permisos para modificar enlaces' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { isActive, maxUses, expiresAt } = body

    // Verificar que el enlace existe
    const existingLink = await prisma.joinLink.findUnique({
      where: { id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Enlace no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar enlace
    const updatedLink = await prisma.joinLink.update({
      where: { id },
      data: {
        ...(isActive !== undefined && { isActive }),
        ...(maxUses !== undefined && { maxUses }),
        ...(expiresAt !== undefined && { expiresAt: expiresAt ? new Date(expiresAt) : null }),
      },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Enlace actualizado exitosamente',
      joinLink: updatedLink
    })

  } catch (error) {
    console.error('Error actualizando enlace:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE /api/join-links/[id] - Eliminar enlace (solo admin)
export async function DELETE(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { id } = await params

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
        { error: 'No tienes permisos para eliminar enlaces' },
        { status: 403 }
      )
    }

    // Verificar que el enlace existe
    const existingLink = await prisma.joinLink.findUnique({
      where: { id }
    })

    if (!existingLink) {
      return NextResponse.json(
        { error: 'Enlace no encontrado' },
        { status: 404 }
      )
    }

    // Eliminar enlace
    await prisma.joinLink.delete({
      where: { id }
    })

    return NextResponse.json({
      success: true,
      message: 'Enlace eliminado exitosamente'
    })

  } catch (error) {
    console.error('Error eliminando enlace:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 