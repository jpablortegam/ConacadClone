# ConAcad - Sistema Escolar Interno

ConAcad es una plataforma educativa moderna desarrollada con Next.js 15, diseñada específicamente para instituciones educativas que necesitan un sistema interno robusto y escalable para la gestión de estudiantes, profesores y contenido académico.

## 🎯 Características Principales

### 🔐 Sistema de Autenticación Avanzado

- **Autenticación OAuth**: Integración con Google y GitHub
- **Gestión de Roles**: Sistema diferenciado para alumnos y profesores
- **Sesiones Seguras**: Implementado con NextAuth.js v5
- **Middleware de Protección**: Rutas protegidas automáticamente

### 👥 Gestión de Usuarios

- **Perfiles Dinámicos**: Sistema de perfiles con imágenes y información personalizada
- **Roles Diferenciados**: Dashboards específicos para cada tipo de usuario
- **Comunidad Interactiva**: Panel de burbujas con perfiles de usuarios activos
- **Servicio de Perfiles en Tiempo Real**: Cache inteligente y actualizaciones incrementales

### 🎨 Interfaz Moderna

- **Diseño Responsivo**: Optimizado para dispositivos móviles y desktop
- **Tema Oscuro/Claro**: Soporte completo para temas personalizables
- **Componentes UI**: Biblioteca completa basada en Shadcn UI y Tailwind CSS
- **Animaciones Fluidas**: Experiencia de usuario mejorada con Motion

### 🗄️ Base de Datos Robusta

- **PostgreSQL**: Base de datos relacional con Prisma ORM
- **Migraciones Automáticas**: Control de versiones de esquema
- **Contenedorización**: Docker Compose para desarrollo local
- **Panel de Administración**: Adminer incluido para gestión de BD

## 🛠️ Stack Tecnológico

### Frontend

- **Next.js 15**: Framework React con App Router
- **React 19**: Biblioteca de interfaz de usuario
- **TypeScript**: Tipado estático para mayor robustez
- **Tailwind CSS**: Framework de estilos utilitarios
- **Shadcn UI**: Componentes accesibles y personalizables
- **Lucide React**: Iconografía moderna y consistente

### Backend

- **Next.js API Routes**: Endpoints serverless
- **NextAuth.js 5**: Autenticación y autorización
- **Prisma**: ORM moderno para TypeScript
- **PostgreSQL**: Base de datos relacional
- **bcryptjs**: Encriptación de contraseñas

### Herramientas de Desarrollo

- **ESLint**: Linting de código
- **Prettier**: Formateo automático
- **TypeScript**: Verificación de tipos
- **Docker**: Contenedorización de servicios

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+
- Docker y Docker Compose
- Git

### 1. Clonar el Repositorio

```bash
git clone <url-del-repositorio>
cd conacad
```

### 2. Instalar Dependencias

```bash
npm install
# o
bun install
```

### 3. Configurar Variables de Entorno

Crea un archivo `.env` basado en el ejemplo proporcionado:

```env
# Configuración de Entorno
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=tu_clave_secreta_muy_segura

# Proveedores OAuth
AUTH_GITHUB_ID=tu_github_client_id
AUTH_GITHUB_SECRET=tu_github_client_secret
AUTH_GOOGLE_ID=tu_google_client_id
AUTH_GOOGLE_SECRET=tu_google_client_secret

# Base de Datos PostgreSQL
DATABASE_URL="postgresql://nextauth_user:nextauth_password@localhost:5432/nextauth_db"
DATABASE_HOST=localhost
DATABASE_NAME=nextauth_db
DATABASE_USER=nextauth_user
DATABASE_PASSWORD=nextauth_password
DATABASE_PORT=5432
```

### 4. Configurar Base de Datos

```bash
# Iniciar PostgreSQL con Docker
cd database
docker-compose up -d

# Ejecutar migraciones
npx prisma migrate dev
npx prisma generate
```

### 5. Iniciar el Servidor de Desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm run dev          # Servidor de desarrollo con Turbopack
npm run build        # Compilar para producción
npm run start        # Servidor de producción
npm run lint         # Ejecutar ESLint
npm run format       # Formatear código con Prettier

# Base de Datos
npx prisma studio    # Interfaz visual de BD
npx prisma migrate   # Ejecutar migraciones
npx prisma generate  # Generar cliente Prisma
```

## 🌐 Configuración de Proveedores OAuth

### Google OAuth

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita la API de Google+
4. Configura las credenciales OAuth 2.0
5. Añade `http://localhost:3000/api/auth/callback/google` como URI de redirección

### GitHub OAuth

1. Ve a GitHub Settings > Developer settings > OAuth Apps
2. Crea una nueva OAuth App
3. Configura la Authorization callback URL: `http://localhost:3000/api/auth/callback/github`

## 🎭 Roles y Permisos

### Alumno

- Dashboard personalizado con información académica
- Acceso a recursos educativos
- Perfil personalizable
- Participación en comunidad

### Profesor

- Dashboard con herramientas de gestión
- Administración de contenido
- Seguimiento de estudiantes
- Herramientas de evaluación

## 🔒 Seguridad

- **Autenticación JWT**: Tokens seguros con expiración
- **Middleware de Protección**: Verificación automática de rutas
- **Validación de Datos**: Esquemas Zod para entrada de datos
- **Encriptación**: Contraseñas hasheadas con bcrypt
- **Variables de Entorno**: Configuración sensible protegida

## 🚀 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio con Vercel
2. Configura las variables de entorno
3. Despliega automáticamente

### Docker

```bash
# Construir imagen
docker build -t conacad .

# Ejecutar contenedor
docker run -p 3000:3000 conacad
```

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

**ConAcad** - Transformando la educación con tecnología moderna 🎓
