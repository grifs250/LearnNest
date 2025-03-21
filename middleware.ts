import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';

/**
 * This middleware handles authentication using Clerk.
 * It protects all routes except those explicitly marked as public.
 */
export default clerkMiddleware((auth, req) => {
  // Define public routes that don't require authentication
  const isPublicRoute = createRouteMatcher([
    '/',                    // Landing page
    '/login(.*)',           // Login page
    '/register(.*)',        // Registration page
    '/verify-code(.*)',     // Email verification code page
    '/verify-email(.*)',    // Email verification page
    '/profile/setup(.*)',   // Profile setup page
    '/api/webhooks(.*)',    // Webhook endpoints
    '/buj(.*)',             // FAQ page
    '/profiles/(.*)',       // Public profiles
    '/subjects/(.*)'        // Public subject listings
  ]);
  
  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    auth.protect();
  }
  
  // Note: For Supabase JWT token handling, we've moved that to the 
  // lib/supabase/client.ts file which creates clients with the
  // appropriate Clerk JWT when needed.
});

export const config = {
  matcher: [
    // Skip all static files
    '/((?!_next|static|api|.*\\..*).*)',
    // Include all API routes
    '/api/(.*)'
  ],
}; 