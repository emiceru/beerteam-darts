import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de datos...')

  // 1. Crear usuario administrador
  console.log('👤 Creando usuario administrador...')
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@beerteam.com' },
    update: {},
    create: {
      email: 'admin@beerteam.com',
      passwordHash: adminPassword,
      name: 'Administrador Beer Team',
      role: 'ADMIN',
      emailVerified: true,
    }
  })
  console.log('✅ Admin creado:', admin.email)

  // 2. Crear temporada actual
  console.log('📅 Creando temporada 2024...')
  const currentSeason = await prisma.season.upsert({
    where: { id: 'current-season-2024' },
    update: {},
    create: {
      id: 'current-season-2024',
      name: 'Temporada 2024',
      year: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true
    }
  })
  console.log('✅ Temporada creada:', currentSeason.name)

  // 3. Crear tipos de competición iniciales
  console.log('🎯 Creando tipos de competición...')
  
  const competition501 = await prisma.competitionType.upsert({
    where: { slug: '501-double-out' },
    update: {},
    create: {
      name: '501 con cierre doble',
      slug: '501-double-out',
      description: 'Juego clásico de 501 puntos con cierre obligatorio en doble',
      rulesDescription: `## Reglas del 501 con cierre doble

### Objetivo
- Cada jugador comienza con 501 puntos
- El objetivo es reducir exactamente a 0
- **Debe cerrar con doble o bullseye**

### Reglas básicas
- Si queda en negativo o 1, el turno es nulo y vuelve a la puntuación anterior
- Los puntos se restan de 501
- El primer jugador en llegar exactamente a 0 con doble/bull gana
- Se juega al mejor de 3 o 5 legs según la configuración de la liga

### Puntuación
- Single: valor del número
- Double: valor del número x2  
- Triple: valor del número x3
- Bullseye externo: 25 puntos
- Bullseye interno: 50 puntos (cuenta como doble)`,
      defaultScoringConfig: {
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        tiebreaker_rules: ['head_to_head', 'goal_difference', 'goals_for']
      },
      createdBy: admin.id
    }
  })

  const competitionCricket = await prisma.competitionType.upsert({
    where: { slug: 'cricket' },
    update: {},
    create: {
      name: 'Cricket',
      slug: 'cricket',
      description: 'Juego de Cricket estándar con objetivos del 20 al 15 y Bull',
      rulesDescription: `## Reglas del Cricket

### Objetivos
Los números objetivo son: **20, 19, 18, 17, 16, 15 y Bull**

### Mecánica de juego
- **3 impactos para cerrar** un objetivo
- Solo puedes anotar puntos en objetivos que tengas cerrados y tu oponente abiertos
- **Gana quien cierre todos los objetivos** y tenga más o igual puntos

### Tipos de impactos
- **Single**: 1 marca en el objetivo
- **Double**: 2 marcas en el objetivo  
- **Triple**: 3 marcas (cierra inmediatamente)
- **Bull externo**: 1 marca en Bull
- **Bull interno**: 2 marcas en Bull

### Puntuación
- Una vez cerrado un objetivo, cada impacto adicional suma puntos
- Ejemplo: Si tienes 20 cerrado y tu rival no, cada 20 que aciertes suma 20 puntos
- Los puntos solo cuentan si el objetivo está cerrado por ti y abierto por el rival`,
      defaultScoringConfig: {
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        tiebreaker_rules: ['head_to_head', 'games_won', 'point_difference']
      },
      createdBy: admin.id
    }
  })

  console.log('✅ Tipos de competición creados:')
  console.log('  -', competition501.name)
  console.log('  -', competitionCricket.name)

  // 4. Crear usuarios de prueba
  console.log('👥 Creando usuarios de prueba...')
  
  const testUsers = [
    { name: 'Juan García', email: 'juan@test.com' },
    { name: 'María López', email: 'maria@test.com' },
    { name: 'Carlos Ruiz', email: 'carlos@test.com' },
    { name: 'Ana Martín', email: 'ana@test.com' },
    { name: 'David Sánchez', email: 'david@test.com' },
    { name: 'Laura Torres', email: 'laura@test.com' },
  ]

  const defaultPassword = await bcrypt.hash('123456', 10)
  const createdUsers = []

  for (const userData of testUsers) {
    const user = await prisma.user.upsert({
      where: { email: userData.email },
      update: {},
      create: {
        email: userData.email,
        passwordHash: defaultPassword,
        name: userData.name,
        role: 'PLAYER',
        emailVerified: true,
      }
    })
    createdUsers.push(user)
  }

  console.log('✅ Usuarios de prueba creados:', createdUsers.length)

  // 5. Crear liga de ejemplo
  console.log('🏆 Creando liga de ejemplo...')
  
  const exampleLeague = await prisma.league.upsert({
    where: { slug: 'liga-ejemplo-501' },
    update: {},
    create: {
      name: 'Liga de Ejemplo 501',
      slug: 'liga-ejemplo-501',
      description: 'Liga de demostración para probar la aplicación',
      rulesDescription: `## Liga de Ejemplo - 501 Doble Out

Esta es una liga de **demostración** para probar todas las funcionalidades de la aplicación.

### Configuración
- **Modalidad**: Individual
- **Formato**: Todos contra todos (round-robin)
- **Partidos**: Mejor de 3 legs
- **Puntuación**: 3 puntos victoria, 1 empate, 0 derrota

### Calendario
- **Inscripciones**: Hasta el 31 de enero de 2025
- **Inicio de liga**: 1 de febrero de 2025  
- **Fin de liga**: 31 de marzo de 2025

¡Únete y demuestra tu puntería! 🎯`,
      seasonId: currentSeason.id,
      competitionTypeId: competition501.id,
      createdBy: admin.id,
      gameMode: 'INDIVIDUAL',
      tournamentFormat: 'ROUND_ROBIN',
      maxParticipants: 8,
      registrationOpen: true,
      autoApproveRegistrations: true,
      scoringConfig: {
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        tiebreaker_rules: ['head_to_head', 'goal_difference', 'goals_for']
      },
      matchDataConfig: {
        track_detailed_score: true,
        track_game_by_game: true,
        track_throw_count: false,
        track_time: false,
        required_fields: ['team1_score', 'team2_score', 'winner']
      },
      registrationStart: new Date('2024-12-01'),
      registrationEnd: new Date('2025-01-31'),
      leagueStart: new Date('2025-02-01'),
      leagueEnd: new Date('2025-03-31'),
      status: 'REGISTRATION',
      isPublic: true
    }
  })

  console.log('✅ Liga de ejemplo creada:', exampleLeague.name)

  // 6. Crear enlace de inscripción para la liga de ejemplo
  console.log('🔗 Creando enlace de inscripción...')
  
  const joinLink = await prisma.joinLink.upsert({
    where: { code: 'ejemplo-501-2024' },
    update: {},
    create: {
      leagueId: exampleLeague.id,
      code: 'ejemplo-501-2024',
      isActive: true,
      maxUses: null, // Sin límite
      createdBy: admin.id
    }
  })

  console.log('✅ Enlace de inscripción creado:', `/join/${joinLink.code}`)

  // 7. Inscribir algunos usuarios de prueba
  console.log('📝 Inscribiendo usuarios de prueba en la liga...')
  
  for (let i = 0; i < 4; i++) {
    const user = createdUsers[i]
    await prisma.leagueParticipant.upsert({
      where: { leagueId_userId: { leagueId: exampleLeague.id, userId: user.id } },
      update: {},
      create: {
        leagueId: exampleLeague.id,
        userId: user.id,
        registrationType: 'INDIVIDUAL',
        status: 'APPROVED',
        joinedViaLink: joinLink.id,
        approvedBy: admin.id,
        approvedAt: new Date(),
      }
    })

    // Crear equipo individual para cada participante
    await prisma.team.upsert({
      where: { leagueId_player1Id_player2Id: { 
        leagueId: exampleLeague.id, 
        player1Id: user.id, 
        player2Id: null 
      }},
      update: {},
      create: {
        leagueId: exampleLeague.id,
        name: user.name,
        player1Id: user.id,
        player2Id: null,
        createdBy: admin.id
      }
    })
  }

  console.log('✅ Usuarios inscritos y equipos creados')

  console.log('\n🎉 Seed completado exitosamente!')
  console.log('\n📋 Resumen:')
  console.log(`👤 Admin: admin@beerteam.com (password: admin123)`)
  console.log(`👥 Usuarios de prueba: ${testUsers.length} (password: 123456)`)
  console.log(`🏆 Liga de ejemplo: ${exampleLeague.name}`)
  console.log(`🔗 Enlace de inscripción: /join/${joinLink.code}`)
  console.log(`🎯 Tipos de competición: 501 cierre doble, Cricket`)
  console.log('\n🚀 ¡La aplicación está lista para desarrollar!')
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  }) 