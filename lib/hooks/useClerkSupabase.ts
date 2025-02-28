'use client';

import { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';

export function useClerkSupabase() {
  const { user, isLoaded } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClerkSupabaseClient();

  useEffect(() => {
    if (!isLoaded || !user) return;
    setIsInitialized(true);
  }, [user, isLoaded]);

  return {
    supabase,
    isInitialized,
    isLoading: !isLoaded || !isInitialized,
  };
} 