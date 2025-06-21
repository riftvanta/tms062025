import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyToken } from '@/lib/auth';

// Define protected routes
const protectedRoutes = ['/admin', '/exchange', '/dashboard'];
const adminOnlyRoutes = ['/admin'];
const exchangeOnlyRoutes = ['/exchange'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Check if the route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Get the auth token from cookies
  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    // No token, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // Verify the token
    const authData = verifyToken(token);
    
    if (!authData) {
      // Invalid token, redirect to login
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Check role-based access
    const isAdminRoute = adminOnlyRoutes.some(route => 
      pathname.startsWith(route)
    );
    const isExchangeRoute = exchangeOnlyRoutes.some(route => 
      pathname.startsWith(route)
    );

    if (isAdminRoute && authData.role !== 'admin') {
      // Admin route but user is not admin
      if (authData.role === 'exchange') {
        return NextResponse.redirect(new URL('/exchange', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    if (isExchangeRoute && authData.role !== 'exchange') {
      // Exchange route but user is not exchange
      if (authData.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      }
      return NextResponse.redirect(new URL('/login', request.url));
    }

    // Handle root dashboard redirect based on role
    if (pathname === '/dashboard') {
      if (authData.role === 'admin') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (authData.role === 'exchange') {
        return NextResponse.redirect(new URL('/exchange', request.url));
      }
    }

    // User is authenticated and has correct role
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware auth error:', error);
    // Token verification failed, redirect to login
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public|manifest.json).*)',
  ],
}; 