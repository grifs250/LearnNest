'use client';

import { createClient } from '@supabase/supabase-js';
import { useSession } from '@clerk/nextjs';
import type { Database } from '@/types/supabase.types';

export function createClerkSupabaseClient() {
  const { session } = useSession();

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      global: {
        headers: {
          Authorization: `Bearer ${session?.getToken({ template: 'supabase' })}`,
        },
      },
    }
  );
} 