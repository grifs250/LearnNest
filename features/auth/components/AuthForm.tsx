// features/auth/components/AuthForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthError } from '@supabase/supabase-js';
import { AuthMode, UIRole, mapUIRoleToStorageRole } from '../types';
import { toast } from "react-hot-toast";
import { useSupabase } from '@/lib/providers/SupabaseProvider';
import Link from "next/link";

interface AuthFormProps {
  initialMode: AuthMode;
  initialRole: UIRole;
  onSubmit: (formData: { 
    email: string; 
    password: string; 
    displayName?: string; 
    role?: UIRole;
    mode: AuthMode;
  }) => Promise<void>;
}

export default function AuthForm({ initialMode, initialRole, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  
  // Stable state management
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UIRole>(initialRole);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Handle role from URL without flickering
  useEffect(() => {
    const queryRole = searchParams.get('role');
    if (queryRole === 'teacher') {
      setRole('pasniedzējs');
    } else if (queryRole === 'student') {
      setRole('skolēns');
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        if (data.session) {
          // Check if user has a profile
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.session.user.id)
            .maybeSingle();

          if (profileError) throw profileError;

          toast.success('Successfully logged in!');
          
          // Redirect based on profile existence
          if (!profile) {
            router.push('/profile/setup');
          } else {
            router.push('/profile');
          }
        }
      } else {
        // Register mode
        try {
          const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password,
              full_name: displayName,
              role: mapUIRoleToStorageRole(role),
            }),
          });

          const data = await response.json();
          
          if (!response.ok) {
            toast.error(data.error, {
              duration: 5000,
              position: 'top-center',
            });
            return;
          }
          
          toast.success(data.message, {
            duration: 5000,
            position: 'top-center',
          });
          router.replace(`/verify-email?email=${encodeURIComponent(email)}`);
        } catch (error) {
          console.error('Registration error:', error);
          toast.error('Kļūda. Lūdzu mēģiniet vēlreiz.', {
            duration: 5000,
            position: 'top-center',
          });
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      if (error instanceof AuthError) {
        toast.error(error.message, {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        toast.error('Kļūda. Lūdzu mēģiniet vēlreiz.', {
          duration: 5000,
          position: 'top-center',
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleMode = () => {
    const newMode: AuthMode = mode === 'login' ? 'register' : 'login';
    setMode(newMode);
    setError(null);
    router.replace(`/${newMode}`);
  };

  const handleRoleChange = (newRole: UIRole) => {
    setRole(newRole);
    router.replace(`/${mode}`);
  };

  // Get dynamic colors based on role
  const getRoleColors = () => {
    if (role === "pasniedzējs") {
      return {
        bg: "bg-secondary/10", // Light secondary color
        button: "btn-secondary",
        hover: "hover:bg-secondary/20"
      };
    }
    return {
      bg: "bg-accent/10", // Light accent color
      button: "btn-accent",
      hover: "hover:bg-accent/20"
    };
  };

  const colors = getRoleColors();

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${mode === 'register' ? colors.bg : 'bg-base-200'}`}>
      <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold mb-6 text-center">
          {mode === 'register' ? "Reģistrēties" : "Pieslēgties"}
        </h1>

        <form onSubmit={handleSubmit}>
          {mode === 'register' && (
            <>
              <div className="form-control mb-4">
                <label className="label font-semibold">Vārds</label>
                <input
                  type="text"
                  className="input input-bordered"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={isSubmitting}
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label font-semibold">Loma</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn w-1/2 ${role === "skolēns" ? "btn-accent" : "btn-outline"} ${role === "skolēns" ? "" : "hover:btn-accent"}`}
                    onClick={() => handleRoleChange("skolēns")}
                    disabled={isSubmitting}
                  >
                    👩‍🎓 Skolēns
                  </button>
                  <button
                    type="button"
                    className={`btn w-1/2 ${role === "pasniedzējs" ? "btn-secondary" : "btn-outline"} ${role === "pasniedzējs" ? "" : "hover:btn-secondary"}`}
                    onClick={() => handleRoleChange("pasniedzējs")}
                    disabled={isSubmitting}
                  >
                    👨‍🏫 Pasniedzējs
                  </button>
                </div>
              </div>
            </>
          )}

          <div className="form-control mb-4">
            <label className="label font-semibold">E-pasts</label>
            <input
              type="email"
              className="input input-bordered"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="form-control mb-6">
            <label className="label font-semibold">Parole</label>
            <input
              type="password"
              className="input input-bordered"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <button 
            type="submit" 
            className={`btn w-full ${mode === 'login' ? 'btn-primary hover:bg-primary-300' : colors.button}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="loading loading-spinner"></span>
                Notiek...
              </>
            ) : (
              mode === 'register' ? 'Reģistrēties' : 'Pieslēgties'
            )}
          </button>

          <p className="mt-4 text-center">
            {mode === 'register' ? "Jau ir konts?" : "Nav konta?"}{" "}
            <button 
              type="button"
              className="text-primary hover:underline"
              onClick={toggleMode}
              disabled={isSubmitting}
            >
              {mode === 'register' ? "Pieslēgties" : "Reģistrēties"}
            </button>
          </p>
        </form>
      </div>
    </div>
  );
}