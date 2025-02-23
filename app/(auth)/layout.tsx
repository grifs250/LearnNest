"use client";

import { supabase } from '@/lib/supabase/db';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.push('/profile');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router]);

  // Check for any route references using courseId

  return children;
} 