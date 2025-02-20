"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from '@/shared/hooks/useToast';

export function EmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showError, showSuccess } = useToast();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const redirect = searchParams.get('redirect');

    async function verifyEmail() {
      if (mode === 'verifyEmail' && oobCode) {
        try {
          await applyActionCode(auth, oobCode);
          
          if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              emailVerified: true,
              status: 'active',
              verifiedAt: new Date()
            });
          }

          await auth.currentUser?.reload();
          showSuccess('E-pasts veiksmīgi apstiprināts!');

          if (redirect === 'profile') {
            router.push('/profile');
          } else {
            router.push('/auth?mode=login&verified=true');
          }
        } catch (err) {
          console.error('Verification error:', err);
          showError('Verifikācijas kļūda. Lūdzu mēģiniet vēlreiz.');
          router.push('/auth?mode=login&error=verification-failed');
        } finally {
          setLoading(false);
        }
      } else {
        router.push('/auth?mode=login');
      }
    }

    verifyEmail();
  }, [searchParams, router, showSuccess, showError]);

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