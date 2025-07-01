import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const publicKey = process.env.VAPID_PUBLIC_KEY || 'BM4L7vKdWR4WlkbSe-LOEnmEdA4yMJUaX8GBq_Rx6kFTysAl9epbjhQatyHaxJt4V8hHlQAgJDeLu94FAf3RyAs';
    
    return NextResponse.json({
      publicKey
    });
  } catch (error) {
    console.error('Error obteniendo clave VAPID:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
} 