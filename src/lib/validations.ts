import { z } from 'zod';

// Validaciones básicas reutilizables
export const emailSchema = z.string().email('Email inválido').toLowerCase();
export const passwordSchema = z.string().min(6, 'La contraseña debe tener al menos 6 caracteres');
export const nameSchema = z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo');

// Autenticación
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'La contraseña es requerida'),
});

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Token requerido'),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Perfil de usuario
export const updateProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  avatarUrl: z.string().url('URL inválida').optional().or(z.literal('')),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Contraseña actual requerida'),
  newPassword: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Las contraseñas no coinciden',
  path: ['confirmPassword'],
});

// Configuraciones de notificación
export const notificationSettingsSchema = z.object({
  emailMatchReminders: z.boolean(),
  emailResults: z.boolean(),
  emailLeagueUpdates: z.boolean(),
  emailWeeklySummary: z.boolean(),
  pushEnabled: z.boolean(),
  pushMatchReminders: z.boolean(),
  pushResults: z.boolean(),
  pushLeagueUpdates: z.boolean(),
  reminderHoursBefore: z.number().min(1).max(72),
});

// Ligas - Schema base
const leagueBaseSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
  description: z.string().max(500, 'La descripción es demasiado larga').optional().transform(val => val === '' ? undefined : val),
  rulesDescription: z.string().min(10, 'Describe las reglas de la liga').max(5000, 'La descripción de reglas es demasiado larga'),
  competitionTypeId: z.string().min(1, 'Tipo de competición requerido'),
  seasonId: z.string().nullable().optional().transform(val => val === '' ? null : val),
  newSeasonName: z.string().min(3, 'El nombre de la temporada debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo').optional().transform(val => val === '' ? undefined : val),
  gameMode: z.enum(['INDIVIDUAL', 'PAIRS', 'MIXED'], {
    errorMap: () => ({ message: 'Modalidad de juego inválida' }),
  }),
  tournamentFormat: z.enum(['ROUND_ROBIN', 'KNOCKOUT', 'HYBRID'], {
    errorMap: () => ({ message: 'Formato de torneo inválido' }),
  }),
  maxParticipants: z.coerce.number().min(2, 'Mínimo 2 participantes').max(1000, 'Máximo 1000 participantes').nullable().optional(),
  autoApproveRegistrations: z.boolean(),
  registrationStart: z.string(),
  registrationEnd: z.string(),
  leagueStart: z.string(),
  leagueEnd: z.string(),
  // Configuración de puntuación
  pointsWin: z.coerce.number().min(0, 'Los puntos deben ser positivos'),
  pointsDraw: z.coerce.number().min(0, 'Los puntos deben ser positivos'),
  pointsLoss: z.coerce.number().min(0, 'Los puntos deben ser positivos'),
  // Configuración de datos de partido
  trackDetailedScore: z.boolean(),
  trackGameByGame: z.boolean(),
  trackThrowCount: z.boolean(),
  trackTime: z.boolean(),
});

export const createLeagueSchema = leagueBaseSchema
  .refine((data) => {
    // Debe tener una temporada existente O un nombre para nueva temporada
    return (data.seasonId && data.seasonId !== 'new' && data.seasonId.trim() !== '') || 
           (data.seasonId === 'new' && data.newSeasonName && data.newSeasonName.trim() !== '') ||
           (!data.seasonId && data.newSeasonName && data.newSeasonName.trim() !== '');
  }, {
    message: 'Debes seleccionar una temporada existente o crear una nueva',
    path: ['seasonId'],
  })
  .refine((data) => {
    const regStart = new Date(data.registrationStart);
    const regEnd = new Date(data.registrationEnd);
    const leagueStart = new Date(data.leagueStart);
    const leagueEnd = new Date(data.leagueEnd);
    
    return regStart < regEnd && regEnd <= leagueStart && leagueStart < leagueEnd;
  }, {
    message: 'Las fechas deben estar en orden cronológico correcto',
    path: ['registrationEnd'],
  });

export const updateLeagueSchema = leagueBaseSchema.partial().extend({
  id: z.string().min(1, 'ID de liga requerido'),
});

// Inscripción a liga
export const joinLeagueSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  registrationType: z.enum(['INDIVIDUAL', 'PAIR_LEADER', 'PAIR_MEMBER'], {
    errorMap: () => ({ message: 'Tipo de inscripción inválido' }),
  }),
  partnerEmail: emailSchema.optional(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones',
  }),
});

// Gestión de participantes
export const approveParticipantSchema = z.object({
  participantId: z.string().min(1, 'ID de participante requerido'),
  action: z.enum(['APPROVE', 'REJECT'], {
    errorMap: () => ({ message: 'Acción inválida' }),
  }),
});

export const createTeamSchema = z.object({
  leagueId: z.string().min(1, 'ID de liga requerido'),
  name: z.string().min(2, 'El nombre del equipo debe tener al menos 2 caracteres').max(100, 'El nombre es demasiado largo').optional(),
  player1Id: z.string().min(1, 'Jugador 1 requerido'),
  player2Id: z.string().optional(),
});

// Partidos
export const createMatchSchema = z.object({
  leagueId: z.string().min(1, 'ID de liga requerido'),
  team1Id: z.string().min(1, 'Equipo 1 requerido'),
  team2Id: z.string().min(1, 'Equipo 2 requerido'),
  round: z.number().min(1, 'Ronda debe ser positiva'),
  matchNumber: z.number().min(1, 'Número de partido debe ser positivo'),
  scheduledDate: z.string().optional(),
}).refine((data) => data.team1Id !== data.team2Id, {
  message: 'Los equipos deben ser diferentes',
  path: ['team2Id'],
});

export const updateMatchResultSchema = z.object({
  matchId: z.string().min(1, 'ID de partido requerido'),
  team1Score: z.number().min(0, 'La puntuación debe ser positiva'),
  team2Score: z.number().min(0, 'La puntuación debe ser positiva'),
  winnerTeamId: z.string().min(1, 'Equipo ganador requerido'),
  notes: z.string().max(1000, 'Las notas son demasiado largas').optional(),
  matchData: z.record(z.any()).optional(), // Datos adicionales específicos del tipo de competición
});

// Enlaces de inscripción
export const createJoinLinkSchema = z.object({
  leagueId: z.string().min(1, 'ID de liga requerido'),
  code: z.string().min(3, 'El código debe tener al menos 3 caracteres').max(50, 'El código es demasiado largo'),
  expiresAt: z.string().optional(),
  maxUses: z.number().min(1, 'Debe permitir al menos 1 uso').optional(),
});

// Temporadas
export const createSeasonSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(100, 'El nombre es demasiado largo'),
  year: z.number().min(2024, 'Año inválido').max(2100, 'Año inválido'),
  startDate: z.string(),
  endDate: z.string(),
}).refine((data) => {
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);
  return start < end;
}, {
  message: 'La fecha de fin debe ser posterior a la fecha de inicio',
  path: ['endDate'],
});

// Tipos de competición
export const createCompetitionTypeSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres').max(50, 'El nombre es demasiado largo'),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(50, 'El slug es demasiado largo')
    .regex(/^[a-z0-9-]+$/, 'El slug solo puede contener letras minúsculas, números y guiones'),
  description: z.string().max(200, 'La descripción es demasiado larga').optional(),
  rulesDescription: z.string().min(10, 'Describe las reglas del tipo de competición').max(5000, 'La descripción es demasiado larga'),
  defaultScoringConfig: z.object({
    points_win: z.number().min(0),
    points_draw: z.number().min(0),
    points_loss: z.number().min(0),
    tiebreaker_rules: z.array(z.string()),
  }),
});

// Validaciones de parámetros de URL
export const slugParamSchema = z.object({
  slug: z.string().min(1, 'Slug requerido'),
});

export const idParamSchema = z.object({
  id: z.string().min(1, 'ID requerido'),
});

// Paginación y filtros
export const paginationSchema = z.object({
  page: z.number().min(1, 'La página debe ser mayor a 0').default(1),
  limit: z.number().min(1, 'El límite debe ser mayor a 0').max(100, 'Máximo 100 elementos por página').default(10),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

export const leagueFiltersSchema = z.object({
  status: z.enum(['DRAFT', 'REGISTRATION', 'ACTIVE', 'FINISHED', 'CANCELLED']).optional(),
  gameMode: z.enum(['INDIVIDUAL', 'PAIRS', 'MIXED']).optional(),
  tournamentFormat: z.enum(['ROUND_ROBIN', 'KNOCKOUT', 'HYBRID']).optional(),
  competitionType: z.string().optional(),
  season: z.string().optional(),
});

// Helpers para validación
export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type CreateLeagueInput = z.infer<typeof createLeagueSchema>;
export type UpdateLeagueInput = z.infer<typeof updateLeagueSchema>;
export type JoinLeagueInput = z.infer<typeof joinLeagueSchema>;
export type UpdateMatchResultInput = z.infer<typeof updateMatchResultSchema>;
export type CreateSeasonInput = z.infer<typeof createSeasonSchema>;
export type CreateCompetitionTypeInput = z.infer<typeof createCompetitionTypeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type LeagueFiltersInput = z.infer<typeof leagueFiltersSchema>;

/**
 * Valida y parsea datos usando un schema de Zod
 */
export function validateAndParse<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} {
  try {
    const parsed = schema.parse(data);
    return { success: true, data: parsed };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Error de validación desconocido' } };
  }
} 