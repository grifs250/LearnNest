import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getAuth } from 'firebase-admin/auth';
import { initializeApp, getApps } from 'firebase-admin/app';

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  initializeApp();
}

const auth = getAuth();

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session')?.value || '';
  const path = request.nextUrl.pathname;

  // Public paths that don't require auth
  const publicPaths = ['/auth', '/verify-email', '/', '/api/auth', '/lessons'];
  
  if (publicPaths.some(p => path.startsWith(p))) {
    return NextResponse.next();
  }

  try {
    if (!token) throw new Error('No token');
    await auth.verifySessionCookie(token, true);
    return NextResponse.next();
  } catch (error) {
    const redirectUrl = new URL('/auth/login', request.url);
    redirectUrl.searchParams.set('redirect', path);
    return NextResponse.redirect(redirectUrl);
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/lessons/book/:path*',
  ]
}; 