"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode } from "firebase/auth";
import { auth, db } from "@/lib/firebase/client";
import { doc, updateDoc } from "firebase/firestore";

export function EmailVerification() {
  const router = useRouter();
  const searchParams = useSearchParams();

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

          if (redirect === 'profile') {
            router.push('/profile');
          } else {
            router.push('/auth?mode=login&verified=true');
          }
        } catch (err) {
          console.error('Verification error:', err);
          router.push('/auth?mode=login&error=verification-failed');
        }
      } else {
        router.push('/auth?mode=login');
      }
    }

    verifyEmail();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="text-center">
        <div className="loading loading-spinner loading-lg mb-4"></div>
        <p className="text-lg">E-pasts tiek apstiprināts...</p>
      </div>
    </div>
  );
} 