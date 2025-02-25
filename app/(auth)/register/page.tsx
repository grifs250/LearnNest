"use client";

import AuthForm from '@/features/auth/components/AuthForm';
import { AuthButtons } from '@/features/auth/components/AuthButtons';
import { AuthMode, UserRole } from '@/features/auth/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<UserRole>("skolēns");
  const [mode, setMode] = useState<AuthMode>("signup");
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');

  // Extract role from URL query parameters
  useEffect(() => {
    const queryRole = new URLSearchParams(window.location.search).get('role');
    if (queryRole === 'pasniedzējs') {
      setRole('pasniedzējs');
    } else {
      setRole('skolēns');
    }
  }, []);

  const updateRole = (newRole: 'skolēns' | 'pasniedzējs') => {
    setRole(newRole);
  };

  const updateMode = (newMode: AuthMode) => {
    setMode(newMode);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate required fields
    if (!displayName) {
        setError('Vārds ir obligāts');
        return;
    }
    if (!email) {
        setError('E-pasts ir obligāts');
        return;
    }
    if (!password) {
        setError('Parole ir obligāta');
        return;
    }

    try {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: displayName,
                    role: role === "pasniedzējs" ? "teacher" : "student",
                },
            },
        });

        if (error) throw error;

        console.log('User signed up successfully:', data);
        // Redirect to profile or another page after successful sign-up
        router.push('/profile');
    } catch (err: unknown) {
        console.error('Sign-up error:', err);
        setError((err as { message?: string }).message || 'Kļūda reģistrējoties.');
    }
  };

  return (
    <div>
      <AuthForm
        initialMode={mode}
        initialRole={role}
        updateRole={updateRole}
        updateMode={updateMode}
        mode={mode}
        onSubmit={handleSignUp}
      />
      {error && <div className="alert alert-error">{error}</div>}
    </div>
  );
}