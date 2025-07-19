import { auth } from '@/lib/auth';
import { publicRoutes, authRoutes, apiAuthPrefix, defaultRedirect } from '@/lib/routes';

export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // 1) API routes
  if (path.startsWith(apiAuthPrefix)) {
    return null;
  }

  // 2) Auth routes + logueado = dashboard
  if (authRoutes.includes(path) && isLoggedIn) {
    return Response.redirect(new URL(defaultRedirect, nextUrl));
  }

  // 3) Rutas privadas + no logueado = auth/sign-in (NO sign-in)
  if (!publicRoutes.includes(path) && !authRoutes.includes(path) && !isLoggedIn) {
    return Response.redirect(new URL('/sign-in', nextUrl)); // ← Cambio aquí
  }

  return null;
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
