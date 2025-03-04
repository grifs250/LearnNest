import { createSupabaseAdmin, adminQuery, adminStorage, getPublicUrl } from './server';
import type { Database } from '@/types/database';
import { createClient } from '@supabase/supabase-js';
import { supabaseConfig } from './config';

// Compatibility layer for code using the old supabaseAdmin approach
export const supabaseAdmin = {
  from: async <T extends keyof Database['public']['Tables']>(table: T) => {
    return adminQuery(table);
  },
  storage: {
    from: (bucket: string) => {
      return {
        upload: async (path: string, data: any) => {
          const storage = await adminStorage(bucket);
          return storage.upload(path, data);
        },
        download: async (path: string) => {
          const storage = await adminStorage(bucket);
          return storage.download(path);
        },
        getPublicUrl: async (path: string) => {
          return getPublicUrl(bucket, path);
        }
      };
    }
  }
};

// Direct access to the admin client for more complex operations
export async function getAdminClient() {
  return createSupabaseAdmin();
}

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