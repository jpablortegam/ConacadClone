// middleware.ts
import { auth } from '@/lib/auth';
import { publicRoutes, authRoutes, defaultRedirect } from '@/constants/routes';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // 1) Si ya está logueado y va a rutas de auth, lo mandamos al dashboard
  if (authRoutes.includes(path) && isLoggedIn) {
    return Response.redirect(new URL(defaultRedirect, nextUrl));
  }

  // 2) Si NO está logueado e intenta entrar a rutas privadas → /sign-in
  const isPublic = publicRoutes.includes(path) || authRoutes.includes(path);
  if (!isPublic && !isLoggedIn) {
    return Response.redirect(new URL('/sign-in', nextUrl));
  }

  return null;
});

export const config = {
  // ✅ Excluye APIs y estáticos para no romper assets/SSR
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
