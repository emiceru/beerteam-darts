# 🗃️ Modelo de Datos - Beer Team Darts League Manager

## 📋 Descripción General

Modelo de datos relacional optimizado para PostgreSQL que soporta múltiples ligas, temporadas, tipos de competición y modalidades de juego. Diseñado para escalabilidad y flexibilidad en la gestión de estadísticas complejas.

---

## 🏗️ Arquitectura de Datos

### **Principios de Diseño:**
- **Normalización:** Evitar redundancia manteniendo performance
- **Escalabilidad:** Soportar múltiples ligas simultáneas
- **Flexibilidad:** Configuración customizable por liga
- **Integridad:** Constraints y validaciones estrictas
- **Performance:** Índices optimizados para consultas frecuentes

---

## 📊 Diagrama de Entidades y Relaciones

```
Users (1) ──── (N) LeagueParticipants (N) ──── (1) Leagues
  │                      │                         │
  │                      │                         │
  │              (1) ── Teams ── (1)               │
  │                      │                         │
  │                      │                    (1) ─┴─ (1) Seasons
  │                      │                         │
  │                      │                         │
  │              (N) ── Matches ── (N)        (1) ─┴─ (1) CompetitionTypes
  │                      │
  │                      │
  └── (N) ── MatchResults ── (1)

NotificationSettings ── (1) Users (1) ── UserSessions
       │
       │
  Notifications ── (N) Users

JoinLinks ── (1) Leagues
```

---

## 🏷️ **1. ENTIDADES PRINCIPALES**

### **1.1 Users (Usuarios)**
```sql
Table: users
- id: UUID PRIMARY KEY
- email: VARCHAR(255) UNIQUE NOT NULL
- password_hash: VARCHAR(255) NOT NULL
- name: VARCHAR(100) NOT NULL
- role: ENUM('admin', 'player') DEFAULT 'player'
- avatar_url: VARCHAR(500) NULL
- email_verified: BOOLEAN DEFAULT false
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_users_email (email)
- idx_users_role (role)
- idx_users_created_at (created_at)
```

### **1.2 Competition Types (Tipos de Competición)**
```sql
Table: competition_types
- id: UUID PRIMARY KEY
- name: VARCHAR(50) NOT NULL
- slug: VARCHAR(50) UNIQUE NOT NULL
- description: TEXT NULL
- rules_description: TEXT NULL
- default_scoring_config: JSON NULL
- is_active: BOOLEAN DEFAULT true
- created_by: UUID REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Initial Data:
- '501-double-out': '501 con cierre doble'
- 'cricket': 'Cricket'

Indexes:
- idx_competition_types_slug (slug)
- idx_competition_types_active (is_active)
```

### **1.3 Seasons (Temporadas)**
```sql
Table: seasons
- id: UUID PRIMARY KEY
- name: VARCHAR(100) NOT NULL
- year: INTEGER NOT NULL
- start_date: DATE NOT NULL
- end_date: DATE NOT NULL
- is_active: BOOLEAN DEFAULT true
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_seasons_year (year)
- idx_seasons_active (is_active)
- idx_seasons_dates (start_date, end_date)
```

### **1.4 Leagues (Ligas)**
```sql
Table: leagues
- id: UUID PRIMARY KEY
- name: VARCHAR(100) NOT NULL
- slug: VARCHAR(100) UNIQUE NOT NULL
- description: TEXT NULL
- rules_description: TEXT NOT NULL
- season_id: UUID REFERENCES seasons(id)
- competition_type_id: UUID REFERENCES competition_types(id)
- created_by: UUID REFERENCES users(id)
- 
-- Configuración de modalidad
- game_mode: ENUM('individual', 'pairs', 'mixed') NOT NULL
- tournament_format: ENUM('round_robin', 'knockout', 'hybrid') NOT NULL
- 
-- Configuración de participantes
- max_participants: INTEGER NULL
- registration_open: BOOLEAN DEFAULT true
- auto_approve_registrations: BOOLEAN DEFAULT true
- 
-- Configuración de puntuación
- scoring_config: JSON NOT NULL
- match_data_config: JSON NOT NULL
- 
-- Fechas importantes
- registration_start: TIMESTAMP NOT NULL
- registration_end: TIMESTAMP NOT NULL
- league_start: DATE NOT NULL
- league_end: DATE NOT NULL
- 
-- Estados
- status: ENUM('draft', 'registration', 'active', 'finished', 'cancelled') DEFAULT 'draft'
- is_public: BOOLEAN DEFAULT false
- 
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_leagues_slug (slug)
- idx_leagues_season (season_id)
- idx_leagues_status (status)
- idx_leagues_registration (registration_start, registration_end)
- idx_leagues_public (is_public)
```

### **1.5 Join Links (Enlaces de Inscripción)**
```sql
Table: join_links
- id: UUID PRIMARY KEY
- league_id: UUID REFERENCES leagues(id) ON DELETE CASCADE
- code: VARCHAR(50) UNIQUE NOT NULL
- is_active: BOOLEAN DEFAULT true
- expires_at: TIMESTAMP NULL
- max_uses: INTEGER NULL
- current_uses: INTEGER DEFAULT 0
- created_by: UUID REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_join_links_code (code)
- idx_join_links_league (league_id)
- idx_join_links_active (is_active)
```

---

## 👥 **2. GESTIÓN DE PARTICIPANTES**

### **2.1 League Participants (Participantes de Liga)**
```sql
Table: league_participants
- id: UUID PRIMARY KEY
- league_id: UUID REFERENCES leagues(id) ON DELETE CASCADE
- user_id: UUID REFERENCES users(id) ON DELETE CASCADE
- registration_type: ENUM('individual', 'pair_leader', 'pair_member')
- status: ENUM('pending', 'approved', 'rejected', 'withdrawn') DEFAULT 'pending'
- joined_via_link: UUID REFERENCES join_links(id) NULL
- registration_data: JSON NULL
- approved_by: UUID REFERENCES users(id) NULL
- approved_at: TIMESTAMP NULL
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Constraints:
- UNIQUE(league_id, user_id)

Indexes:
- idx_participants_league (league_id)
- idx_participants_user (user_id)
- idx_participants_status (status)
- idx_participants_type (registration_type)
```

### **2.2 Teams (Equipos/Parejas)**
```sql
Table: teams
- id: UUID PRIMARY KEY
- league_id: UUID REFERENCES leagues(id) ON DELETE CASCADE
- name: VARCHAR(100) NULL
- player1_id: UUID REFERENCES users(id)
- player2_id: UUID REFERENCES users(id) NULL
- is_active: BOOLEAN DEFAULT true
- created_by: UUID REFERENCES users(id)
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Constraints:
- CHECK (player1_id != player2_id)
- UNIQUE(league_id, player1_id, player2_id)

Indexes:
- idx_teams_league (league_id)
- idx_teams_player1 (player1_id)
- idx_teams_player2 (player2_id)
- idx_teams_active (is_active)
```

---

## 🏆 **3. SISTEMA DE PARTIDOS**

### **3.1 Matches (Partidos)**
```sql
Table: matches
- id: UUID PRIMARY KEY
- league_id: UUID REFERENCES leagues(id) ON DELETE CASCADE
- round: INTEGER NOT NULL
- match_number: INTEGER NOT NULL
- 
-- Equipos participantes
- team1_id: UUID REFERENCES teams(id)
- team2_id: UUID REFERENCES teams(id)
- 
-- Programación
- scheduled_date: TIMESTAMP NULL
- actual_date: TIMESTAMP NULL
- 
-- Estado del partido
- status: ENUM('scheduled', 'in_progress', 'completed', 'cancelled', 'postponed') DEFAULT 'scheduled'
- 
-- Resultado
- team1_score: INTEGER NULL
- team2_score: INTEGER NULL
- winner_team_id: UUID REFERENCES teams(id) NULL
- 
-- Datos adicionales
- match_data: JSON NULL
- notes: TEXT NULL
- 
-- Gestión
- created_by: UUID REFERENCES users(id)
- result_entered_by: UUID REFERENCES users(id) NULL
- result_entered_at: TIMESTAMP NULL
- 
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Constraints:
- CHECK (team1_id != team2_id)
- CHECK (winner_team_id IN (team1_id, team2_id) OR winner_team_id IS NULL)
- UNIQUE(league_id, round, match_number)

Indexes:
- idx_matches_league (league_id)
- idx_matches_teams (team1_id, team2_id)
- idx_matches_schedule (scheduled_date)
- idx_matches_status (status)
- idx_matches_round (league_id, round)
```

### **3.2 Match Results (Resultados Detallados)**
```sql
Table: match_results
- id: UUID PRIMARY KEY
- match_id: UUID REFERENCES matches(id) ON DELETE CASCADE
- team_id: UUID REFERENCES teams(id)
- player_id: UUID REFERENCES users(id)
- 
-- Estadísticas del partido
- games_won: INTEGER DEFAULT 0
- games_lost: INTEGER DEFAULT 0
- points_scored: INTEGER DEFAULT 0
- points_against: INTEGER DEFAULT 0
- 
-- Estadísticas específicas por tipo de competición
- detailed_stats: JSON NULL
- 
-- Metadata
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_results_match (match_id)
- idx_results_team (team_id)
- idx_results_player (player_id)
```

---

## 📊 **4. SISTEMA DE CLASIFICACIONES**

### **4.1 Standings (Clasificaciones)**
```sql
Table: standings
- id: UUID PRIMARY KEY
- league_id: UUID REFERENCES leagues(id) ON DELETE CASCADE
- team_id: UUID REFERENCES teams(id) ON DELETE CASCADE
- 
-- Estadísticas básicas
- position: INTEGER NOT NULL
- matches_played: INTEGER DEFAULT 0
- matches_won: INTEGER DEFAULT 0
- matches_drawn: INTEGER DEFAULT 0
- matches_lost: INTEGER DEFAULT 0
- 
-- Puntuación
- points: INTEGER DEFAULT 0
- games_won: INTEGER DEFAULT 0
- games_lost: INTEGER DEFAULT 0
- points_for: INTEGER DEFAULT 0
- points_against: INTEGER DEFAULT 0
- 
-- Cálculos automáticos
- win_percentage: DECIMAL(5,2) DEFAULT 0
- point_difference: INTEGER DEFAULT 0
- 
-- Metadata
- last_updated: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Constraints:
- UNIQUE(league_id, team_id)
- UNIQUE(league_id, position)

Indexes:
- idx_standings_league (league_id)
- idx_standings_position (league_id, position)
- idx_standings_points (league_id, points DESC)
- idx_standings_team (team_id)
```

---

## 🔔 **5. SISTEMA DE NOTIFICACIONES**

### **5.1 Notification Settings (Configuración de Notificaciones)**
```sql
Table: notification_settings
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES users(id) ON DELETE CASCADE
- 
-- Email notifications
- email_match_reminders: BOOLEAN DEFAULT true
- email_results: BOOLEAN DEFAULT true
- email_league_updates: BOOLEAN DEFAULT true
- email_weekly_summary: BOOLEAN DEFAULT false
- 
-- Push notifications
- push_enabled: BOOLEAN DEFAULT false
- push_endpoint: TEXT NULL
- push_p256dh: TEXT NULL
- push_auth: TEXT NULL
- push_match_reminders: BOOLEAN DEFAULT true
- push_results: BOOLEAN DEFAULT true
- push_league_updates: BOOLEAN DEFAULT true
- 
-- Timing preferences
- reminder_hours_before: INTEGER DEFAULT 24
- 
- created_at: TIMESTAMP DEFAULT NOW()
- updated_at: TIMESTAMP DEFAULT NOW()

Constraints:
- UNIQUE(user_id)

Indexes:
- idx_notification_settings_user (user_id)
- idx_notification_settings_push (push_enabled)
```

### **5.2 Notifications (Historial de Notificaciones)**
```sql
Table: notifications
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES users(id) ON DELETE CASCADE
- type: VARCHAR(50) NOT NULL
- title: VARCHAR(200) NOT NULL
- message: TEXT NOT NULL
- data: JSON NULL
- 
-- Estado
- is_read: BOOLEAN DEFAULT false
- sent_email: BOOLEAN DEFAULT false
- sent_push: BOOLEAN DEFAULT false
- 
-- Referencias
- league_id: UUID REFERENCES leagues(id) NULL
- match_id: UUID REFERENCES matches(id) NULL
- 
- created_at: TIMESTAMP DEFAULT NOW()
- read_at: TIMESTAMP NULL

Indexes:
- idx_notifications_user (user_id)
- idx_notifications_unread (user_id, is_read)
- idx_notifications_type (type)
- idx_notifications_created (created_at)
```

---

## 🔐 **6. AUTENTICACIÓN Y SESIONES**

### **6.1 User Sessions (Sesiones de Usuario)**
```sql
Table: user_sessions
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES users(id) ON DELETE CASCADE
- token_hash: VARCHAR(255) NOT NULL
- device_info: VARCHAR(500) NULL
- ip_address: INET NULL
- expires_at: TIMESTAMP NOT NULL
- last_used_at: TIMESTAMP DEFAULT NOW()
- created_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_sessions_user (user_id)
- idx_sessions_token (token_hash)
- idx_sessions_expires (expires_at)
```

### **6.2 Password Reset Tokens**
```sql
Table: password_reset_tokens
- id: UUID PRIMARY KEY
- user_id: UUID REFERENCES users(id) ON DELETE CASCADE
- token_hash: VARCHAR(255) NOT NULL
- expires_at: TIMESTAMP NOT NULL
- used_at: TIMESTAMP NULL
- created_at: TIMESTAMP DEFAULT NOW()

Indexes:
- idx_reset_tokens_token (token_hash)
- idx_reset_tokens_expires (expires_at)
```

---

## ⚙️ **7. CONFIGURACIONES ESPECÍFICAS**

### **7.1 Scoring Config (JSON Schema)**
```json
{
  "type": "object",
  "properties": {
    "points_win": { "type": "integer", "default": 3 },
    "points_draw": { "type": "integer", "default": 1 },
    "points_loss": { "type": "integer", "default": 0 },
    "tiebreaker_rules": {
      "type": "array",
      "items": {
        "type": "string",
        "enum": ["head_to_head", "goal_difference", "goals_for", "games_won"]
      }
    },
    "custom_rules": { "type": "object" }
  }
}
```

### **7.2 Match Data Config (JSON Schema)**
```json
{
  "type": "object",
  "properties": {
    "track_detailed_score": { "type": "boolean", "default": false },
    "track_game_by_game": { "type": "boolean", "default": false },
    "track_throw_count": { "type": "boolean", "default": false },
    "track_time": { "type": "boolean", "default": false },
    "required_fields": {
      "type": "array",
      "items": { "type": "string" }
    },
    "custom_fields": { "type": "object" }
  }
}
```

---

## 🗂️ **8. SCHEMA PRISMA COMPLETO**

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String   @id @default(cuid())
  email         String   @unique
  passwordHash  String   @map("password_hash")
  name          String
  role          Role     @default(PLAYER)
  avatarUrl     String?  @map("avatar_url")
  emailVerified Boolean  @default(false) @map("email_verified")
  isActive      Boolean  @default(true) @map("is_active")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  createdLeagues         League[]              @relation("LeagueCreator")
  createdCompetitionTypes CompetitionType[]   @relation("CompetitionTypeCreator")
  participations         LeagueParticipant[]
  teamAsPlayer1          Team[]               @relation("TeamPlayer1")
  teamAsPlayer2          Team[]               @relation("TeamPlayer2")
  createdTeams           Team[]               @relation("TeamCreator")
  createdMatches         Match[]              @relation("MatchCreator")
  enteredResults         Match[]              @relation("ResultEnterer")
  matchResults           MatchResult[]
  notifications          Notification[]
  notificationSettings   NotificationSetting?
  sessions               UserSession[]
  passwordResetTokens    PasswordResetToken[]
  createdJoinLinks       JoinLink[]           @relation("JoinLinkCreator")
  approvedParticipants   LeagueParticipant[]  @relation("ParticipantApprover")

  @@map("users")
}

model CompetitionType {
  id                    String  @id @default(cuid())
  name                  String
  slug                  String  @unique
  description           String?
  rulesDescription      String? @map("rules_description")
  defaultScoringConfig  Json?   @map("default_scoring_config")
  isActive              Boolean @default(true) @map("is_active")
  createdBy             String  @map("created_by")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  // Relations
  creator User     @relation("CompetitionTypeCreator", fields: [createdBy], references: [id])
  leagues League[]

  @@map("competition_types")
}

model Season {
  id        String   @id @default(cuid())
  name      String
  year      Int
  startDate DateTime @map("start_date") @db.Date
  endDate   DateTime @map("end_date") @db.Date
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  leagues League[]

  @@map("seasons")
}

model League {
  id                        String            @id @default(cuid())
  name                      String
  slug                      String            @unique
  description               String?
  rulesDescription          String            @map("rules_description")
  seasonId                  String            @map("season_id")
  competitionTypeId         String            @map("competition_type_id")
  createdBy                 String            @map("created_by")
  gameMode                  GameMode          @map("game_mode")
  tournamentFormat          TournamentFormat  @map("tournament_format")
  maxParticipants           Int?              @map("max_participants")
  registrationOpen          Boolean           @default(true) @map("registration_open")
  autoApproveRegistrations  Boolean           @default(true) @map("auto_approve_registrations")
  scoringConfig             Json              @map("scoring_config")
  matchDataConfig           Json              @map("match_data_config")
  registrationStart         DateTime          @map("registration_start")
  registrationEnd           DateTime          @map("registration_end")
  leagueStart               DateTime          @map("league_start") @db.Date
  leagueEnd                 DateTime          @map("league_end") @db.Date
  status                    LeagueStatus      @default(DRAFT)
  isPublic                  Boolean           @default(false) @map("is_public")
  createdAt                 DateTime          @default(now()) @map("created_at")
  updatedAt                 DateTime          @updatedAt @map("updated_at")

  // Relations
  season          Season              @relation(fields: [seasonId], references: [id])
  competitionType CompetitionType     @relation(fields: [competitionTypeId], references: [id])
  creator         User                @relation("LeagueCreator", fields: [createdBy], references: [id])
  participants    LeagueParticipant[]
  teams           Team[]
  matches         Match[]
  standings       Standing[]
  joinLinks       JoinLink[]
  notifications   Notification[]

  @@map("leagues")
}

model JoinLink {
  id          String    @id @default(cuid())
  leagueId    String    @map("league_id")
  code        String    @unique
  isActive    Boolean   @default(true) @map("is_active")
  expiresAt   DateTime? @map("expires_at")
  maxUses     Int?      @map("max_uses")
  currentUses Int       @default(0) @map("current_uses")
  createdBy   String    @map("created_by")
  createdAt   DateTime  @default(now()) @map("created_at")
  updatedAt   DateTime  @updatedAt @map("updated_at")

  // Relations
  league              League              @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  creator             User                @relation("JoinLinkCreator", fields: [createdBy], references: [id])
  usedByParticipants  LeagueParticipant[]

  @@map("join_links")
}

model LeagueParticipant {
  id               String                @id @default(cuid())
  leagueId         String                @map("league_id")
  userId           String                @map("user_id")
  registrationType RegistrationType      @map("registration_type")
  status           ParticipantStatus     @default(PENDING)
  joinedViaLink    String?               @map("joined_via_link")
  registrationData Json?                 @map("registration_data")
  approvedBy       String?               @map("approved_by")
  approvedAt       DateTime?             @map("approved_at")
  createdAt        DateTime              @default(now()) @map("created_at")
  updatedAt        DateTime              @updatedAt @map("updated_at")

  // Relations
  league    League    @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  user      User      @relation(fields: [userId], references: [id], onDelete: Cascade)
  joinLink  JoinLink? @relation(fields: [joinedViaLink], references: [id])
  approver  User?     @relation("ParticipantApprover", fields: [approvedBy], references: [id])

  @@unique([leagueId, userId])
  @@map("league_participants")
}

model Team {
  id        String   @id @default(cuid())
  leagueId  String   @map("league_id")
  name      String?
  player1Id String   @map("player1_id")
  player2Id String?  @map("player2_id")
  isActive  Boolean  @default(true) @map("is_active")
  createdBy String   @map("created_by")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  league        League        @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  player1       User          @relation("TeamPlayer1", fields: [player1Id], references: [id])
  player2       User?         @relation("TeamPlayer2", fields: [player2Id], references: [id])
  creator       User          @relation("TeamCreator", fields: [createdBy], references: [id])
  matchesAsTeam1 Match[]      @relation("MatchTeam1")
  matchesAsTeam2 Match[]      @relation("MatchTeam2")
  winsAsWinner  Match[]       @relation("MatchWinner")
  results       MatchResult[]
  standings     Standing[]

  @@unique([leagueId, player1Id, player2Id])
  @@map("teams")
}

model Match {
  id                String      @id @default(cuid())
  leagueId          String      @map("league_id")
  round             Int
  matchNumber       Int         @map("match_number")
  team1Id           String      @map("team1_id")
  team2Id           String      @map("team2_id")
  scheduledDate     DateTime?   @map("scheduled_date")
  actualDate        DateTime?   @map("actual_date")
  status            MatchStatus @default(SCHEDULED)
  team1Score        Int?        @map("team1_score")
  team2Score        Int?        @map("team2_score")
  winnerTeamId      String?     @map("winner_team_id")
  matchData         Json?       @map("match_data")
  notes             String?
  createdBy         String      @map("created_by")
  resultEnteredBy   String?     @map("result_entered_by")
  resultEnteredAt   DateTime?   @map("result_entered_at")
  createdAt         DateTime    @default(now()) @map("created_at")
  updatedAt         DateTime    @updatedAt @map("updated_at")

  // Relations
  league        League        @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  team1         Team          @relation("MatchTeam1", fields: [team1Id], references: [id])
  team2         Team          @relation("MatchTeam2", fields: [team2Id], references: [id])
  winnerTeam    Team?         @relation("MatchWinner", fields: [winnerTeamId], references: [id])
  creator       User          @relation("MatchCreator", fields: [createdBy], references: [id])
  resultEnterer User?         @relation("ResultEnterer", fields: [resultEnteredBy], references: [id])
  results       MatchResult[]
  notifications Notification[]

  @@unique([leagueId, round, matchNumber])
  @@map("matches")
}

model MatchResult {
  id            String   @id @default(cuid())
  matchId       String   @map("match_id")
  teamId        String   @map("team_id")
  playerId      String   @map("player_id")
  gamesWon      Int      @default(0) @map("games_won")
  gamesLost     Int      @default(0) @map("games_lost")
  pointsScored  Int      @default(0) @map("points_scored")
  pointsAgainst Int      @default(0) @map("points_against")
  detailedStats Json?    @map("detailed_stats")
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @updatedAt @map("updated_at")

  // Relations
  match  Match @relation(fields: [matchId], references: [id], onDelete: Cascade)
  team   Team  @relation(fields: [teamId], references: [id])
  player User  @relation(fields: [playerId], references: [id])

  @@map("match_results")
}

model Standing {
  id              String   @id @default(cuid())
  leagueId        String   @map("league_id")
  teamId          String   @map("team_id")
  position        Int
  matchesPlayed   Int      @default(0) @map("matches_played")
  matchesWon      Int      @default(0) @map("matches_won")
  matchesDrawn    Int      @default(0) @map("matches_drawn")
  matchesLost     Int      @default(0) @map("matches_lost")
  points          Int      @default(0)
  gamesWon        Int      @default(0) @map("games_won")
  gamesLost       Int      @default(0) @map("games_lost")
  pointsFor       Int      @default(0) @map("points_for")
  pointsAgainst   Int      @default(0) @map("points_against")
  winPercentage   Decimal  @default(0) @map("win_percentage") @db.Decimal(5,2)
  pointDifference Int      @default(0) @map("point_difference")
  lastUpdated     DateTime @default(now()) @map("last_updated")
  updatedAt       DateTime @updatedAt @map("updated_at")

  // Relations
  league League @relation(fields: [leagueId], references: [id], onDelete: Cascade)
  team   Team   @relation(fields: [teamId], references: [id], onDelete: Cascade)

  @@unique([leagueId, teamId])
  @@unique([leagueId, position])
  @@map("standings")
}

model NotificationSetting {
  id                    String   @id @default(cuid())
  userId                String   @unique @map("user_id")
  emailMatchReminders   Boolean  @default(true) @map("email_match_reminders")
  emailResults          Boolean  @default(true) @map("email_results")
  emailLeagueUpdates    Boolean  @default(true) @map("email_league_updates")
  emailWeeklySummary    Boolean  @default(false) @map("email_weekly_summary")
  pushEnabled           Boolean  @default(false) @map("push_enabled")
  pushEndpoint          String?  @map("push_endpoint")
  pushP256dh            String?  @map("push_p256dh")
  pushAuth              String?  @map("push_auth")
  pushMatchReminders    Boolean  @default(true) @map("push_match_reminders")
  pushResults           Boolean  @default(true) @map("push_results")
  pushLeagueUpdates     Boolean  @default(true) @map("push_league_updates")
  reminderHoursBefore   Int      @default(24) @map("reminder_hours_before")
  createdAt             DateTime @default(now()) @map("created_at")
  updatedAt             DateTime @updatedAt @map("updated_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("notification_settings")
}

model Notification {
  id       String   @id @default(cuid())
  userId   String   @map("user_id")
  type     String
  title    String
  message  String
  data     Json?
  isRead   Boolean  @default(false) @map("is_read")
  sentEmail Boolean @default(false) @map("sent_email")
  sentPush Boolean  @default(false) @map("sent_push")
  leagueId String?  @map("league_id")
  matchId  String?  @map("match_id")
  createdAt DateTime @default(now()) @map("created_at")
  readAt   DateTime? @map("read_at")

  // Relations
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
  league League? @relation(fields: [leagueId], references: [id])
  match  Match?  @relation(fields: [matchId], references: [id])

  @@map("notifications")
}

model UserSession {
  id          String   @id @default(cuid())
  userId      String   @map("user_id")
  tokenHash   String   @map("token_hash")
  deviceInfo  String?  @map("device_info")
  ipAddress   String?  @map("ip_address")
  expiresAt   DateTime @map("expires_at")
  lastUsedAt  DateTime @default(now()) @map("last_used_at")
  createdAt   DateTime @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("user_sessions")
}

model PasswordResetToken {
  id        String    @id @default(cuid())
  userId    String    @map("user_id")
  tokenHash String    @map("token_hash")
  expiresAt DateTime  @map("expires_at")
  usedAt    DateTime? @map("used_at")
  createdAt DateTime  @default(now()) @map("created_at")

  // Relations
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("password_reset_tokens")
}

// Enums
enum Role {
  ADMIN
  PLAYER
}

enum GameMode {
  INDIVIDUAL
  PAIRS
  MIXED
}

enum TournamentFormat {
  ROUND_ROBIN
  KNOCKOUT
  HYBRID
}

enum LeagueStatus {
  DRAFT
  REGISTRATION
  ACTIVE
  FINISHED
  CANCELLED
}

enum RegistrationType {
  INDIVIDUAL
  PAIR_LEADER
  PAIR_MEMBER
}

enum ParticipantStatus {
  PENDING
  APPROVED
  REJECTED
  WITHDRAWN
}

enum MatchStatus {
  SCHEDULED
  IN_PROGRESS
  COMPLETED
  CANCELLED
  POSTPONED
}
```

---

## 🚀 **9. MIGRATIONS INICIALES**

### **9.1 Datos Iniciales (Seeds)**
```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  // 1. Crear usuario administrador
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.create({
    data: {
      email: 'admin@beerteam.com',
      passwordHash: adminPassword,
      name: 'Administrador Beer Team',
      role: 'ADMIN',
      emailVerified: true,
    }
  })

  // 2. Crear tipos de competición iniciales
  const competition501 = await prisma.competitionType.create({
    data: {
      name: '501 con cierre doble',
      slug: '501-double-out',
      description: 'Juego clásico de 501 puntos con cierre obligatorio en doble',
      rulesDescription: `
        - Cada jugador comienza con 501 puntos
        - El objetivo es reducir exactamente a 0
        - Debe cerrar con doble o bullseye
        - Si queda en negativo o 1, el turno es nulo
      `,
      defaultScoringConfig: {
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        tiebreaker_rules: ['head_to_head', 'goal_difference']
      },
      createdBy: admin.id
    }
  })

  const competitionCricket = await prisma.competitionType.create({
    data: {
      name: 'Cricket',
      slug: 'cricket',
      description: 'Juego de Cricket estándar',
      rulesDescription: `
        - Objetivos: 20, 19, 18, 17, 16, 15 y Bull
        - 3 impactos para cerrar un objetivo
        - Puntos solo si el objetivo está cerrado por ti y abierto por el rival
        - Gana quien cierre todos los objetivos y tenga más puntos
      `,
      defaultScoringConfig: {
        points_win: 3,
        points_draw: 1,
        points_loss: 0,
        tiebreaker_rules: ['head_to_head', 'games_won']
      },
      createdBy: admin.id
    }
  })

  // 3. Crear temporada actual
  const currentSeason = await prisma.season.create({
    data: {
      name: 'Temporada 2024',
      year: 2024,
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true
    }
  })

  console.log('✅ Seed completado')
  console.log('👤 Admin creado:', admin.email)
  console.log('🎯 Tipos de competición:', competition501.name, competitionCricket.name)
  console.log('📅 Temporada:', currentSeason.name)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

---

## 📈 **10. ÍNDICES DE PERFORMANCE**

### **10.1 Índices Críticos**
```sql
-- Consultas frecuentes de clasificaciones
CREATE INDEX CONCURRENTLY idx_standings_league_position 
ON standings(league_id, position);

-- Búsqueda de partidos por fecha
CREATE INDEX CONCURRENTLY idx_matches_schedule_league 
ON matches(league_id, scheduled_date) 
WHERE status IN ('scheduled', 'in_progress');

-- Notificaciones no leídas
CREATE INDEX CONCURRENTLY idx_notifications_user_unread 
ON notifications(user_id, created_at) 
WHERE is_read = false;

-- Inscripciones activas por liga
CREATE INDEX CONCURRENTLY idx_participants_league_active 
ON league_participants(league_id, status) 
WHERE status = 'approved';
```

### **10.2 Consultas Optimizadas**
```sql
-- Top consultas esperadas:

-- 1. Clasificación de liga (muy frecuente)
SELECT * FROM standings 
WHERE league_id = $1 
ORDER BY position ASC;

-- 2. Próximos partidos de usuario (frecuente)
SELECT m.*, t1.name as team1_name, t2.name as team2_name
FROM matches m
JOIN teams t1 ON m.team1_id = t1.id
JOIN teams t2 ON m.team2_id = t2.id
WHERE (t1.player1_id = $1 OR t1.player2_id = $1 OR t2.player1_id = $1 OR t2.player2_id = $1)
AND m.status = 'scheduled'
ORDER BY m.scheduled_date ASC;

-- 3. Estadísticas de jugador (moderadamente frecuente)
SELECT 
  COUNT(*) as total_matches,
  COUNT(CASE WHEN winner_team_id IN (
    SELECT id FROM teams WHERE player1_id = $1 OR player2_id = $1
  ) THEN 1 END) as wins
FROM matches m
WHERE m.status = 'completed'
AND (m.team1_id IN (SELECT id FROM teams WHERE player1_id = $1 OR player2_id = $1)
     OR m.team2_id IN (SELECT id FROM teams WHERE player1_id = $1 OR player2_id = $1));
```

---

## ✅ **11. VALIDACIONES Y CONSTRAINTS**

### **11.1 Validaciones de Negocio**
```sql
-- Validar que un partido tenga equipos diferentes
ALTER TABLE matches ADD CONSTRAINT check_different_teams 
CHECK (team1_id != team2_id);

-- Validar que el ganador sea uno de los equipos participantes
ALTER TABLE matches ADD CONSTRAINT check_winner_is_participant 
CHECK (winner_team_id IS NULL OR winner_team_id IN (team1_id, team2_id));

-- Validar fechas de liga
ALTER TABLE leagues ADD CONSTRAINT check_league_dates 
CHECK (league_start <= league_end AND registration_start <= registration_end);

-- Validar que en equipos, player1 y player2 sean diferentes
ALTER TABLE teams ADD CONSTRAINT check_different_players 
CHECK (player1_id != player2_id OR player2_id IS NULL);

-- Validar puntuaciones no negativas
ALTER TABLE standings ADD CONSTRAINT check_non_negative_stats 
CHECK (points >= 0 AND matches_played >= 0 AND matches_won >= 0 
       AND matches_drawn >= 0 AND matches_lost >= 0);
```

### **11.2 Funciones de Validación TypeScript**
```typescript
// src/lib/validations.ts
export const leagueValidations = {
  maxParticipants: (value?: number) => 
    !value || (value >= 2 && value <= 1000),
  
  dateRanges: (start: Date, end: Date, regStart: Date, regEnd: Date) => 
    start <= end && regStart <= regEnd && regEnd <= start,
  
  scoringConfig: (config: any) => 
    config.points_win >= 0 && config.points_draw >= 0 && config.points_loss >= 0
}

export const matchValidations = {
  score: (team1Score?: number, team2Score?: number) =>
    (!team1Score && !team2Score) || (team1Score >= 0 && team2Score >= 0),
  
  teams: (team1Id: string, team2Id: string) => team1Id !== team2Id
}
```

---

**Documento creado:** `modelo-datos.md`  
**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Proyecto:** Beer Team Darts League Manager

---

Este modelo de datos está diseñado para:
- ✅ **Escalabilidad**: Soportar miles de usuarios y múltiples ligas
- ✅ **Flexibilidad**: Configuraciones customizables por liga
- ✅ **Performance**: Índices optimizados para consultas frecuentes
- ✅ **Integridad**: Constraints y validaciones robustas
- ✅ **Mantenibilidad**: Schema claro y bien documentado
</rewritten_file> 