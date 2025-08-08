// lib/routes.ts
export const publicRoutes = ['/', '/sign-in', '/sign-up']; // agrega las públicas de tu app
export const authRoutes = ['/sign-in', '/sign-up']; // páginas de auth
export const defaultRedirect = '/dashboard'; // adonde mandas tras login

// Si alguna vez decides incluir APIs en el middleware, puedes usar esto:
// export const apiAuthPrefix = '/api/auth';
