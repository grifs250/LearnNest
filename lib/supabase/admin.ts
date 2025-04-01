import { createSupabaseAdmin } from './server';
import type { Database } from '@/lib/types';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Direct access to the admin client for more complex operations
export async function getAdminClient() {
  return createSupabaseAdmin();
}

/**
 * Helper for admin queries
 */
export async function adminQuery<T extends keyof Database['public']['Tables']>(table: T) {
  const admin = await createSupabaseAdmin();
  return admin.from(table);
}

/**
 * Helper for storage operations
 */
export async function adminStorage(bucket: string) {
  const admin = await createSupabaseAdmin();
  return admin.storage.from(bucket);
}

/**
 * Get public URL for storage item
 */
export async function getPublicUrl(bucket: string, path: string) {
  const admin = await createSupabaseAdmin();
  const { data } = admin.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

// Compatibility layer for code using the old supabaseAdmin approach
export const supabaseAdmin = {
  from: async <T extends keyof Database['public']['Tables']>(table: T) => {
    const admin = await createSupabaseAdmin();
    return admin.from(table);
  },
  storage: {
    from: (bucket: string) => {
      return {
        upload: async (path: string, data: any) => {
          const admin = await createSupabaseAdmin();
          return admin.storage.from(bucket).upload(path, data);
        },
        download: async (path: string) => {
          const admin = await createSupabaseAdmin();
          return admin.storage.from(bucket).download(path);
        },
        getPublicUrl: async (path: string) => {
          const admin = await createSupabaseAdmin();
          const { data } = admin.storage.from(bucket).getPublicUrl(path);
          return data.publicUrl;
        }
      };
    }
  }
};

/**
 * Create a Supabase admin client with service role key
 * WARNING: This should only be used on the server in controlled environments
 * Never expose the service role key to the client
 */
export function createSupabaseAdminClient() {
  const { url, serviceKey } = supabaseConfig;

  if (!url || !serviceKey) {
    throw new Error('Missing Supabase URL or service role key');
  }

  return createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
} 