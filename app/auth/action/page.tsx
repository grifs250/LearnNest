"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { applyActionCode, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebaseClient";
import { FirebaseError } from "firebase/app";
import { doc, updateDoc } from "firebase/firestore";

export default function AuthActionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const mode = searchParams.get('mode');
    const oobCode = searchParams.get('oobCode');

    async function verifyEmail() {
      if (mode === 'verifyEmail' && oobCode) {
        try {
          // Sign out first to ensure clean state
          await signOut(auth);
          
          await applyActionCode(auth, oobCode);
          
          // After verification, redirect to login
          router.push('/auth?mode=login&verified=true');
        } catch (err: any) {
          console.error('Verification error:', err);
          router.push('/auth?mode=login');
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