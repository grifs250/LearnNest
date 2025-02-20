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
          return request.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
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