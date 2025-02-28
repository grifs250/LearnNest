'use client';

import { useEffect, useState } from 'react';
import { createClerkSupabaseClient } from '@/lib/supabase/client';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';

export function useClerkSupabase() {
  const { user, isLoaded } = useUser();
  const [isInitialized, setIsInitialized] = useState(false);
  const supabase = createClerkSupabaseClient();

  useEffect(() => {
    if (!isLoaded) return;

    const initializeProfile = async () => {
      if (!user) return;

      try {
        // Check if profile exists
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        // If no profile exists, create one
        if (!profile) {
          await supabase.from('profiles').insert({
            id: user.id,
            full_name: user.fullName,
            email: user.emailAddresses[0].emailAddress,
            role: user.publicMetadata.role || 'student',
            created_at: new Date().toISOString(),
          });
        }
      } catch (error) {
        console.error('Error initializing profile:', error);
        toast.error('Error initializing profile');
      } finally {
        setIsInitialized(true);
      }
    };

    initializeProfile();
  }, [user, isLoaded, supabase]);

  return {
    supabase,
    isInitialized,
    isLoading: !isLoaded || !isInitialized,
  };
} 