import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

// Stop Middleware running on static files
export const config = {
  matcher: [
    "/",
    "/login",
    "/register",
    "/buj",
    "/api/webhooks(.*)",
    "/lessons(.*)",
    "/(api|trpc)(.*)"
  ]
}; 