import { type ClassValue, clsx } from 'clsx';
import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

/**
 * Combina clases CSS usando clsx
 */
export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

/**
 * Formatea fechas en español
 */
export function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Fecha inválida';
  return format(dateObj, formatStr, { locale: es });
}

/**
 * Formatea fecha con hora en español
 */
export function formatDateTime(date: Date | string): string {
  return formatDate(date, 'dd/MM/yyyy HH:mm');
}

/**
 * Formatea distancia de tiempo relativa (ej: "hace 2 horas")
 */
export function formatTimeAgo(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  if (!isValid(dateObj)) return 'Fecha inválida';
  return formatDistanceToNow(dateObj, { addSuffix: true, locale: es });
}

/**
 * Convierte string a slug (URL-friendly)
 */
export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Espacios por guiones
    .replace(/[áàäâ]/g, 'a')        // Acentos
    .replace(/[éèëê]/g, 'e')
    .replace(/[íìïî]/g, 'i')
    .replace(/[óòöô]/g, 'o')
    .replace(/[úùüû]/g, 'u')
    .replace(/ñ/g, 'n')
    .replace(/ç/g, 'c')
    .replace(/[^a-z0-9-]/g, '')     // Solo letras, números y guiones
    .replace(/-+/g, '-')            // Múltiples guiones por uno
    .replace(/^-|-$/g, '');         // Quitar guiones al inicio/final
}

/**
 * Formatea números como porcentaje
 */
export function formatPercentage(value: number, decimals: number = 1): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Trunca texto y añade puntos suspensivos
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trim() + '...';
}

/**
 * Genera un código aleatorio para enlaces de inscripción
 */
export function generateJoinCode(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Valida si un email es válido (regex básica)
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Capitaliza la primera letra de cada palabra
 */
export function titleCase(text: string): string {
  return text.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Calcula el porcentaje de victorias
 */
export function calculateWinPercentage(wins: number, total: number): number {
  if (total === 0) return 0;
  return (wins / total) * 100;
}

/**
 * Obtiene las iniciales de un nombre
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

/**
 * Genera un color de avatar basado en el nombre
 */
export function getAvatarColor(name: string): string {
  const colors = [
    'bg-red-500',
    'bg-blue-500', 
    'bg-green-500',
    'bg-yellow-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-teal-500',
    'bg-orange-500',
    'bg-gray-500'
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
}

/**
 * Formatea un mensaje de estado de liga
 */
export function getLeagueStatusMessage(status: string): { text: string; color: string } {
  const statusMap = {
    DRAFT: { text: 'Borrador', color: 'gray' },
    REGISTRATION: { text: 'Inscripciones Abiertas', color: 'blue' },
    ACTIVE: { text: 'Liga Activa', color: 'green' },
    FINISHED: { text: 'Liga Finalizada', color: 'purple' },
    CANCELLED: { text: 'Liga Cancelada', color: 'red' },
  } as const;
  
  return statusMap[status as keyof typeof statusMap] || { text: status, color: 'gray' };
}

/**
 * Formatea el estado de un partido
 */
export function getMatchStatusMessage(status: string): { text: string; color: string } {
  const statusMap = {
    SCHEDULED: { text: 'Programado', color: 'blue' },
    IN_PROGRESS: { text: 'En Progreso', color: 'yellow' },
    COMPLETED: { text: 'Completado', color: 'green' },
    CANCELLED: { text: 'Cancelado', color: 'red' },
    POSTPONED: { text: 'Aplazado', color: 'orange' },
  } as const;
  
  return statusMap[status as keyof typeof statusMap] || { text: status, color: 'gray' };
}

/**
 * Formatea el modo de juego
 */
export function getGameModeText(gameMode: string): string {
  const gameModeMap = {
    INDIVIDUAL: 'Individual',
    PAIRS: 'Parejas',
    MIXED: 'Mixto',
  } as const;
  
  return gameModeMap[gameMode as keyof typeof gameModeMap] || gameMode;
}

/**
 * Formatea el formato de torneo
 */
export function getTournamentFormatText(format: string): string {
  const formatMap = {
    ROUND_ROBIN: 'Todos contra todos',
    KNOCKOUT: 'Eliminación directa',
    HYBRID: 'Híbrido',
  } as const;
  
  return formatMap[format as keyof typeof formatMap] || format;
}

/**
 * Obtiene el color de estado para badges/indicadores
 */
export function getStatusColor(status: string, type: 'league' | 'match' | 'participant' = 'league'): string {
  if (type === 'league') {
    const colorMap = {
      DRAFT: 'bg-gray-100 text-gray-800',
      REGISTRATION: 'bg-blue-100 text-blue-800',
      ACTIVE: 'bg-green-100 text-green-800',
      FINISHED: 'bg-purple-100 text-purple-800',
      CANCELLED: 'bg-red-100 text-red-800',
    } as const;
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  }
  
  if (type === 'match') {
    const colorMap = {
      SCHEDULED: 'bg-blue-100 text-blue-800',
      IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
      COMPLETED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
      POSTPONED: 'bg-orange-100 text-orange-800',
    } as const;
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  }
  
  if (type === 'participant') {
    const colorMap = {
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      WITHDRAWN: 'bg-gray-100 text-gray-800',
    } as const;
    return colorMap[status as keyof typeof colorMap] || 'bg-gray-100 text-gray-800';
  }
  
  return 'bg-gray-100 text-gray-800';
}

/**
 * Valida si una fecha está en el rango correcto
 */
export function isDateInRange(date: Date | string, startDate: Date | string, endDate: Date | string): boolean {
  const checkDate = typeof date === 'string' ? parseISO(date) : date;
  const start = typeof startDate === 'string' ? parseISO(startDate) : startDate;
  const end = typeof endDate === 'string' ? parseISO(endDate) : endDate;
  
  return checkDate >= start && checkDate <= end;
}

/**
 * Genera estadísticas básicas para un array de números
 */
export function calculateStats(numbers: number[]): {
  sum: number;
  average: number;
  min: number;
  max: number;
  count: number;
} {
  if (numbers.length === 0) {
    return { sum: 0, average: 0, min: 0, max: 0, count: 0 };
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const average = sum / numbers.length;
  const min = Math.min(...numbers);
  const max = Math.max(...numbers);
  
  return { sum, average, min, max, count: numbers.length };
}

/**
 * Ordena un array de objetos por múltiples criterios
 */
export function sortBy<T>(
  array: T[], 
  sortKey: keyof T, 
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[sortKey];
    const bVal = b[sortKey];
    
    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Agrupa un array de objetos por una propiedad
 */
export function groupBy<T, K extends keyof T>(array: T[], key: K): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Debounce function para búsquedas
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Copia texto al portapapeles
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard:', err);
    return false;
  }
}

/**
 * Obtiene el texto de rol de usuario
 */
export function getRoleText(role: string): string {
  const roleMap = {
    ADMIN: 'Administrador',
    PLAYER: 'Jugador',
  } as const;
  
  return roleMap[role as keyof typeof roleMap] || role;
}

/**
 * Genera el texto de posición ordinal (1º, 2º, 3º, etc.)
 */
export function getOrdinalPosition(position: number): string {
  if (position === 1) return '1º';
  if (position === 2) return '2º';
  if (position === 3) return '3º';
  return `${position}º`;
}

/**
 * Calcula la diferencia de días entre dos fechas
 */
export function daysBetween(date1: Date | string, date2: Date | string): number {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1;
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2;
  const diffTime = Math.abs(d2.getTime() - d1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Verifica si una fecha es hoy
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Verifica si una fecha es en el futuro
 */
export function isFuture(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return dateObj > new Date();
} 