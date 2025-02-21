"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useSupabase } from '@/lib/supabase';
import { useToast } from '@/features/shared/hooks/useToast';

export function EmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { error, success } = useToast();
  const [loading, setLoading] = useState(true);
  const { user } = useSupabase();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const redirect = searchParams.get('redirect');

    async function verifyEmail() {
      if (mode === 'verifyEmail' && oobCode) {
        try {
          success('E-pasts veiksmīgi apstiprināts!');

          if (redirect === 'profile') {
            router.push('/profile');
          } else {
            router.push('/auth?mode=login&verified=true');
          }
        } catch (err) {
          console.error('Verification error:', err);
          error('Verifikācijas kļūda. Lūdzu mēģiniet vēlreiz.');
          router.push('/auth?mode=login&error=verification-failed');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/auth?mode=login');
      }
    }

    verifyEmail();
  }, [searchParams, router, success, error]);

  if (!loading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-lg">E-pasts tiek apstiprināts...</p>
      </div>
    </div>
  );
} 