import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase.types';
import { createClient } from '@supabase/supabase-js';
import { RequestCookies } from 'next/dist/server/web/spec-extension/cookies';
import { auth } from '@clerk/nextjs/server';

// Create a server-side Supabase client with cookie handling
export const createClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookieStore = cookies() as unknown as RequestCookies;
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.error('Error getting cookie:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = cookies() as unknown as RequestCookies;
            cookieStore.set({
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
            const cookieStore = cookies() as unknown as RequestCookies;
            cookieStore.delete(name);
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
};

// Create a singleton instance for server-side usage
export const supabase = createClient();

// Create a Supabase client for server-side operations
export const createServerSupabaseClient = () => {
  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          try {
            const cookieStore = cookies() as unknown as RequestCookies;
            return cookieStore.get(name)?.value;
          } catch (error) {
            console.error('Error getting cookie:', error);
            return undefined;
          }
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            const cookieStore = cookies() as unknown as RequestCookies;
            cookieStore.set({
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
            const cookieStore = cookies() as unknown as RequestCookies;
            cookieStore.delete(name);
          } catch (error) {
            console.error('Error removing cookie:', error);
          }
        },
      },
    }
  );
};

// Create an admin client for background tasks
export const supabaseAdmin = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function createClerkSupabaseServerClient() {
  const { getToken } = auth();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await getToken({
            template: 'supabase',
          });

          const headers = new Headers(options?.headers);
          headers.set('Authorization', `Bearer ${clerkToken}`);

          return fetch(url, {
            ...options,
            headers,
          });
        },
      },
    }
  );
} 