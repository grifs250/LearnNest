import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase.types';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { auth } from '@clerk/nextjs/server';

// Create cookie handlers for server-side Supabase client
const cookieStore = {
  get(name: string) {
    try {
      return (cookies() as unknown as RequestCookies).get(name)?.value;
    } catch (error) {
      console.error('Error getting cookie:', error);
      return undefined;
    }
  },
  set(name: string, value: string, options: CookieOptions) {
    try {
      (cookies() as unknown as RequestCookies).set({
        name,
        value,
        ...options
      });
    } catch (error) {
      console.error('Error setting cookie:', error);
    }
  },
  remove(name: string, options: CookieOptions) {
    try {
      (cookies() as unknown as RequestCookies).delete(name);
    } catch (error) {
      console.error('Error removing cookie:', error);
    }
  },
};

// Create a server-side Supabase client with cookie handling
export const createServerSupabaseClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: cookieStore,
    }
  );
};

// Create a singleton instance for server-side usage
export const supabase = createServerSupabaseClient();

// Create an admin client for background tasks
export const supabaseAdmin = createSupabaseClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Create a Clerk-authenticated Supabase client
export async function createClerkSupabaseClient() {
  const { getToken } = await auth();
  const token = await getToken({ template: 'supabase' });

  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    }
  );
} 