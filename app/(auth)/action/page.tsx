"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { FirebaseError } from "firebase/app";
import { doc, updateDoc } from "firebase/firestore";
import { Suspense } from "react";

function ActionContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');
    const redirect = searchParams.get('redirect');

    async function verifyEmail() {
      if (mode === 'verifyEmail' && oobCode) {
        try {
          // Verify the email
          await applyActionCode(auth, oobCode);

          // Update Firestore if user is authenticated
          if (auth.currentUser) {
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              emailVerified: true,
              status: 'active',
              verifiedAt: new Date()
            });
          }

          // Force reload user
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

export default function ActionPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ActionContent />
    </Suspense>
  );
} 