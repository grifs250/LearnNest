"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeftIcon, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function VerifyCodePage() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();
  const [verificationCode, setVerificationCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  
  // Use transition for better rendering performance
  const [isPending, startTransition] = useTransition();
  
  // If no signUp object, redirect back to sign up
  useEffect(() => {
    if (isLoaded && !signUp?.emailAddress) {
      startTransition(() => {
        router.push("/register");
      });
    }
  }, [isLoaded, signUp, router, startTransition]);
  
  // Handle verification submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signUp) {
      return;
    }
    
    if (!verificationCode) {
      setError("Lūdzu, ievadiet verifikācijas kodu.");
      return;
    }
    
    setVerifying(true);
    setError("");
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });
      
      if (completeSignUp.status !== "complete") {
        setError("Verifikācija neizdevās. Lūdzu, pārbaudiet kodu un mēģiniet vēlreiz.");
      } else {
        setSuccess(true);
        
        // Set the user session as active
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect with a transition for better performance
        startTransition(() => {
          router.push("/");
        });
      }
    } catch (err: any) {
      console.error("Error verifying email:", err);
      
      if (err.errors && err.errors[0]?.message?.includes('incorrect')) {
        setError("Nepareizs verifikācijas kods. Lūdzu, pārbaudiet un mēģiniet vēlreiz.");
      } else if (err.errors && err.errors[0]?.message?.includes('expired')) {
        setError("Verifikācijas kods ir beidzies. Lūdzu, pieprasiet jaunu kodu.");
      } else {
        setError(err.message || "Verifikācijas kļūda. Lūdzu, mēģiniet vēlreiz.");
      }
    } finally {
      setVerifying(false);
    }
  };

  // Handle resending code
  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      return;
    }
    
    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      
      // Success message
      alert("Jauns verifikācijas kods nosūtīts uz jūsu e-pastu.");
    } catch (err: any) {
      console.error("Error resending code:", err);
      setError("Neizdevās nosūtīt jaunu kodu. Lūdzu, mēģiniet vēlreiz vēlāk.");
    } finally {
      setResending(false);
    }
  };

  // Handle digit input for code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setVerificationCode(value);
    }
  };

  // Show optimized loading state
  if (!isLoaded || isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
      <div className="max-w-md w-full mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-primary">MāciesTe</h1>
          <p className="text-base-content/70 mt-1">Jūsu mācību platforma</p>
        </div>

        {success ? (
          <div className="bg-base-100 p-8 rounded-xl shadow-lg text-center">
            <div className="mb-4 flex justify-center">
              <CheckCircle className="text-success w-16 h-16" />
            </div>
            <h2 className="text-xl font-bold mb-4">E-pasts veiksmīgi verificēts!</h2>
            <p className="mb-4">Jūs tiekat novirzīts uz sākumlapu...</p>
          </div>
        ) : (
          <div className="bg-base-100 p-6 rounded-xl shadow-lg">
            <div className="text-center mb-6">
              <h2 className="text-xl font-bold">Apstipriniet savu e-pastu</h2>
              {signUp?.emailAddress && (
                <p className="text-sm mt-2 text-base-content/70">
                  Mēs nosūtījām kodu uz <span className="font-medium">{signUp.emailAddress}</span>
                </p>
              )}
            </div>

            {error && (
              <div className="alert alert-error mb-6 text-sm">
                <AlertTriangle className="w-4 h-4" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Verifikācijas kods</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input input-bordered w-full text-center text-xl tracking-widest font-mono"
                  value={verificationCode}
                  onChange={handleCodeChange}
                  placeholder="------"
                  required
                  autoFocus
                />
                <label className="label">
                  <span className="label-text-alt text-base-content/60">
                    Ievadiet 6 ciparu kodu no e-pasta
                  </span>
                </label>
              </div>

              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={verifying || verificationCode.length < 6}
              >
                {verifying ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    <span>Verificē...</span>
                  </>
                ) : (
                  <>
                    <span>Verificēt e-pastu</span>
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button 
                onClick={handleResendCode}
                className="btn btn-ghost btn-sm gap-1"
                disabled={resending}
              >
                {resending ? (
                  <>
                    <span className="loading loading-spinner loading-xs"></span>
                    <span>Sūta...</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="w-3 h-3" />
                    <span>Nosūtīt jaunu kodu</span>
                  </>
                )}
              </button>
            </div>

            <div className="divider text-xs text-base-content/50">vai</div>

            <div className="text-center">
              <Link href="/register" className="btn btn-outline btn-sm gap-1">
                <ArrowLeftIcon className="w-3 h-3" />
                <span>Atgriezties uz reģistrāciju</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 