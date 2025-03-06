"use client";

import { useState } from 'react';
import { useVerification } from '@/features/auth/hooks';
import { Mail, CheckCircle, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";

/**
 * A component for manual email verification
 * This is a simpler alternative to the main verification page
 * that uses our custom verification functions
 */
interface VerificationFormProps {
  email?: string;
  onSuccess?: () => void;
  className?: string;
}

export default function VerificationForm({ 
  email = '',
  onSuccess,
  className = ''
}: VerificationFormProps) {
  const [userEmail, setUserEmail] = useState(email);
  const [code, setCode] = useState("");
  const { 
    verifyEmailWithCode, 
    resendCode, 
    isVerifying, 
    isResending, 
    error, 
    success, 
    setError 
  } = useVerification();

  // Handle verification submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!code || !userEmail) {
      setError("Lūdzu, ievadiet e-pasta adresi un verifikācijas kodu.");
      return;
    }
    
    const isSuccess = await verifyEmailWithCode(code, userEmail);
    
    if (isSuccess && onSuccess) {
      // Call the success callback if provided
      setTimeout(() => {
        onSuccess();
      }, 1500);
    }
  };

  // Handle code resend
  const handleResendCode = async () => {
    if (!userEmail) {
      setError("Lūdzu, ievadiet e-pasta adresi.");
      return;
    }
    
    const isSuccess = await resendCode(userEmail);
    
    if (isSuccess) {
      // Show success alert
      alert("Jauns verifikācijas kods ir nosūtīts uz jūsu e-pastu.");
    }
  };

  // Handle digit input for code
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow digits
    const value = e.target.value.replace(/\D/g, '');
    if (value.length <= 6) {
      setCode(value);
    }
  };

  return (
    <div className={`p-6 bg-base-100 rounded-xl shadow-md ${className}`}>
      {success ? (
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <CheckCircle className="text-success w-12 h-12" />
          </div>
          <h3 className="text-xl font-bold">E-pasts veiksmīgi verificēts!</h3>
        </div>
      ) : (
        <>
          <div className="text-center mb-4">
            <div className="w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center bg-base-200">
              <Mail className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold">
              Apstipriniet savu e-pastu
            </h3>
            <p className="text-sm mt-1 text-base-content/70">
              {email ? 
                `Mēs nosūtījām verifikācijas kodu uz e-pastu ${email}` : 
                'Ievadiet savu e-pasta adresi un verifikācijas kodu'
              }
            </p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 text-sm shadow-sm">
              <AlertTriangle className="w-4 h-4" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!email && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">E-pasta adrese</span>
                </label>
                <input
                  type="email"
                  className="input input-bordered w-full"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  placeholder="jusu@epasts.lv"
                  required
                />
              </div>
            )}

            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Verifikācijas kods</span>
              </label>
              <input
                type="text"
                inputMode="numeric"
                className="input input-bordered w-full text-center text-lg tracking-widest font-mono"
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
              className="btn btn-primary w-full"
              disabled={isVerifying || code.length < 6}
            >
              {isVerifying ? (
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
              disabled={isResending}
            >
              {isResending ? (
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
  );
} 