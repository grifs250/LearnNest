'use client';

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from '@clerk/nextjs';
import type { Database } from '@/lib/types';
import type { SupabaseClient } from '@supabase/supabase-js';

export function useClerkSupabase() {
  const { getToken, isLoaded } = useAuth();
  const [supabase, setSupabase] = useState<SupabaseClient<Database> | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!isLoaded) return;

    const initSupabase = async () => {
      const token = await getToken({ template: 'supabase' });
      const client = createBrowserClient<Database>(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
          global: {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        }
      );
      setSupabase(client);
      setIsInitialized(true);
    };

    initSupabase();
  }, [getToken, isLoaded]);

  return {
    supabase,
    isInitialized,
    isLoading: !isLoaded || !isInitialized
  };
} 