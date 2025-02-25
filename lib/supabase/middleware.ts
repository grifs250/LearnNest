import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { type SupabaseClient } from '@supabase/supabase-js';
import { type NextRequest, NextResponse } from 'next/server';
import type { Database } from '@/types/supabase.types';

export const createMiddlewareClient = (
  request: NextRequest,
  response: NextResponse
): SupabaseClient<Database> => {
  let newResponse = response;
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          const cookie = request.cookies.get(name);
          console.log(`Getting cookie ${name}:`, cookie?.value);
          return cookie?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          console.log(`Setting cookie ${name}:`, value);
          request.cookies.set({
            name,
            value,
            ...options,
          });
          newResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          newResponse.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name: string, options: CookieOptions) {
          console.log(`Removing cookie ${name}`);
          request.cookies.delete(name);
          newResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          newResponse.cookies.delete(name);
        },
      },
    }
  );
};

export async function middleware(req: NextRequest) {
  console.log('Middleware - Starting execution');

  // Log all cookies for debugging
  console.log('Middleware - All Cookies:', req.cookies.getAll());

  const res = NextResponse.next();
  const supabase = createMiddlewareClient(req, res);

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    console.log('Middleware - Session Details:', {
      exists: !!session,
      userId: session?.user?.id,
      email: session?.user?.email,
      role: session?.user?.user_metadata?.role,
      authenticated: !!session,
      error: error?.message
    });

    // Log request details
    console.log('Middleware - Request Details:', {
      url: req.url,
      method: req.method,
      pathname: new URL(req.url).pathname
    });

    if (error) {
      console.error('Middleware - Auth Error:', {
        message: error.message,
        status: error.status,
        name: error.name
      });
    }

    // Return the response with the session status
    const response = NextResponse.next();
    response.headers.set('x-session-status', session ? 'authenticated' : 'unauthenticated');
    return response;

  } catch (error) {
    console.error('Middleware - Unexpected Error:', error);
    return res;
  }
} 