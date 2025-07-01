import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { getUserFromToken } from '@/lib/auth'
import { nanoid } from 'nanoid'

const createJoinLinkSchema = z.object({
  leagueId: z.string().cuid('ID de liga inválido'),
  expiresAt: z.string().datetime().optional(),
  maxUses: z.number().int().positive().optional(),
})

// GET /api/join-links - Obtener enlaces de inscripción (solo admin)
export async function GET(request: NextRequest) {
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
        { error: 'No tienes permisos para acceder a los enlaces' },
        { status: 403 }
      )
    }

    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url)
    const leagueId = searchParams.get('leagueId')

    // Construir filtros
    const where = leagueId ? { leagueId } : {}

    const joinLinks = await prisma.joinLink.findMany({
      where,
      include: {
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            registrationOpen: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      joinLinks
    })

  } catch (error) {
    console.error('Error obteniendo enlaces:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/join-links - Crear nuevo enlace de inscripción (solo admin)
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
        { error: 'No tienes permisos para crear enlaces' },
        { status: 403 }
      )
    }

    const body = await request.json()
    
    // Validar datos de entrada
    const validation = createJoinLinkSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { leagueId, expiresAt, maxUses } = validation.data

    // Verificar que la liga existe y está abierta para inscripción
    const league = await prisma.league.findUnique({
      where: { id: leagueId },
      select: {
        id: true,
        name: true,
        registrationOpen: true,
        isPublic: true,
      }
    })

    if (!league) {
      return NextResponse.json(
        { error: 'Liga no encontrada' },
        { status: 404 }
      )
    }

    if (!league.registrationOpen) {
      return NextResponse.json(
        { error: 'La liga no tiene inscripción abierta' },
        { status: 400 }
      )
    }

    // Generar código único
    const code_string = nanoid(16) // 16 caracteres, URL-safe

    // Crear enlace de inscripción
    const joinLink = await prisma.joinLink.create({
      data: {
        leagueId,
        code: code_string,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        maxUses: maxUses || null,
        currentUses: 0,
        isActive: true,
        createdBy: user.id,
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
      message: 'Enlace de inscripción creado exitosamente',
      joinLink: {
        ...joinLink,
        url: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/join/${code_string}`
      }
    }, { status: 201 })

  } catch (error) {
    console.error('Error creando enlace:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 