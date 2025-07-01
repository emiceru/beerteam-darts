import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '@/lib/db'
import { hashPassword, generateToken } from '@/lib/auth'
import bcrypt from 'bcryptjs'

interface Context {
  params: Promise<{ code: string }>
}

const joinSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres').optional(),
  createAccount: z.boolean().default(false),
})

// GET /api/join/[code] - Obtener información del enlace de inscripción
export async function GET(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { code } = await params

    // Buscar enlace de inscripción
    const joinLink = await prisma.joinLink.findUnique({
      where: { code },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            rulesDescription: true,
            gameMode: true,
            tournamentFormat: true,
            status: true,
            registrationOpen: true,
            registrationStart: true,
            registrationEnd: true,
            leagueStart: true,
            leagueEnd: true,
            maxParticipants: true,
            season: {
              select: {
                name: true,
                year: true,
              }
            },
            competitionType: {
              select: {
                name: true,
                description: true,
                rulesDescription: true,
              }
            },
            _count: {
              select: {
                participants: true
              }
            }
          }
        }
      }
    })

    if (!joinLink) {
      return NextResponse.json(
        { error: 'Enlace de inscripción no encontrado' },
        { status: 404 }
      )
    }

    if (!joinLink.isActive) {
      return NextResponse.json(
        { error: 'Este enlace de inscripción ha sido desactivado' },
        { status: 410 }
      )
    }

    // Verificar si el enlace ha expirado
    if (joinLink.expiresAt && new Date() > joinLink.expiresAt) {
      return NextResponse.json(
        { error: 'Este enlace de inscripción ha expirado' },
        { status: 410 }
      )
    }

    // Verificar si se han alcanzado los usos máximos
    if (joinLink.maxUses && joinLink.currentUses >= joinLink.maxUses) {
      return NextResponse.json(
        { error: 'Este enlace de inscripción ha alcanzado el límite de usos' },
        { status: 410 }
      )
    }

    // Verificar si la liga tiene inscripción abierta
    if (!joinLink.league.registrationOpen) {
      return NextResponse.json(
        { error: 'La inscripción para esta liga está cerrada' },
        { status: 400 }
      )
    }

    // Verificar límite de participantes
    if (joinLink.league.maxParticipants && 
        joinLink.league._count.participants >= joinLink.league.maxParticipants) {
      return NextResponse.json(
        { error: 'Esta liga ha alcanzado el límite máximo de participantes' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      joinLink: {
        id: joinLink.id,
        code: joinLink.code,
        expiresAt: joinLink.expiresAt,
        maxUses: joinLink.maxUses,
        currentUses: joinLink.currentUses,
      },
      league: joinLink.league
    })

  } catch (error) {
    console.error('Error obteniendo enlace:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// POST /api/join/[code] - Procesar inscripción pública
export async function POST(
  request: NextRequest,
  { params }: Context
) {
  try {
    const { code } = await params
    const body = await request.json()

    // Validar datos de entrada
    const validation = joinSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Datos inválidos', details: validation.error.errors },
        { status: 400 }
      )
    }

    const { name, email, password, createAccount } = validation.data

    // Buscar enlace de inscripción (igual validación que GET)
    const joinLink = await prisma.joinLink.findUnique({
      where: { code },
      include: {
        league: {
          select: {
            id: true,
            name: true,
            registrationOpen: true,
            maxParticipants: true,
            autoApproveRegistrations: true,
            _count: {
              select: {
                participants: true
              }
            }
          }
        }
      }
    })

    if (!joinLink || !joinLink.isActive || 
        (joinLink.expiresAt && new Date() > joinLink.expiresAt) ||
        (joinLink.maxUses && joinLink.currentUses >= joinLink.maxUses) ||
        !joinLink.league.registrationOpen ||
        (joinLink.league.maxParticipants && joinLink.league._count.participants >= joinLink.league.maxParticipants)) {
      return NextResponse.json(
        { error: 'Enlace de inscripción no válido o expirado' },
        { status: 400 }
      )
    }

    let user = null

    // Buscar si el usuario ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (existingUser) {
      user = existingUser
      
      // Verificar si ya está inscrito en esta liga
      const existingParticipant = await prisma.leagueParticipant.findUnique({
        where: {
          leagueId_userId: {
            leagueId: joinLink.league.id,
            userId: existingUser.id
          }
        }
      })

      if (existingParticipant) {
        return NextResponse.json(
          { error: 'Ya estás inscrito en esta liga' },
          { status: 409 }
        )
      }
    } else {
      // Si createAccount es true, crear nueva cuenta
      if (createAccount && password) {
        const passwordHash = await hashPassword(password)
        
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash,
            name,
            role: 'PLAYER',
            emailVerified: false,
            isActive: true,
          }
        })
      } else {
        // Crear usuario temporal (sin contraseña)
        user = await prisma.user.create({
          data: {
            email: email.toLowerCase(),
            passwordHash: '', // Sin contraseña para usuario temporal
            name,
            role: 'PLAYER',
            emailVerified: false,
            isActive: true,
          }
        })
      }
    }

    // Crear participación en la liga
    await prisma.leagueParticipant.create({
      data: {
        leagueId: joinLink.league.id,
        userId: user.id,
        registrationType: 'INDIVIDUAL',
        status: joinLink.league.autoApproveRegistrations ? 'APPROVED' : 'PENDING',
        joinedViaLink: joinLink.id,
        registrationData: {
          joinMethod: 'public_link',
          createAccount,
          timestamp: new Date().toISOString()
        }
      }
    })

    // Incrementar contador de usos del enlace
    await prisma.joinLink.update({
      where: { id: joinLink.id },
      data: {
        currentUses: {
          increment: 1
        }
      }
    })

    // Si se creó cuenta con contraseña, generar token de autenticación
    let authToken = null
    if (createAccount && password) {
      const authUser = {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        isActive: user.isActive,
      }
      
      authToken = generateToken(authUser)
      
      // Crear sesión
      const tokenHash = await bcrypt.hash(authToken, 10)
      await prisma.userSession.create({
        data: {
          userId: user.id,
          tokenHash,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 días
          deviceInfo: request.headers.get('user-agent') || 'Web Browser',
        }
      })
    }

    const response = NextResponse.json({
      success: true,
      message: `¡Inscripción exitosa en ${joinLink.league.name}!`,
      participant: {
        status: joinLink.league.autoApproveRegistrations ? 'APPROVED' : 'PENDING',
        league: {
          id: joinLink.league.id,
          name: joinLink.league.name
        }
      },
      accountCreated: !existingUser,
      ...(authToken && { 
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    })

    // Si hay token, configurar cookie
    if (authToken) {
      response.cookies.set('auth_token', authToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: '/',
      })
    }

    return response

  } catch (error) {
    console.error('Error procesando inscripción:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
} 