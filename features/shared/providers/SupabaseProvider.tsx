'use client';

import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import type { Database } from '@/types/supabase.types';

type Profile = Database['public']['Tables']['profiles']['Row'];

interface SupabaseContextType {
  user: any | null;
  profile: Profile | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}

const SupabaseContext = createContext<SupabaseContextType>({
  user: null,
  profile: null,
  isLoading: true,
  signOut: async () => {},
});

export const useSupabase = () => {
  const context = useContext(SupabaseContext);
  if (!context) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
};

export function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { user: clerkUser, isLoaded: isClerkLoaded } = useUser();
  
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  );

  useEffect(() => {
    const getUser = async () => {
      if (!isClerkLoaded) return;

      if (clerkUser) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', clerkUser.id)
            .single();

          if (error) {
            console.error('Error fetching profile:', error);
          } else if (data) {
            setProfile(data);
            setUser(clerkUser);
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        }
      } else {
        setUser(null);
        setProfile(null);
      }
      
      setIsLoading(false);
    };

    getUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event: string, session: any) => {
        router.refresh();
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClerkLoaded, clerkUser]);

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      router.refresh();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    profile,
    isLoading,
    signOut,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
} 