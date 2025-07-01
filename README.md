# 🎯 Beer Team Darts League Manager

Una aplicación web completa (PWA) para gestionar ligas de dardos con funcionalidades avanzadas para administradores y jugadores.

![Beer Team Logo](https://img.shields.io/badge/Beer%20Team-Darts-DC143C?style=for-the-badge&logo=target)

## 🚀 Características Principales

- **🏆 Gestión Completa de Ligas**: Individual/Parejas, 501/Cricket, torneos personalizables
- **👥 Sistema Multi-Usuario**: Roles de administrador y jugador con permisos específicos
- **📱 PWA Completa**: Instalación, funcionamiento offline, notificaciones push
- **📊 Estadísticas Avanzadas**: Tracking completo de partidos y clasificaciones automáticas
- **🔗 Enlaces de Inscripción**: Códigos personalizados para unirse a ligas
- **🎨 Diseño Moderno**: Interfaz responsive con colores Beer Team (rojo/dorado)
- **⚡ Tiempo Real**: Notificaciones push y actualizaciones instantáneas

## 🛠️ Stack Tecnológico

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Base de Datos**: PostgreSQL + Prisma ORM
- **Autenticación**: JWT custom
- **PWA**: next-pwa
- **Notificaciones**: Web Push + Nodemailer
- **Deployment**: Vercel (gratuito)
- **UI Components**: Headless UI, Lucide React, Framer Motion

## 📋 Requisitos Previos

- Node.js 18+ 
- PostgreSQL 12+ (o usar Vercel Postgres)
- Git

## 🚀 Configuración Inicial

### 1. Clonar el Repositorio
```bash
git clone <repository-url>
cd beerteam-darts
```

### 2. Instalar Dependencias
```bash
npm install
```

### 3. Configurar Variables de Entorno

Crear archivo `.env` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/beerteam_darts?schema=public"

# Para Vercel Postgres (Producción)
# DATABASE_URL="postgres://default:your_password@your-host.us-east-1.postgres.vercel-storage.com:5432/verceldb"

# Next.js
NEXTAUTH_SECRET="your-super-secret-jwt-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"

# Email Settings (Nodemailer)
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@gmail.com"
EMAIL_PASS="your-app-password"
EMAIL_FROM="Beer Team Darts <noreply@beerteam.com>"

# Push Notifications (Web Push)
VAPID_PUBLIC_KEY="your-vapid-public-key"
VAPID_PRIVATE_KEY="your-vapid-private-key"
VAPID_EMAIL="mailto:admin@beerteam.com"

# App Configuration
APP_NAME="Beer Team Darts League Manager"
APP_URL="http://localhost:3000"
ADMIN_EMAIL="admin@beerteam.com"
NODE_ENV="development"
```

### 4. Configurar Base de Datos

#### Opción A: PostgreSQL Local
```bash
# Instalar PostgreSQL
# Crear base de datos
createdb beerteam_darts

# Aplicar migraciones
npm run db:push
```

#### Opción B: Vercel Postgres (Recomendado)
1. Crear proyecto en [Vercel](https://vercel.com)
2. Añadir Storage → Postgres
3. Copiar DATABASE_URL al archivo .env
4. Ejecutar: `npm run db:push`

### 5. Generar Cliente Prisma y Seed
```bash
# Generar cliente
npm run db:generate

# Poblar base de datos con datos iniciales
npm run db:seed
```

### 6. Iniciar Desarrollo
```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

## 📝 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Iniciar servidor de desarrollo
npm run build        # Build para producción
npm run start        # Iniciar servidor de producción
npm run lint         # Ejecutar ESLint

# Base de Datos
npm run db:push      # Aplicar cambios del schema sin migración
npm run db:migrate   # Crear y aplicar migración
npm run db:seed      # Poblar DB con datos iniciales
npm run db:studio    # Abrir Prisma Studio
npm run db:generate  # Regenerar cliente Prisma
```

## 🎮 Datos de Prueba

Después del seed inicial tendrás acceso a:

### 👤 Usuario Administrador
- **Email**: admin@beerteam.com
- **Contraseña**: admin123

### 👥 Usuarios de Prueba
- **Email**: juan@test.com, maria@test.com, carlos@test.com, etc.
- **Contraseña**: 123456

### 🏆 Liga de Ejemplo
- **Nombre**: Liga de Ejemplo 501
- **Enlace de inscripción**: `/join/ejemplo-501-2024`
- **Estado**: Inscripciones abiertas

## 🗂️ Estructura del Proyecto

```
beerteam-darts/
├── src/
│   ├── app/                 # App Router de Next.js
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Páginas de autenticación
│   │   ├── dashboard/      # Dashboard de usuario
│   │   ├── admin/          # Panel de administración
│   │   └── leagues/        # Páginas de ligas
│   ├── components/         # Componentes reutilizables
│   ├── lib/               # Utilidades y configuración
│   │   ├── auth.ts        # Sistema de autenticación
│   │   ├── db.ts          # Configuración Prisma
│   │   ├── utils.ts       # Funciones helper
│   │   └── validations.ts # Esquemas Zod
│   └── types/             # Tipos TypeScript
├── prisma/
│   ├── schema.prisma      # Modelo de datos
│   └── seed.ts           # Datos iniciales
├── public/               # Assets estáticos
└── docs/                 # Documentación adicional
```

## 🎨 Diseño y Colores

La aplicación utiliza la paleta de colores oficial de Beer Team:

- **Rojo Principal**: `#DC143C` (beer-red)
- **Dorado**: `#FFD700` (beer-gold)  
- **Crema**: `#FFF8DC` (beer-cream)
- **Negro**: `#000000` (beer-black)

## 🔧 Configuración de Desarrollo

### ESLint y Prettier
El proyecto viene preconfigurado con reglas de linting y formateo.

### PWA
En desarrollo, PWA está deshabilitado. Se activa automáticamente en producción.

### Base de Datos
Usa Prisma Studio para explorar los datos:
```bash
npm run db:studio
```

## 🚀 Deployment

### Vercel (Recomendado)
1. Push tu código a GitHub
2. Conectar repositorio en [Vercel](https://vercel.com)
3. Configurar variables de entorno en Vercel
4. Deploy automático

### Variables de Entorno en Producción
Asegúrate de configurar todas las variables en Vercel:
- `DATABASE_URL` (Vercel Postgres)
- `NEXTAUTH_SECRET` (generar nuevo)
- `EMAIL_*` (configuración SMTP)
- `VAPID_*` (para push notifications)

## 📖 Documentación Adicional

- [Requisitos Funcionales](./requisitos-funcionales.md)
- [Modelo de Datos](./modelo-datos.md)
- [API Documentation](./docs/api.md) (próximamente)
- [Guía de Usuario](./docs/user-guide.md) (próximamente)

## 🐛 Troubleshooting

### Problemas Comunes

**Error de conexión a DB**
```bash
# Verificar que PostgreSQL esté ejecutándose
# Comprobar credenciales en .env
# Ejecutar: npm run db:push
```

**Error de build**
```bash
# Limpiar cache y reinstalar
rm -rf .next node_modules
npm install
npm run build
```

**Problemas con Prisma**
```bash
# Regenerar cliente
npm run db:generate
# Reset completo (¡cuidado!)
npx prisma db push --force-reset
npm run db:seed
```

## 🤝 Contribución

1. Fork del proyecto
2. Crear rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Crear Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👥 Equipo

Desarrollado con ❤️ por el equipo Beer Team para la comunidad de jugadores de dardos.

---

¿Problemas o sugerencias? [Crear un issue](../../issues) o contactar: info@beerteam.com
