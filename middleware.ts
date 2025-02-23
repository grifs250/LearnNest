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
  '/about',
  '/contact',
  '/privacy-policy',
  '/terms-of-service',
];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Log cookies for debugging
  console.log('Cookies:', req.cookies);

  // Refresh session if expired
  const { data: { session } } = await supabase.auth.getSession();

  // If accessing a protected route and not authenticated
  if (req.nextUrl.pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  // If accessing login/register while authenticated
  if (req.nextUrl.pathname.startsWith('/login') || req.nextUrl.pathname.startsWith('/register')) {
    if (session) {
      return NextResponse.redirect(new URL('/profile', req.url));
    }
  }

  return res;
}

// Configure which routes use this middleware
export const config = {
  matcher: ['/profile/:path*', '/login', '/register']
}; 