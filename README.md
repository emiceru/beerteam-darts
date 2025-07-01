# 🎯 Beer Team Darts League Manager

Una aplicación web PWA moderna para gestionar ligas de dardos con funcionalidades completas de administración y seguimiento de jugadores.

## ✨ Características Principales

### 👨‍💼 Panel de Administrador
- **Gestión de Ligas**: Crear, editar y gestionar ligas de dardos
- **Tipos de Competición**: Soporte para 501 (cierre doble) y Cricket
- **Enlaces de Inscripción**: Generar códigos únicos para que los jugadores se unan
- **Gestión de Participantes**: Aprobar inscripciones y gestionar equipos
- **Estadísticas en Tiempo Real**: Dashboard con métricas y actividad

### 🎯 Dashboard de Jugadores
- **Mis Ligas**: Ver todas las ligas en las que participa
- **Clasificaciones**: Seguimiento de posición y estadísticas
- **Próximos Partidos**: Calendario de encuentros
- **Historial**: Resultados y estadísticas personales

### 🔗 Sistema de Inscripción
- **Enlaces Personalizados**: Códigos únicos por liga
- **Registro Automático**: Los jugadores pueden crear cuenta al inscribirse
- **Control de Límites**: Máximo de participantes y fechas de expiración

### 📱 PWA (Progressive Web App)
- **Instalable**: Se puede instalar como app nativa
- **Offline**: Funcionalidad básica sin conexión
- **Notificaciones Push**: Alertas de partidos y resultados
- **Responsive**: Optimizada para móvil, tablet y desktop

## 🚀 Tecnologías

- **Frontend**: Next.js 14, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Base de Datos**: PostgreSQL (Vercel Postgres)
- **PWA**: next-pwa
- **Autenticación**: JWT con cookies seguras
- **Validación**: Zod para esquemas TypeScript
- **UI/UX**: Lucide React icons, animaciones smooth

## 📦 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- PostgreSQL database (o usar Vercel Postgres)
- Git

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd beerteam-darts
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```bash
cp .env.example .env
```

Edita `.env` con tus credenciales:
```bash
DATABASE_URL="postgresql://usuario:password@localhost:5432/beerteam_darts"
JWT_SECRET="tu_jwt_secret_super_secreto_y_largo_aqui"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 4. Configurar la base de datos
```bash
# Migrar el esquema
npx prisma migrate dev --name init

# Cargar datos de ejemplo
npx prisma db seed
```

### 5. Iniciar el servidor de desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciales de Prueba

Después del seed, puedes usar estas credenciales:

### Administrador
- **Email**: admin@beerteam.com
- **Password**: admin123

### Usuarios de Prueba
- **Email**: player1@test.com, player2@test.com, etc.
- **Password**: 123456

### Liga de Ejemplo
- **Enlace de inscripción**: [http://localhost:3000/join/ejemplo-501-2024](http://localhost:3000/join/ejemplo-501-2024)

## 🎮 Uso de la Aplicación

### Como Administrador

1. **Acceder al Panel Admin**: Inicia sesión con credenciales de admin
2. **Crear Nueva Liga**: 
   - Ve a "Nueva Liga" en el dashboard
   - Configura tipo de competición, fechas, participantes máximos
   - Define reglas de puntuación
3. **Generar Enlaces de Inscripción**:
   - Ve a "Enlaces de Inscripción"
   - Selecciona la liga y configura límites
   - Comparte el enlace generado
4. **Gestionar Participantes**: Aprobar inscripciones y crear equipos
5. **Registrar Resultados**: Ingresar resultados de partidos

### Como Jugador

1. **Inscribirse**: Usa el enlace proporcionado por el admin
2. **Ver Dashboard**: Revisa tus ligas, clasificaciones y próximos partidos
3. **Seguir Estadísticas**: Monitorea tu progreso y historial

## 🗂️ Estructura del Proyecto

```
beerteam-darts/
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts           # Datos iniciales
├── src/
│   ├── app/
│   │   ├── admin/        # Panel de administrador
│   │   ├── api/          # API Routes
│   │   ├── dashboard/    # Dashboard de jugadores
│   │   ├── join/         # Páginas de inscripción
│   │   └── ...
│   ├── lib/
│   │   ├── auth.ts       # Sistema de autenticación
│   │   ├── db.ts         # Cliente de base de datos
│   │   └── validations.ts # Esquemas de validación
│   └── types/            # Tipos TypeScript
├── public/               # Archivos estáticos y PWA
└── ...
```

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev                # Iniciar servidor de desarrollo

# Base de datos
npm run db:migrate        # Ejecutar migraciones
npm run db:seed           # Cargar datos de ejemplo
npm run db:studio         # Abrir Prisma Studio
npm run db:generate       # Regenerar cliente Prisma

# Producción
npm run build             # Construir para producción
npm run start             # Iniciar servidor de producción
```

## 🎯 Tipos de Competición Soportados

### 501 con Cierre Doble
- Objetivo: Reducir puntuación de 501 a exactamente 0
- Cierre: Debe finalizar con doble
- Formato: Mejor de 3 o 5 sets

### Cricket
- Objetivo: Cerrar números 20, 19, 18, 17, 16, 15 y bull
- Estrategia: Cerrar y puntuar para ganar
- Formato: Primero en cerrar todos los números con ventaja

## 🎨 Diseño y UX

- **Paleta de Colores Beer Team**: Rojo (#DC143C) y Dorado (#FFD700)
- **Diseño Moderno**: Interfaz limpia y profesional
- **Responsive**: Optimizado para todos los dispositivos
- **Accesibilidad**: Siguiendo estándares WCAG
- **Animaciones Suaves**: Transiciones y micro-interacciones

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Validación de Datos**: Esquemas Zod en frontend y backend
- **Sanitización**: Protección contra XSS e inyecciones
- **HTTPS**: Configurado para producción
- **Roles de Usuario**: Control de acceso granular

## 🚀 Deployment

### Vercel (Recomendado)
1. Conecta tu repositorio GitHub con Vercel
2. Configura variables de entorno en el dashboard de Vercel
3. El deploy será automático en cada push

### Manual
```bash
npm run build
npm run start
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear branch de feature (`git checkout -b feature/AmazingFeature`)
3. Commit de cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push al branch (`git push origin feature/AmazingFeature`)
5. Abrir Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🎯 Roadmap

- [ ] Sistema de torneos knockout
- [ ] Estadísticas avanzadas y gráficos
- [ ] Chat entre jugadores
- [ ] Notificaciones por email
- [ ] API pública para integraciones
- [ ] Modo espectador en vivo
- [ ] Clasificaciones globales
- [ ] Sistema de handicap

---

**¡Desarrollado con ❤️ para la comunidad de dardos Beer Team!**
