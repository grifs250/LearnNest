import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define protected routes that require authentication
const PROTECTED_ROUTES = [
  '/profile',
  '/dashboard',
  '/lessons/meet',
];

// Define public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/register',
  '/verify-email',
  '/callback',
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
];

// Define auth routes that don't need category fetching
const AUTH_ROUTES = ['/login', '/register', '/verify-email', '/callback'];

export async function middleware(req: NextRequest) {
  // Skip middleware for static assets and public routes
  if (req.nextUrl.pathname.startsWith('/_next') || 
      req.nextUrl.pathname.startsWith('/static') ||
      req.nextUrl.pathname === '/favicon.ico') {
    return NextResponse.next();
  }

  // Create response and Supabase client
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    // Get session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) throw sessionError;

    // Only redirect auth routes if user is logged in
    if (session && AUTH_ROUTES.includes(req.nextUrl.pathname)) {
      return NextResponse.redirect(new URL('/profile', req.url));
    }

    // For protected routes, ensure user is authenticated
    if (PROTECTED_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
      if (!session) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.search = req.nextUrl.search;
        return NextResponse.redirect(loginUrl);
      }
    }

    // Handle profile routes
    if (req.nextUrl.pathname.startsWith('/profile')) {
      if (!session) {
        const loginUrl = new URL('/login', req.url);
        loginUrl.search = req.nextUrl.search;
        return NextResponse.redirect(loginUrl);
      }

      // Skip profile check for setup route
      if (req.nextUrl.pathname !== '/profile/setup') {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', session.user.id)
          .single();

        if (profileError || !profile) {
          return NextResponse.redirect(new URL('/profile/setup', req.url));
        }
      }
    }

    // For all other routes, proceed normally
    return res;

  } catch (error) {
    console.error('Middleware error:', error);
    if (PROTECTED_ROUTES.some(route => req.nextUrl.pathname.startsWith(route))) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.search = req.nextUrl.search;
      return NextResponse.redirect(loginUrl);
    }
    return res;
  }
}

// Configure which routes use this middleware
export const config = {
  matcher: [
    '/profile/:path*',
    '/dashboard/:path*',
    '/lessons/meet/:path*',
    '/login',
    '/register',
    '/verify-email',
    '/callback'
  ]
}; 