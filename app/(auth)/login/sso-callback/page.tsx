'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

// This component uses useSearchParams, so it needs to be wrapped in Suspense
function SSOCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const code = searchParams.get('code');

  useEffect(() => {
    const handleCallback = async () => {
      if (code) {
        const supabase = createClient();
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        
        if (!error) {
          router.push('/'); // Redirect to home page after successful login
        } else {
          console.error('SSO error:', error);
          router.push('/login?error=sso-failed');
        }
      }
    };

    handleCallback();
  }, [code, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg"></div>
        <p className="mt-4">Notiek autentifikācija...</p>
      </div>
    </div>
  );
}

// Main page component that wraps the content in a Suspense boundary
export default function SSOCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="loading loading-spinner loading-lg"></div>
          <p className="mt-4">Ielādē...</p>
        </div>
      </div>
    }>
      <SSOCallbackContent />
    </Suspense>
  );
} 