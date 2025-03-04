'use server';

import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { createClient as supabaseCreateClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a Supabase client for server components
 * This client automatically handles cookies for auth
 */
export async function createServerSupabaseClient() {
  return createServerClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      cookies: {
        get: async (name: string) => {
          const cookieStore = await cookies();
          return cookieStore.get(name)?.value;
        },
        set: async (name: string, value: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({ name, value, ...options });
        },
        remove: async (name: string, options: CookieOptions) => {
          const cookieStore = await cookies();
          cookieStore.set({ name, value: '', ...options });
        },
      },
    }
  );
}

/**
 * Create a standard Supabase client
 */
export async function createClient() {
  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client with Clerk token
 */
export async function createClerkSupabaseClient(clerkToken?: string) {
  if (clerkToken) {
    return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`
        }
      }
    });
  }
  
  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase admin client with service role key
 */
export async function createSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return supabaseCreateClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Execute a query with admin privileges
 */
export async function adminQuery<T extends keyof Database['public']['Tables']>(
  table: T
) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.from(table);
}

/**
 * Get a storage client with admin privileges
 */
export async function adminStorage(bucket: string) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.storage.from(bucket);
}

/**
 * Get a public URL for a file in storage
 */
export async function getPublicUrl(bucket: string, path: string) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.storage.from(bucket).getPublicUrl(path);
}

/**
 * Legacy admin functions for migration scripts
 */
export async function getSupabaseAdmin() {
  const admin = await createSupabaseAdmin();
  return {
    from: async <T extends keyof Database['public']['Tables']>(table: T) => {
      return admin.from(table);
    }
  };
} 