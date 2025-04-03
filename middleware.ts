import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Function to handle /profile redirects before Clerk middleware
function handleProfileRedirect(req: NextRequest) {
  const url = req.nextUrl;
  const path = url.pathname;

  // Handle redirects for /profile/[userId] pattern (but not /profile/setup)
  if (path.startsWith('/profile/') && path !== '/profile/setup' && !path.startsWith('/profile/setup/')) {
    const userId = path.split('/')[2];
    
    if (userId) {
      console.log(`🔄 Middleware redirecting: ${path} → /profiles/${userId}`);
      const redirectUrl = new URL(`/profiles/${userId}`, req.url);
      return NextResponse.redirect(redirectUrl);
    }
  }

  // Continue normal processing if no redirect needed
  return null;
}

/**
 * This middleware handles authentication using Clerk.
 * It protects all routes except those explicitly marked as public.
 */
export default clerkMiddleware((auth, req) => {
  // First check if we need to handle profile redirects
  const redirectResponse = handleProfileRedirect(req);
  if (redirectResponse) return redirectResponse;

  // Define public routes that don't require authentication
  const isPublicRoute = createRouteMatcher([
    '/',                    // Landing page
    '/login(.*)',           // Login page
    '/register(.*)',        // Registration page
    '/verify-code(.*)',     // Email verification code page
    '/verify-email(.*)',    // Email verification page
    '/profile/setup(.*)',   // Profile setup page
    '/profile-reset(.*)',   // Profile reset page
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