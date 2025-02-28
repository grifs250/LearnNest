import { authMiddleware } from '@clerk/nextjs';

export default authMiddleware({
  // Public routes that don't require authentication
  publicRoutes: [
    "/",
    "/login",
    "/register",
    "/buj",
    "/api/webhooks(.*)",
    "/lessons(.*)"
  ],
  ignoredRoutes: [
    "/api/webhooks/clerk"
  ]
});

// Stop Middleware running on static files
export const config = {
  matcher: [
    "/((?!.+\\.[\\w]+$|_next).*)",
    "/",
    "/(api|trpc)(.*)"
  ]
}; 