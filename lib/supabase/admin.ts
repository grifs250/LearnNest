import { createSupabaseAdmin, adminQuery, adminStorage, getPublicUrl } from './server';
import type { Database } from '@/types/database';

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