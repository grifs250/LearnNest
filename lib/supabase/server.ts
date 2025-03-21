'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/types/database';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

/**
 * Create a server component client
 */
export async function createServerClient() {
  const cookieStore = cookies();
  return createServerComponentClient<Database>({
    cookies: () => cookieStore,
  });
}

/**
 * Create a server action client
 */
export async function createActionClient() {
  const cookieStore = cookies();
  return createServerActionClient<Database>({
    cookies: () => cookieStore,
  });
}

/**
 * Create an admin client (bypasses RLS)
 */
export async function createAdminClient() {
  return createClient<Database>(
    supabaseUrl,
    supabaseServiceKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  );
}

/**
 * Create a client with a Clerk JWT token
 */
export async function createClientWithToken(token: string) {
  return createClient<Database>(
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
 * Get a profile by user ID
 */
export async function getProfileByUserId(userId: string) {
  const supabase = await createAdminClient();
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  
  return data;
} 