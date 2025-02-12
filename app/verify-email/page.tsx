"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebaseClient";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, sendEmailVerification } from "firebase/auth";
import { updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { FirebaseError } from "firebase/app";

export default function VerifyEmailPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(0);
  const router = useRouter();

  useEffect(() => {
    let unsubscribe: any;
    let interval: NodeJS.Timeout;

    // Function to check email verification status
    const checkVerification = async () => {
      if (auth.currentUser) {
        try {
          await auth.currentUser.reload();
          if (auth.currentUser.emailVerified) {
            // Update the user document
            await updateDoc(doc(db, "users", auth.currentUser.uid), {
              emailVerified: true
            });
            clearInterval(interval);
            router.push("/profile");
          }
        } catch (error) {
          console.error("Error checking verification:", error);
        }
      }
    };

    // Set up auth state listener
    unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/auth?mode=login");
        return;
      }

      if (user.emailVerified) {
        router.push("/profile");
        return;
      }

      setLoading(false);
      
      // Check verification status every 3 seconds
      interval = setInterval(checkVerification, 3000);
    });

    return () => {
      unsubscribe?.();
      if (interval) clearInterval(interval);
    };
  }, [router]);

  // Add cooldown timer
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendVerification = async () => {
    try {
      if (cooldown > 0) {
        setError(`Lūdzu uzgaidiet ${cooldown} sekundes pirms mēģināt vēlreiz`);
        return;
      }

      if (auth.currentUser) {
        await sendEmailVerification(auth.currentUser, {
          url: `${window.location.origin}/profile`,
        });
        
        // Set 60 second cooldown
        setCooldown(60);
        setError(null);
        alert("Verifikācijas e-pasts nosūtīts!");
      }
    } catch (err: any) {
      if ((err as FirebaseError).code === 'auth/too-many-requests') {
        setError("Pārāk daudz mēģinājumu. Lūdzu uzgaidiet dažas minūtes.");
        setCooldown(300); // 5 minute cooldown on Firebase error
      } else {
        setError(err.message);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl max-w-md w-full p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Apstipriniet savu e-pastu
        </h1>
        
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <svg className="w-16 h-16 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
            </svg>
          </div>

          <p className="text-lg">
            Mēs nosūtījām verifikācijas e-pastu uz <strong>{auth.currentUser?.email}</strong>
          </p>

          <p className="text-gray-600">
            Lūdzu pārbaudiet savu e-pastu (arī mēstuļu mapi) un sekojiet norādēm, 
            lai apstiprinātu savu kontu.
          </p>

          {error && (
            <div className="alert alert-error">
              <span>{error}</span>
            </div>
          )}

          <div className="divider">vai</div>

          <button 
            onClick={handleResendVerification}
            disabled={cooldown > 0}
            className="btn btn-primary w-full"
          >
            {cooldown > 0 
              ? `Uzgaidiet ${cooldown} sekundes` 
              : "Nosūtīt jaunu verifikācijas e-pastu"}
          </button>

          <div className="mt-6 text-sm text-gray-500">
            <p>Pēc e-pasta apstiprināšanas jūs tiksiet automātiski novirzīts uz savu profilu.</p>
            <p className="mt-2">
              Problēmas ar verifikāciju? 
              <button 
                onClick={() => router.push('/auth?mode=login')}
                className="text-primary hover:underline ml-1"
              >
                Atgriezties pie pieslēgšanās
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 