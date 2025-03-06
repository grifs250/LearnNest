'use client';

import { useState } from 'react';
import { useSignIn } from '@clerk/nextjs';
import Link from 'next/link';

/**
 * Custom sign-in form that matches the style of SignUpForm
 * Provides a branded, consistent experience for users
 */
export default function SignInForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signIn, isLoaded: isSignInLoaded } = useSignIn();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isSignInLoaded) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const result = await signIn.create({
        identifier: email,
        password,
      });
      
      if (result.status === 'complete') {
        // Redirect happens automatically
        window.location.href = '/';
      } else {
        console.error('Login failed:', result);
        setError('Nepareizs lietotājvārds vai parole.');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.errors?.[0]?.message || 'Radās kļūda. Lūdzu, mēģiniet vēlreiz.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card w-full max-w-md mx-auto border border-base-300 bg-base-200 shadow-xl">
      <div className="card-body p-6">
        <h2 className="text-2xl font-bold mb-4 text-center">
          Ieiet
        </h2>
        
        {/* Error message */}
        {error && (
          <div className="alert alert-error text-sm mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="stroke-current shrink-0 h-5 w-5" fill="none" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <span>{error}</span>
          </div>
        )}
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          <div className="form-control">
            <label className="label">
              <span className="label-text">Parole</span>
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input input-bordered w-full"
              placeholder="Ievadi paroli"
              required
            />
            <label className="label">
              <Link href="/forgot-password" className="label-text-alt link link-hover">
                Aizmirsi paroli?
              </Link>
            </label>
          </div>
          
          <div className="form-control mt-6">
            <button 
              type="submit" 
              className="btn btn-primary w-full"
              disabled={isLoading}
            >
              {isLoading ? <span className="loading loading-spinner"></span> : 'Ieiet'}
            </button>
          </div>
          
          <div className="text-center mt-4">
            <p className="text-sm">
              Vēl neesi reģistrējies? <Link href="/register" className="link link-hover">Reģistrēties</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
} 