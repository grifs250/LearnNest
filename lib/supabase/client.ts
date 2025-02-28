'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/types/supabase.types';
import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';

export const createClient = () => {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
};

// Create a singleton instance for client-side usage
export const supabase = createClient();

export function createClerkSupabaseClient() {
  const { session } = useSession();

  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_KEY!,
    {
      global: {
        fetch: async (url, options = {}) => {
          const clerkToken = await session?.getToken({
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