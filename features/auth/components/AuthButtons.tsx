"use client";
import { useEffect, useState } from "react";
import { AuthMode } from '../types';
import Link from "next/link";
import { useSupabase } from '@/lib/providers/SupabaseProvider';
import { User } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation';

interface AuthButtonsProps {
  readonly mode?: AuthMode;
}

export function AuthButtons({ mode = 'signup' }: Readonly<AuthButtonsProps>) {
  const { supabase } = useSupabase();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [role, setRole] = useState<'student' | 'teacher'>('student'); // Default role

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user || null);
        console.log('Session retrieved:', session);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      console.log('Auth state changed:', session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    // Extract role from URL query parameters
    const queryRole = new URLSearchParams(window.location.search).get('role');
    if (queryRole === 'teacher') {
      setRole('teacher');
    } else {
      setRole('student');
    }
  }, []);

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

  if (user) return null;

  return (
    <div className="flex flex-col sm:flex-row gap-7 pt-10 justify-center">
      <Link 
        href={`/${mode === 'login' ? 'login' : 'register'}?role=student`}
        className="btn btn-accent w-full sm:w-auto"
        onClick={() => setRole('student')}
      >
        👩‍🎓 {mode === 'login' ? 'Ieiet kā Skolēns' : 'Reģistrēties kā Skolēns'}
      </Link>
      <Link 
        href={`/${mode === 'login' ? 'login' : 'register'}?role=teacher`}
        className="btn btn-secondary w-full sm:w-auto"
        onClick={() => setRole('teacher')}
      >
        👨‍🏫 {mode === 'login' ? 'Ieiet kā Pasniedzējs' : 'Reģistrēties kā Pasniedzējs'}
      </Link>
    </div>
  );
} 