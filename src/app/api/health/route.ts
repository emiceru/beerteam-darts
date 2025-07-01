import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export async function GET() {
  try {
    // Test de conexión a la base de datos
    await prisma.$queryRaw`SELECT 1`;
    
    // Obtener información básica del sistema
    const dbStats = {
      users: await prisma.user.count(),
      leagues: await prisma.league.count(),
      seasons: await prisma.season.count(),
      competitionTypes: await prisma.competitionType.count(),
    };

    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      version: '1.0.0',
      app: 'Beer Team Darts League Manager',
      stats: dbStats,
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: 'Database connection failed',
      },
      { status: 500 }
    );
  }
} 