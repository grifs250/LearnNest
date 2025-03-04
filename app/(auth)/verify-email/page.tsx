"use client";

import { useSignUp } from "@clerk/nextjs";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// This component will use useSearchParams, so it needs to be wrapped in Suspense
function VerifyEmailContent() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState("student"); // Default role
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get role from stored data
  useEffect(() => {
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
  }, [searchParams]);

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
        setError("Verifikācija neizdevās. Lūdzu, mēģiniet vēlreiz.");
      } else {
        // Get the role from the metadata
        const userRole = completeSignUp.unsafeMetadata?.role as string || role;
        
        // Set user session as active
        await setActive({ session: completeSignUp.createdSessionId });
        
        // Redirect to profile setup page instead of role-based page
        router.push('/profile/setup');
      }
    } catch (err: any) {
      console.error("Error verifying email:", err);
      setError(err.message || "Verifikācijas kļūda. Lūdzu, mēģiniet vēlreiz.");
    } finally {
      setVerifying(false);
    }
  };

  const roleIcon = role === "teacher" ? "👨‍🏫" : "👨‍🎓";
  const buttonColor = role === "teacher" ? "btn-secondary" : "btn-accent";
  const bgColor = role === "teacher" ? "bg-secondary/10" : "bg-accent/10";

  return (
    <div className={`min-h-screen ${bgColor} py-10 px-4`}>
      <div className="max-w-md mx-auto p-6 bg-base-100 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-2 text-center">
          {roleIcon} Apstipriniet savu e-pastu
        </h2>
        <p className="text-center text-sm mb-6 text-base-content/70">
          Mēs nosūtījām verifikācijas kodu uz jūsu e-pastu. Lūdzu, ievadiet to zemāk.
        </p>

        {error && (
          <div className="alert alert-error mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Verifikācijas kods</span>
            </label>
            <input
              type="text"
              className="input input-bordered w-full text-center text-xl tracking-widest"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="XXXXXX"
              required
              maxLength={6}
            />
          </div>

          <div className="form-control mt-6">
            <button 
              type="submit" 
              className={`btn ${buttonColor} w-full ${verifying ? 'loading' : ''}`}
              disabled={verifying || code.length < 6}
            >
              {verifying ? 'Verifikācija...' : 'Verificēt e-pastu'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Main page component that wraps the content in a Suspense boundary
export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div className="p-8 text-center">Ielādē...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
} 