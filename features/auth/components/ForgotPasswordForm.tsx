'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Forgot password form that integrates with Clerk
 * Allows users to request a password reset email
 */
export default function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [successfulCreation, setSuccessfulCreation] = useState(false);
  const [complete, setComplete] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { isLoaded, signIn } = useSignIn();

  // First step: Request password reset code
  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Request a password reset code
      await signIn.create({
        strategy: 'reset_password_email_code',
        identifier: email,
      });
      
      // Show the code + new password form
      setSuccessfulCreation(true);
    } catch (err: any) {
      console.error('Password reset request error:', err);
      setError(err.errors?.[0]?.message || 'Radās kļūda. Lūdzu, mēģiniet vēlreiz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Second step: Verify code and set new password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isLoaded) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      // Verify the code and set the new password
      const result = await signIn.attemptFirstFactor({
        strategy: 'reset_password_email_code',
        code,
        password,
      });
      
      if (result.status === 'complete') {
        // Password has been reset successfully
        // We're NOT setting session - don't want to auto-login
        setComplete(true);
      } else {
        console.error('Unexpected result:', result);
        setError('Neizdevās atjaunot paroli. Lūdzu, mēģiniet vēlreiz.');
      }
    } catch (err: any) {
      console.error('Password reset verification error:', err);
      setError(err.errors?.[0]?.message || 'Kļūda pārbaudot kodu. Lūdzu, pārbaudiet kodu un mēģiniet vēlreiz.');
    } finally {
      setIsLoading(false);
    }
  };

  // Completed state
  if (complete) {
    return (
      <div className="card w-full max-w-md mx-auto border border-base-300 bg-base-200 shadow-xl">
        <div className="card-body p-6">
          <div className="text-center mb-4">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold">Parole veiksmīgi atjaunota!</h2>
          </div>
          
          <p className="text-center mb-6 text-base-content/80">
            Jūsu parole ir veiksmīgi nomainīta. Tagad varat ielogoties ar jauno paroli.
          </p>
          
          <Link href="/login" className="btn btn-primary w-full">
            Doties uz ielogošanās lapu
          </Link>
        </div>
      </div>
    );
  }

  // Email verification code + new password input state
  if (successfulCreation) {
    return (
      <div className="card w-full max-w-md mx-auto border border-base-300 bg-base-200 shadow-xl">
        <div className="card-body p-6">
          <h2 className="text-2xl font-bold mb-4 text-center">
            Atjaunot paroli
          </h2>
          
          <p className="text-center text-base-content/70 mb-4">
            Pārbaudiet savu e-pastu <strong>{email}</strong> un ievadiet saņemto kodu zemāk.
          </p>
          
          {/* Error message */}
          {error && (
            <div className="alert alert-error text-sm mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <span>{error}</span>
            </div>
          )}
          
          {/* Form */}
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Verifikācijas kods</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="input input-bordered w-full"
                placeholder="000000"
                required
              />
            </div>
            
            <div className="form-control">
              <label className="label">
                <span className="label-text">Jaunā parole</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full"
                placeholder="Ievadi jauno paroli"
                minLength={8}
                required
              />
              <label className="label">
                <span className="label-text-alt text-base-content/70">Parolei jābūt vismaz 8 simbolus garai</span>
              </label>
            </div>
            
            <div className="form-control mt-6">
              <button 
                type="submit" 
                className="btn btn-primary w-full"
                disabled={isLoading}
              >
                {isLoading ? <span className="loading loading-spinner"></span> : 'Atjaunot paroli'}
              </button>
            </div>
            
            <div className="text-center mt-4">
              <button 
                type="button"
                onClick={() => setSuccessfulCreation(false)}
                className="btn btn-ghost btn-sm"
              >
                Ievadīt citu e-pasta adresi
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Initial email input state
  return (
    <div className="card w-full max-w-md mx-auto border border-base-300 bg-base-200 shadow-xl">
      <div className="card-body p-6">
        <h2 className="text-2xl font-bold mb-2 text-center">
          Atjaunot paroli
        </h2>
        
        <p className="text-center text-base-content/70 mb-4">
          Ievadi savu e-pasta adresi un mēs nosūtīsim tev paroles atjaunošanas saiti.
        </p>
        
        {/* Error message */}
        {error && (
          <div className="alert alert-error text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSendResetCode} className="space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">E-pasta adrese</span>
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input input-bordered w-full"
              placeholder="tavs@epasts.lv"
              required
            />
          </div>
          
          <div className="form-control mt-6">
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Nosūtīt atjaunošanas kodu'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm">
              <Link href="/login" className="link link-hover">Atpakaļ uz ielogošanos</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 