# 🎯 Requisitos Funcionales - Beer Team Darts League Manager

## 📋 Descripción General

Aplicación web progresiva (PWA) para la gestión completa de ligas de dardos. Permite a los administradores crear y gestionar ligas personalizadas, mientras que los jugadores pueden inscribirse, ver clasificaciones y seguir sus partidos en tiempo real.

---

## 🎯 Objetivos del Sistema

- Gestión completa de ligas de dardos con múltiples modalidades
- Inscripción pública mediante enlaces personalizados
- Dashboard administrativo para control total de la liga
- Dashboard de usuario para seguimiento personal
- Sistema de notificaciones y trabajo offline
- Diseño responsive moderno basado en la identidad Beer Team

---

## 👤 Roles de Usuario

### 🔑 Administrador
- Control total sobre ligas, usuarios y configuraciones
- Gestión de partidos y resultados
- Acceso a estadísticas completas del sistema
- Creación de enlaces de inscripción personalizados

### 🎮 Jugador
- Inscripción a ligas disponibles
- Visualización de clasificaciones y partidos
- Gestión de perfil personal
- Acceso a estadísticas personales e historial

---

## 🏆 **1. GESTIÓN DE ADMINISTRADOR**

### **1.1 Gestión de Tipos de Competición**
- **Tipos iniciales disponibles:**
  - 501 con cierre doble
  - Cricket
- **Funcionalidades:**
  - Crear/editar/eliminar tipos de competición personalizados (funcionalidad futura)
  - Configurar descripción detallada de reglas para cada tipo
  - Definir parámetros específicos por tipo de competición

### **1.2 Gestión de Ligas**

#### **Creación de Liga:**
- **Información básica:**
  - Nombre de la liga
  - Descripción general
  - Tipo de competición (501 cierre doble o Cricket)
  - **Descripción detallada de reglas** específicas para esa liga
  - Temporada/año

- **Configuración de modalidad:**
  - Individual
  - Parejas 
  - Mixta (permite ambos tipos de inscripción)

- **Configuración de formato:**
  - Todos contra todos (round-robin)
  - Eliminatoria (knockout)
  - Configuraciones híbridas

- **Sistema de puntuación:**
  - Personalizable por liga
  - **Por defecto:** 3 puntos victoria, 1 punto empate, 0 puntos derrota
  - Posibilidad de definir sistemas alternativos

- **Configuración de datos de partidos:**
  - Resultado simple (ganador/perdedor)
  - Puntuación detallada
  - Estadísticas adicionales (número de dardos, tiempo, etc.)

- **Configuración de participantes:**
  - **Número máximo de participantes (OPCIONAL)**
  - Si no se especifica, inscripción ilimitada
  - Control de inscripciones abiertas/cerradas

- **Fechas y programación:**
  - Fecha de inicio de la liga
  - Fecha de finalización
  - Periodo de inscripciones
  - Configuración de calendario de partidos

#### **Sistema de Enlaces de Inscripción:**
- **Generar URLs únicas** para cada liga
  - Formato: `/join/[nombre-liga]-[codigo-unico]`
  - Ejemplo: `/join/liga-verano-2024-abc123`
- **Gestión de enlaces:**
  - Regenerar enlace si es necesario
  - Activar/desactivar enlace de inscripción
  - Control de expiración de enlaces
- **Vista previa** de la página de inscripción pública

### **1.3 Gestión de Temporadas**
- **Crear nuevas temporadas** para ligas existentes
- **Archivar temporadas** anteriores manteniendo datos
- **Acceso completo al historial** de todas las temporadas
- **Migración de configuraciones** entre temporadas
- **Estadísticas comparativas** entre temporadas

### **1.4 Gestión de Participantes**
- **Visualización completa:**
  - Lista de todos los usuarios registrados en el sistema
  - Participantes por liga específica
  - Estado de inscripciones (pendiente/aprobada/rechazada)

- **Gestión de inscripciones:**
  - Aprobar/rechazar inscripciones pendientes
  - Eliminar participantes de ligas activas
  - Transferir participantes entre ligas

- **Gestión de parejas (modalidad parejas):**
  - Formar parejas manualmente cuando usuarios se inscriben individualmente
  - Modificar composición de parejas existentes
  - Gestionar sustituciones en parejas

### **1.5 Gestión de Partidos**
- **Generación de calendario:**
  - Calendario automático según formato elegido (round-robin/eliminatoria)
  - Configuración de fechas y horarios
  - Distribución equilibrada de partidos

- **Gestión de partidos:**
  - Modificar fechas/horarios de partidos específicos
  - Reprogramar partidos cancelados
  - Marcar partidos como jugados/pendientes/cancelados

- **Registro de resultados:**
  - Resultado simple o detallado según configuración de liga
  - Validación de resultados según reglas del tipo de competición
  - Posibilidad de modificar resultados ya registrados
  - Comentarios adicionales por partido

- **Estadísticas y reportes:**
  - Estadísticas completas de todas las ligas y temporadas
  - Reportes de participación y rendimiento
  - Exportación de datos

---

## 🎮 **2. GESTIÓN DE USUARIOS/JUGADORES**

### **2.1 Registro y Autenticación**
- **Registro:**
  - Formulario con email y nombre completo
  - Validación de email único
  - Creación automática de cuenta desde enlace de inscripción

- **Autenticación:**
  - Login/logout seguro
  - Recuperación de contraseña vía email
  - Sesiones persistentes opcionales

### **2.2 Gestión de Perfil**
- **Información personal:**
  - Editar nombre, email y datos de contacto
  - Avatar/foto de perfil (opcional)
  - Configuraciones de notificaciones

- **Historial deportivo:**
  - Historial completo de participación en ligas
  - Estadísticas personales de todas las temporadas
  - Logros y reconocimientos

### **2.3 Inscripción a Ligas**
- **Visualización de ligas:**
  - Ligas disponibles para inscripción
  - Información detallada de cada liga (reglas, fechas, modalidad)
  - Estado de plazas disponibles

- **Proceso de inscripción:**
  - Inscripción individual o en pareja
  - Inscripción vía enlace personalizado (sin login previo)
  - Confirmación automática o pendiente de aprobación
  - Notificación de estado de inscripción

---

## 📊 **3. DASHBOARDS**

### **3.1 Dashboard de Administrador**
- **Panel principal:**
  - Resumen de todas las ligas activas
  - Métricas generales del sistema (usuarios, partidos, etc.)
  - Actividad reciente del sistema

- **Gestión rápida:**
  - Partidos pendientes de registrar resultados
  - Inscripciones pendientes de aprobación
  - Notificaciones del sistema

- **Acceso directo:**
  - Gestión de ligas, usuarios y temporadas
  - Configuraciones del sistema
  - Herramientas de administración

- **Reportes y estadísticas:**
  - Historial completo de todas las ligas y temporadas
  - Estadísticas de participación y engagement
  - Datos para análisis y mejoras

### **3.2 Dashboard de Jugador**
- **Panel personal:**
  - Ligas activas en las que participa
  - Resumen de rendimiento actual
  - Notificaciones importantes

- **Información de ligas:**
  - Clasificación actual de cada liga
  - Posición personal y puntos
  - Próximos partidos programados

- **Historial y estadísticas:**
  - Partidos jugados con resultados detallados
  - Estadísticas personales (% victorias, promedio puntos, etc.)
  - Comparación con otros jugadores

- **Acceso histórico:**
  - Datos de temporadas anteriores
  - Progresión temporal del rendimiento
  - Historial completo de participación

---

## 🏅 **4. SISTEMA DE CLASIFICACIÓN Y ESTADÍSTICAS**

### **4.1 Cálculo de Puntuaciones**
- **Sistema automático:**
  - Cálculo en tiempo real según sistema configurado por liga
  - Actualización inmediata tras registro de resultados
  - Manejo de empates y situaciones especiales

- **Criterios de desempate:**
  - Enfrentamiento directo
  - Diferencia de puntos/games
  - Criterios adicionales configurables

### **4.2 Estadísticas Detalladas**
- **Por jugador/pareja:**
  - Partidos jugados, ganados, perdidos, empatados
  - Porcentaje de victorias
  - Puntos totales y promedio por partido
  - Estadísticas específicas por tipo de competición

- **Por liga:**
  - Ranking completo actualizado
  - Estadísticas generales de la competición
  - Récords y logros destacados

- **Historial completo:**
  - Acceso a todas las temporadas
  - Comparativas temporales
  - Evolución del rendimiento

### **4.3 Exportación de Datos**
- Exportar clasificaciones en formatos estándar (PDF, Excel)
- Reportes personalizados de estadísticas
- Datos para análisis externo

---

## 📧 **5. SISTEMA DE NOTIFICACIONES**

### **5.1 Notificaciones por Email**
- **Automaticas:**
  - Confirmación de inscripción a liga
  - Recordatorios de partidos próximos (24h y 2h antes)
  - Notificación de resultados registrados
  - Cambios en clasificación importante

- **Configurables:**
  - Resumen semanal de actividad
  - Notificaciones de nuevas ligas disponibles
  - Actualizaciones del sistema

### **5.2 Notificaciones Push (PWA)**
- **En tiempo real:**
  - Resultado de partido registrado
  - Cambios en próximos partidos
  - Mensajes del administrador
  - Logros y reconocimientos

- **Programadas:**
  - Recordatorios de partidos
  - Inicio/fin de temporadas
  - Deadlines importantes

### **5.3 Configuración de Notificaciones**
- Panel de preferencias por usuario
- Activar/desactivar tipos específicos
- Configurar frecuencia y timing
- Múltiples canales (email, push, en app)

---

## 📱 **6. CARACTERÍSTICAS PWA**

### **6.1 Instalación**
- **Instalable** en dispositivos móviles y desktop
- **Icono personalizado** con branding Beer Team
- **Splash screen** con diseño coherente
- **Experiencia nativa** una vez instalada

### **6.2 Funcionalidad Offline**
- **Datos en cache:**
  - Clasificaciones ya cargadas
  - Información personal del usuario
  - Partidos y calendario
  - Configuraciones básicas

- **Sincronización:**
  - Sync automático al recuperar conexión
  - Indicadores visuales de estado offline/online
  - Cola de acciones pendientes

### **6.3 Notificaciones Nativas**
- **Push notifications** del sistema operativo
- **Badges** en icono de aplicación
- **Sonidos y vibraciones** configurables
- **Integración con calendario** del dispositivo

### **6.4 Rendimiento**
- **Carga rápida** con service workers
- **Lazy loading** de componentes no críticos
- **Optimización de imágenes** y recursos
- **Cache estratégico** para mejor UX

---

## 🎨 **7. DISEÑO Y EXPERIENCIA DE USUARIO**

### **7.1 Paleta de Colores (Beer Team)**
- **Colores primarios:**
  - Rojo: #DC143C (elemento principal del logo)
  - Dorado/Amarillo: #FFD700 (acentos y destacados)
  
- **Colores secundarios:**
  - Negro: #000000 (texto y contornos)
  - Crema/Beige: #FFF8DC (fondos alternativos)
  
- **Colores de estado:**
  - Éxito: Verde derivado de la paleta
  - Advertencia: Naranja dorado
  - Error: Rojo más intenso
  - Información: Azul complementario

### **7.2 Estilo Visual**
- **Temática:** Moderna con elementos vintage/retro (inspirada en el logo)
- **Tipografía:** 
  - Fuentes que combinen legibilidad moderna con carácter
  - Jerarquía clara para títulos, subtítulos y texto
  - Fuentes web optimizadas para rendimiento

- **Iconografía:**
  - Iconos consistentes con temática de dardos
  - Estilo outline/filled coherente
  - Tamaños estandarizados para responsive

### **7.3 Componentes UI**
- **Tarjetas informativas:** Bordes dorados para contenido importante
- **Botones de acción:** Gradientes rojo-dorado con hover effects
- **Tablas de clasificación:** Alternancia de colores, highlighting del usuario actual
- **Formularios:** Estilo moderno con validación visual clara
- **Notificaciones:** Toast messages con la paleta de colores
- **Loading states:** Spinners y skeletons con branding coherente

### **7.4 Responsive Design**
- **Mobile-first approach**
- **Breakpoints estándar:** Mobile (320px+), Tablet (768px+), Desktop (1024px+)
- **Navegación adaptativa:** Menu hamburguesa en móvil, sidebar en desktop
- **Touch-friendly:** Botones y enlaces optimizados para touch
- **Performance móvil:** Optimización específica para conexiones lentas

---

## 🔄 **8. MULTI-LIGA Y MULTI-TEMPORADA**

### **8.1 Participación Múltiple**
- **Un usuario puede:**
  - Participar en múltiples ligas simultáneamente
  - Tener diferentes roles en diferentes ligas
  - Mantener estadísticas separadas por liga

### **8.2 Sistema de Temporadas**
- **Gestión temporal:**
  - Temporadas con fechas definidas
  - Archivado automático de temporadas finalizadas
  - Creación de nuevas temporadas basadas en anteriores

### **8.3 Acceso Histórico**
- **Desde cualquier dashboard:**
  - Búsqueda y filtrado de datos históricos
  - Comparativas entre temporadas
  - Evolución temporal de estadísticas
  - Exportación de datos históricos

---

## 🔐 **9. INSCRIPCIÓN PÚBLICA**

### **9.1 Página de Inscripción por Enlace**
- **Acceso directo:** Via enlace personalizado sin login previo
- **Información mostrada:**
  - Nombre y descripción de la liga
  - Tipo de competición y reglas detalladas
  - Fechas de inicio/fin y periodo de inscripción
  - Modalidad (individual/parejas) y formato de competición
  - Plazas disponibles (si hay límite establecido)
  - Sistema de puntuación utilizado

### **9.2 Proceso de Inscripción Simplificado**
- **Formulario público:**
  - Datos mínimos requeridos (nombre, email)
  - Selección de modalidad si la liga es mixta
  - Información de contacto adicional (opcional)
  - Aceptación de términos y condiciones

- **Registro automático:**
  - Creación de cuenta si el usuario no existe
  - Envío de credenciales por email
  - Inscripción automática a la liga
  - Confirmación de inscripción exitosa

---

## ✅ **10. CRITERIOS DE ACEPTACIÓN**

### **10.1 Funcionalidad Core**
- ✅ Sistema de autenticación seguro
- ✅ Creación y gestión completa de ligas
- ✅ Inscripción via enlaces personalizados
- ✅ Registro y seguimiento de partidos
- ✅ Clasificaciones en tiempo real
- ✅ Dashboards funcionales para ambos roles

### **10.2 PWA Requirements**
- ✅ Instalable en dispositivos
- ✅ Funcionalidad offline básica
- ✅ Notificaciones push operativas
- ✅ Rendimiento optimizado

### **10.3 UX/UI Requirements**
- ✅ Completamente responsive
- ✅ Diseño coherente con branding Beer Team
- ✅ Navegación intuitiva
- ✅ Tiempos de carga < 3 segundos
- ✅ Accesibilidad básica (WCAG 2.1 AA)

### **10.4 Escalabilidad**
- ✅ Soporte para múltiples ligas simultáneas
- ✅ Sistema de temporadas robusto
- ✅ Base de datos optimizada para crecimiento
- ✅ API preparada para expansiones futuras

---

## 🚀 **Fases de Desarrollo**

### **Fase 1 - MVP Core**
- Sistema de autenticación
- Gestión básica de ligas (501 y Cricket)
- Inscripción via enlaces
- Dashboard básico
- Registro de resultados

### **Fase 2 - Features Avanzadas**
- Sistema de notificaciones completo
- PWA completa con offline
- Estadísticas detalladas
- Multi-temporada

### **Fase 3 - Optimización**
- UX/UI pulido con branding completo
- Performance optimization
- Características adicionales según feedback

---

**Documento creado:** `requisitos-funcionales.md`  
**Versión:** 1.0  
**Fecha:** Diciembre 2024  
**Proyecto:** Beer Team Darts League Manager 