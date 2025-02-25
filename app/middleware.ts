import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // Check for auth token in cookie
    const authToken = request.cookies.get('authToken')?.value;
    console.log("we got the auth token" + authToken)
    
    const currentPath = request.nextUrl.pathname;
    
    // Debug logging
    console.log('Middleware Check:', {
        path: currentPath,
        hasAuthToken: !!authToken,
        cookies: request.cookies.getAll().map(c => c.name)
    });

    // Protected routes that require authentication
    const protectedRoutes = ['/', '/sessions', '/professor', '/student','/config' ];
    const isProtectedRoute = protectedRoutes.some(route => currentPath.startsWith(route));

    // Auth pages (login, register, etc.)
    const authPages = ['/auth/login'];
    const isAuthPage = authPages.some(page => currentPath.startsWith(page));

    if (!authToken && isProtectedRoute) {
        console.log('No auth token - redirecting to /auth');
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (authToken && isAuthPage) {
        console.log('Has auth token on auth page - redirecting to /sessions');
        return NextResponse.redirect(new URL('/sessions', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};