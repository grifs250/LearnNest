import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import type { User } from '@supabase/supabase-js';

export const useSupabase = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    // Initialize auth state
    const initializeAuth = async () => {
      try {
        console.log('Initializing auth...');
        console.log('Fetching session...');
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        console.log('Session fetched:', session);
        console.log('User state after initialization:', user);
        console.log('Loading state:', loading);
      } catch (error) {
        console.error('Error initializing auth:', (error as any).message || error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN') {
        router.refresh();
        toast.success('Veiksmīgi pieslēdzies!');
      }
      if (event === 'SIGNED_OUT') {
        router.refresh();
        toast.success('Veiksmīgi atslēdzies!');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, router]);

  return { supabase, user, loading };
}; 