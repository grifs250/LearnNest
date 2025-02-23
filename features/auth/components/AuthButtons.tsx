"use client";
import { useEffect, useState } from "react";
import { AuthMode } from '../types';
import Link from "next/link";
import { useSupabase } from '@/lib/supabase';

interface AuthButtonsProps {
  readonly mode?: AuthMode;
}

export function AuthButtons({ mode = 'signup' }: AuthButtonsProps) {
  const { user, loading } = useSupabase();
  const isLoggedIn = !!user;

  if (loading) {
    return (
      <div className="flex flex-col sm:flex-row gap-7 pt-10 justify-center">
        <button className="btn btn-accent w-full sm:w-auto" disabled>
          <span className="loading loading-spinner"></span>
          Lādējas...
        </button>
        <button className="btn btn-secondary w-full sm:w-auto" disabled>
          <span className="loading loading-spinner"></span>
          Lādējas...
        </button>
      </div>
    );
  }

  if (isLoggedIn) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-7 pt-10 justify-center">
      <Link 
        href={`/${mode === 'login' ? 'login' : 'register'}?role=skolēns`}
        className="btn btn-accent w-full sm:w-auto"
      >
        👩‍🎓 {mode === 'login' ? 'Ieiet kā Skolēns' : 'Reģistrēties kā Skolēns'}
      </Link>
      <Link 
        href={`/${mode === 'login' ? 'login' : 'register'}?role=pasniedzējs`}
        className="btn btn-secondary w-full sm:w-auto"
      >
        👨‍🏫 {mode === 'login' ? 'Ieiet kā Pasniedzējs' : 'Reģistrēties kā Pasniedzējs'}
      </Link>
    </div>
  );
} 