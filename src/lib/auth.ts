import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '7d';

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'PLAYER';
  emailVerified: boolean;
  isActive: boolean;
}

/**
 * Genera un token JWT para el usuario
 */
export function generateToken(user: AuthUser): string {
  const payload: JWTPayload = {
    userId: user.id,
    email: user.email,
    role: user.role,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verifica y decodifica un token JWT
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

/**
 * Hash de contraseña
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

/**
 * Verificar contraseña
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

/**
 * Autenticar usuario con email y contraseña
 */
export async function authenticateUser(email: string, password: string): Promise<{
  success: boolean;
  user?: AuthUser;
  token?: string;
  error?: string;
}> {
  try {
    // Buscar usuario por email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    if (!user.isActive) {
      return { success: false, error: 'Cuenta desactivada' };
    }

    // Verificar contraseña
    const isValidPassword = await verifyPassword(password, user.passwordHash);
    if (!isValidPassword) {
      return { success: false, error: 'Contraseña incorrecta' };
    }

    // Crear objeto de usuario para el token
    const authUser: AuthUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    };

    // Generar token
    const token = generateToken(authUser);

    // Crear sesión en la base de datos
    await createUserSession(user.id, token);

    return {
      success: true,
      user: authUser,
      token,
    };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Crear sesión de usuario en la base de datos
 */
async function createUserSession(userId: string, token: string): Promise<void> {
  const tokenHash = await bcrypt.hash(token, 10);
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 días

  await prisma.userSession.create({
    data: {
      userId,
      tokenHash,
      expiresAt,
      deviceInfo: 'Web Browser', // Esto se puede mejorar para obtener info real del dispositivo
    },
  });
}

/**
 * Obtener usuario por token
 */
export async function getUserFromToken(token: string): Promise<AuthUser | null> {
  try {
    const payload = verifyToken(token);
    if (!payload) return null;

    const user = await prisma.user.findUnique({
      where: { id: payload.userId }
    });

    if (!user || !user.isActive) return null;

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      emailVerified: user.emailVerified,
      isActive: user.isActive,
    };
  } catch (error) {
    console.error('Get user from token error:', error);
    return null;
  }
}

/**
 * Cerrar sesión (invalidar token)
 */
export async function logout(token: string): Promise<void> {
  try {
    const payload = verifyToken(token);
    if (!payload) return;

    // Eliminar todas las sesiones del usuario (logout completo)
    await prisma.userSession.deleteMany({
      where: { userId: payload.userId }
    });
  } catch (error) {
    console.error('Logout error:', error);
  }
}

/**
 * Middleware helper para verificar autenticación
 */
export function requireAuth(requiredRole?: 'ADMIN' | 'PLAYER') {
  return async (token: string): Promise<{
    isAuthenticated: boolean;
    user?: AuthUser;
    error?: string;
  }> => {
    const user = await getUserFromToken(token);
    
    if (!user) {
      return { isAuthenticated: false, error: 'No autenticado' };
    }

    if (requiredRole && user.role !== requiredRole && user.role !== 'ADMIN') {
      return { isAuthenticated: false, error: 'Permisos insuficientes' };
    }

    return { isAuthenticated: true, user };
  };
}

/**
 * Generar código de restablecimiento de contraseña
 */
export async function generatePasswordResetToken(email: string): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      return { success: false, error: 'Usuario no encontrado' };
    }

    // Generar token único
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const tokenHash = await bcrypt.hash(resetToken, 10);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hora

    // Guardar token en la base de datos
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        tokenHash,
        expiresAt,
      },
    });

    return { success: true, token: resetToken };
  } catch (error) {
    console.error('Generate reset token error:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
}

/**
 * Verificar y usar token de restablecimiento de contraseña
 */
export async function resetPassword(token: string, newPassword: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const payload = verifyToken(token) as any;
    if (!payload || payload.type !== 'password_reset') {
      return { success: false, error: 'Token inválido' };
    }

    // Verificar que el token existe en la base de datos y no ha sido usado
    const resetTokenRecord = await prisma.passwordResetToken.findFirst({
      where: {
        userId: payload.userId,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
    });

    if (!resetTokenRecord) {
      return { success: false, error: 'Token expirado o ya usado' };
    }

    // Cambiar contraseña
    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: payload.userId },
      data: { passwordHash: hashedPassword },
    });

    // Marcar token como usado
    await prisma.passwordResetToken.update({
      where: { id: resetTokenRecord.id },
      data: { usedAt: new Date() },
    });

    // Cerrar todas las sesiones del usuario
    await prisma.userSession.deleteMany({
      where: { userId: payload.userId }
    });

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return { success: false, error: 'Error interno del servidor' };
  }
} 