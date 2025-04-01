'use server';

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { Database } from '@/lib/types';

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
 * Create a Supabase admin client
 */
export async function createSupabaseAdmin() {
  return createAdminClient();
}

/**
 * Admin query function
 */
export async function adminQuery<T extends keyof Database['public']['Tables']>(table?: T) {
  const admin = await createAdminClient();
  return table ? admin.from(table) : admin.from;
}

/**
 * Admin storage function with proper return types
 */
export async function adminStorage(bucket?: string): Promise<{
  upload: (path: string, data: any) => Promise<any>;
  download: (path: string) => Promise<any>;
} | import('@supabase/supabase-js').SupabaseClient<Database>['storage']> {
  const admin = await createAdminClient();
  
  if (bucket) {
    return {
      upload: async (path: string, data: any) => {
        return admin.storage.from(bucket).upload(path, data);
      },
      download: async (path: string) => {
        return admin.storage.from(bucket).download(path);
      }
    };
  }
  
  return admin.storage;
}

/**
 * Get public URL for a storage file
 */
export async function getPublicUrl(bucket: string, path: string): Promise<string> {
  const admin = await createAdminClient();
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
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
 * Create a Supabase client for server components with Clerk auth
 * This is used for APIs and server actions that need to use Clerk auth
 */
export async function createClerkSupabaseClient() {
  // For server components, we use the admin client
  // In a real app, you would get the Clerk JWT and use it with Supabase
  // For simplicity, we're using the admin client here
  return createAdminClient();
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