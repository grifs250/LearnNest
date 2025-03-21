'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database';

// Get environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

/**
 * Default Supabase client for client components
 */
const supabase = createClientComponentClient<Database>();

/**
 * Create a Supabase client for client-side components
 */
export function createClient() {
  return createClientComponentClient<Database>();
}

/**
 * Legacy function name for backward compatibility
 */
export function createBrowserClient() {
  return createClientComponentClient<Database>();
}

/**
 * Create a client with a Clerk JWT token (client-side)
 * Used when working with Clerk authentication and Supabase storage
 */
export function createClientWithToken(token: string) {
  return createSupabaseClient<Database>(
    supabaseUrl,
    supabaseAnonKey,
    {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    }
  );
}

// Export the default client
export default supabase; 