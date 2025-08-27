// middleware.ts
import { auth } from '@/lib/auth';
import { publicRoutes, authRoutes, defaultRedirect, publicApiRoutes } from '@/constants/routes';
import type { NextRequest } from 'next/server';
import type { Session } from 'next-auth';
import { NextResponse } from 'next/server';

export default auth((req: NextRequest & { auth: Session | null }) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth;
  const path = nextUrl.pathname;

  // ✅ Archivos que SIEMPRE deben ser públicos (SEO, estáticos)
  const alwaysPublicPaths = [
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico',
    '/manifest.json',
    '/_next/',
    '/images/',
    '/assets/',
    '/icons/',
  ];

  // ✅ Verificar si es archivo estático o SEO
  const isStaticFile = alwaysPublicPaths.some(
    (publicPath) => path === publicPath || path.startsWith(publicPath)
  );

  if (isStaticFile) {
    return NextResponse.next();
  }

  // ✅ Verificar si es API pública
  const isPublicApi = publicApiRoutes.some((apiRoute) => path.startsWith(apiRoute));

  if (isPublicApi) {
    return NextResponse.next(); // Permitir acceso a API pública
  }

  // ✅ Si es API privada (cualquier /api/ que no sea pública)
  if (path.startsWith('/api/')) {
    if (!isLoggedIn) {
      // Retornar 401 Unauthorized para APIs privadas
      return new NextResponse(
        JSON.stringify({
          error: 'Authentication required',
          message: 'You must be logged in to access this API endpoint',
        }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
    return NextResponse.next(); // Usuario autenticado, permitir API privada
  }

  // ✅ Manejo de rutas web (páginas)
  // Si ya está logueado y va a rutas de auth, redirigir al dashboard
  if (authRoutes.includes(path) && isLoggedIn) {
    return NextResponse.redirect(new URL(defaultRedirect, nextUrl));
  }

  // ✅ Si NO está logueado e intenta entrar a rutas privadas → /sign-in
  const isPublicRoute = publicRoutes.includes(path) || authRoutes.includes(path);
  if (!isPublicRoute && !isLoggedIn) {
    const signInUrl = new URL('/sign-in', nextUrl);
    signInUrl.searchParams.set('callbackUrl', path);
    return NextResponse.redirect(signInUrl);
  }

  return NextResponse.next();
});

export const config = {
  // ✅ Incluir APIs en el matcher para poder protegerlas
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml (SEO files)
     */
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};
