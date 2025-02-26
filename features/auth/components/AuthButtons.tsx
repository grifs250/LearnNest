"use client";
import { useState, useEffect } from "react";
import { AuthMode } from '../types';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface AuthButtonsProps {
  readonly mode?: AuthMode;
}

// Default mode is register
export function AuthButtons({ mode = 'register' }: Readonly<AuthButtonsProps>) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [role, setRole] = useState<'student' | 'teacher'>(
    searchParams.get('role') === 'teacher' ? 'teacher' : 'student'
  );

  // Create a Supabase client
  const supabase = createClientComponentClient();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Error checking session:', error.message);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
        }
      } catch (err) {
        console.error('Failed to check session:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [supabase.auth]);

  const handleNavigation = (selectedRole: 'student' | 'teacher') => {
    setRole(selectedRole);
    const path = mode === 'login' ? 'login' : 'register';
    router.push(`/${path}?role=${selectedRole}`, { scroll: false });
  };

  if (isLoading) {
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

  // If authenticated, don't show the buttons
  if (isAuthenticated) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-7 pt-10 justify-center">
      <button 
        className="btn btn-accent w-full sm:w-auto"
        onClick={() => handleNavigation('student')}
      >
        👩‍🎓 {mode === 'login' ? 'Ieiet kā Skolēns' : 'Reģistrēties kā Skolēns'}
      </button>
      <button 
        className="btn btn-secondary w-full sm:w-auto"
        onClick={() => handleNavigation('teacher')}
      >
        👨‍🏫 {mode === 'login' ? 'Ieiet kā Pasniedzējs' : 'Reģistrēties kā Pasniedzējs'}
      </button>
    </div>
  );
} 