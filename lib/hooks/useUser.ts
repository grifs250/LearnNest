import { useUser as useClerkUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import type { Profile } from '@/types/supabase.types';

export function useUser() {
  const { user: clerkUser, isLoaded: isClerkLoaded } = useClerkUser();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!clerkUser) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', clerkUser.id)
        .single();

      if (!error && data) {
        setProfile(data);
      }
      setIsLoading(false);
    };

    fetchProfile();
  }, [clerkUser]);

  return {
    user: clerkUser,
    profile,
    isLoaded: isClerkLoaded && !isLoading
  };
} 