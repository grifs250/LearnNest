"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { LoadingSpinner } from '@/features/shared/components/ui/LoadingSpinner';
import { Session } from '@supabase/supabase-js';

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isChecking, setIsChecking] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error || !session) {
          router.replace('/login');
          return;
        }
        setIsChecking(false);
      } catch (error) {
        console.error('Session check error:', error);
        router.replace('/login');
      }
    };

    checkSession();
  }, [router, supabase]);

  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return <>{children}</>;
} 