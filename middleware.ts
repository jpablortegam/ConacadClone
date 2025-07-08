import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { PUBLIC_ROUTES, LOGIN, ROOT } from '@/lib/routes';

export async function middleware(request: NextRequest) {
    const { nextUrl } = request;
    
    if (nextUrl.pathname.startsWith('/api/auth')) {
        return NextResponse.next();
    }
    
    const sessionCookie = request.cookies.get('next-auth.session-token');
    // console.log("Session cookie:", sessionCookie?.value ? 'Present' : 'Not found');
    // console.log("Pathname:", nextUrl.pathname);

    const isAuthenticated = !!sessionCookie?.value;
    const isPublicRoute = (PUBLIC_ROUTES.find(route => nextUrl.pathname.startsWith(route)) || nextUrl.pathname === ROOT);
    // console.log("Is authenticated:", isAuthenticated);
    // console.log("Is public route:", isPublicRoute);

    if (!isAuthenticated && !isPublicRoute) {
        console.log("Redirecting to login");
        return NextResponse.redirect(new URL(LOGIN, nextUrl));
    }
    
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Proteger rutas específicas
        "/dashboard/:path*",
        "/profile/:path*",
        "/settings/:path*",
        // Excluir archivos estáticos y APIs
        "/((?!api|_next/static|_next/image|favicon.ico).*)",
    ]
};