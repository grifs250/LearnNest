import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

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
    '/subjects/(.*)'        // Public subject listings
  ]);

  // If the route is not public, protect it
  if (!isPublicRoute(req)) {
    auth.protect();
  }
});

export const config = {
  matcher: [
    // Skip all static files
    '/((?!_next|static|api|.*\\..*).*)',
    // Include all API routes
    '/api/(.*)'
  ],
}; 