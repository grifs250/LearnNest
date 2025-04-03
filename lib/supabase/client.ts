'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/types';
import { useAuth } from '@clerk/nextjs';

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

/**
 * Creates a Supabase client with the current user's JWT token
 * Use this in client components when you need to access data protected by RLS
 */
export function useSupabaseClient() {
  const { getToken } = useAuth();
  
  const getClientWithToken = async () => {
    try {
      // Get the JWT token from Clerk
      const token = await getToken();
      
      if (!token) {
        console.error("No JWT token available from Clerk");
        return createClient(); // Fallback to anon client
      }
      
      // Create a new Supabase client with the token
      return createSupabaseClient<Database>(
        supabaseUrl,
        supabaseAnonKey,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          },
          auth: {
            persistSession: false,
            autoRefreshToken: false
          }
        }
      );
    } catch (error) {
      console.error("Error getting authenticated Supabase client:", error);
      return createClient(); // Fallback to anon client
    }
  };
  
  return { getClientWithToken };
}

/**
 * Creates a fresh Supabase client with a new token
 * Use this to avoid JWT expired errors during longer operations
 */
export async function createFreshClient() {
  try {
    // Get access to Clerk's getToken function
    const { getToken } = useAuth();
    
    // Get a fresh token
    const token = await getToken();
    
    if (!token) {
      console.error("No JWT token available from Clerk");
      return createClient(); // Fallback to anon client
    }
    
    // Create a new Supabase client with the fresh token
    return createSupabaseClient<Database>(
      supabaseUrl,
      supabaseAnonKey,
      {
        global: {
          headers: {
            Authorization: `Bearer ${token}`
          }
        },
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    );
  } catch (error) {
    console.error("Error creating fresh Supabase client:", error);
    return createClient(); // Fallback to anon client
  }
}

// Export the default client
export default supabase; 