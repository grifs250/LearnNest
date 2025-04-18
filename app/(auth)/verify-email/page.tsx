"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Mail, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

// This component will use useSearchParams, so it needs to be wrapped in Suspense
function VerifyEmailContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get role and email from stored data
  useEffect(() => {
    if (!isLoaded || !signUp) return;

    // Try to get role from URL first
    const roleParam = searchParams.get("role");
    if (roleParam === "teacher" || roleParam === "student") {
      setRole(roleParam);
    } 
    // Otherwise check local storage as fallback
    else if (typeof window !== 'undefined') {
      const storedRole = localStorage.getItem('userRole');
      if (storedRole === "teacher" || storedRole === "student") {
        setRole(storedRole);
      }
    }

    // Get the email from Clerk
    const emailAddress = signUp.emailAddress;
    if (emailAddress) {
      setEmail(emailAddress);
    }
  }, [isLoaded, signUp, searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded || !signUp) {
      return;
    }
    
    setVerifying(true);
    setError("");
    
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      
      if (completeSignUp.status !== "complete") {
        setError("Verifikācija neizdevās. Lūdzu, pārbaudiet kodu un mēģiniet vēlreiz.");
      } else {
        // Show success message
        setSuccess(true);
        
        // Set user session as active
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect after a short delay to show success message
        setTimeout(() => {
          router.push('/profile/setup');
        }, 1500);
      }
    } catch (err: any) {
      console.error("Error verifying email:", err);
      
      // More user-friendly error messages in Latvian
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

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      return;
    }
    
    setResending(true);
    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      // Success message in Latvian
      setError("");
      // Show success alert in Latvian
      alert("Jauns verifikācijas kods ir nosūtīts uz jūsu e-pastu.");
    } catch (err) {
      console.error("Error resending code:", err);
      setError("Neizdevās nosūtīt jaunu kodu. Lūdzu, mēģiniet vēlreiz vēlāk.");
    } finally {
      setResending(false);
    }
  };

  const roleIcon = role === "teacher" ? "👨‍🏫" : "👨‍🎓";
  const buttonColor = role === "teacher" ? "btn-secondary" : "btn-accent";
  const bgColor = role === "teacher" ? "bg-secondary/10" : "bg-accent/10";
  const accentColor = role === "teacher" ? "text-secondary" : "text-accent";

  // Handle digit input for code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className={`min-h-screen ${bgColor} py-10 px-4 flex items-center justify-center`}>
      <div className="max-w-md w-full mx-auto p-8 bg-base-100 rounded-xl shadow-xl">
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle className="text-success w-16 h-16" />
            </div>
            <h2 className="text-2xl font-bold">E-pasts veiksmīgi verificēts!</h2>
            <p className="text-base-content/70">
              Jūs tiekat novirzīts uz savu profilu...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center bg-base-200">
                <Mail className={`w-8 h-8 ${accentColor}`} />
              </div>
              <h2 className="text-2xl font-bold">
                {roleIcon} Apstipriniet savu e-pastu
              </h2>
              <p className="text-sm mt-2 text-base-content/70">
                Mēs nosūtījām verifikācijas kodu uz e-pastu{' '}
                <span className="font-medium">{email}</span>
              </p>
            </div>

            {error && (
              <div className="alert alert-error mb-6 shadow-md">
                <AlertTriangle className="w-5 h-5" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Verifikācijas kods</span>
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input input-bordered w-full text-center text-xl tracking-widest font-mono"
                  value={code}
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
                className={`btn ${buttonColor} w-full`}
                disabled={verifying || code.length < 6}
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

            <div className="mt-6 text-center">
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
          </>
        )}
      </div>
    </div>
  );
}

// Main page component that wraps the content in a Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
        <span className="ml-3">Ielādē...</span>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
} 