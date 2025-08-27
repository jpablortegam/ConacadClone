// lib/routes.ts
export const publicRoutes = [
  '/',
  '/sign-in',
  '/sign-up',
  // ✅ Rutas SEO y archivos públicos
  '/robots.txt',
  '/sitemap.xml',
  '/favicon.ico',
  '/manifest.json',
  // ✅ Otras rutas públicas
  '/about',
  '/contact',
  '/terms',
  '/privacy',
];

export const authRoutes = ['/sign-in', '/sign-up'];
export const defaultRedirect = '/dashboard';

// ✅ APIs que SIEMPRE son públicas (no requieren auth)
export const publicApiRoutes = [
  '/api/auth/', // NextAuth.js (siempre público)
  '/api/avatars', // Avatares
];

// ✅ APIs que requieren autenticación (opcional, para documentación)
export const privateApiRoutes = [
  '/api/user/', // Datos del usuario
  '/api/dashboard/', // Datos del dashboard
  '/api/courses/', // Cursos del usuario
  '/api/payments/', // Información de pagos
  '/api/admin/', // APIs de administración
];
