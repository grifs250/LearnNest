'use server';

import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

// Throw an error if the environment variables are not set
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

/**
 * Create a Supabase client for Server Components
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
 * Create a Supabase client for browser with Row Level Security
 */
export async function createClient() {
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client using Clerk JWT for authentication
 */
export async function createClerkSupabaseClient(clerkToken?: string) {
  if (clerkToken) {
    return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${clerkToken}`,
        },
      },
    });
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseAnonKey);
}

/**
 * Create a Supabase client with admin privileges
 */
export async function createSupabaseAdmin() {
  if (!supabaseServiceKey) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
  }
  
  return createSupabaseClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Execute a query with admin privileges
 */
export async function adminQuery(tableName: string) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.from(tableName);
}

/**
 * Get a storage client with admin privileges
 */
export async function adminStorage(bucketName: string) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.storage.from(bucketName);
}

/**
 * Get a public URL for a file in storage
 */
export async function getPublicUrl(bucketName: string, path: string) {
  const adminClient = await createSupabaseAdmin();
  return adminClient.storage.from(bucketName).getPublicUrl(path);
} 