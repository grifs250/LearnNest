// features/auth/components/AuthForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthError } from '@supabase/supabase-js';
import { AuthMode, UserRole } from '../types';
import { toast } from "react-hot-toast";
import { useSupabase } from '@/lib/providers/SupabaseProvider';

interface AuthFormProps {
  initialMode: AuthMode;
  initialRole: UserRole;
  updateRole: (role: string) => void;
  updateMode: (mode: string) => void;
  mode: AuthMode;
}

export default function AuthForm({ initialMode, initialRole, updateRole, updateMode, mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole>(initialRole);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Password strength validation
  const isPasswordStrong = (password: string) => {
    // Requires at least 6 characters, one uppercase letter, and one number
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
  };

  useEffect(() => {
    console.log('Initial Mode:', initialMode);
    console.log('Initial Role:', initialRole);
    setIsSignUp(initialMode === "signup");
    setRole(initialRole);
  }, [initialMode, initialRole]);

  // Add check for verified parameter
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setError("E-pasts veiksmīgi apstiprināts! Lūdzu piesakieties.");
    }
  }, [searchParams]);

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      // Validate required fields
      if (!displayName) {
        setError('Vārds ir obligāts');
        setIsSubmitting(false);
        return;
      }
      if (!emailRegex.test(email)) {
        setError('Lūdzu, ievadiet derīgu e-pasta adresi');
        setIsSubmitting(false);
        return;
      }
      if (!isPasswordStrong(password)) {
        setError('Parolei jābūt vismaz 6 simbolus garai, ar vienu lielo burtu un vienu ciparu');
        setIsSubmitting(false);
        return;
      }

      const loadingToast = toast.loading('Reģistrācija notiek...');

      console.log('Starting signup process...');
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: displayName,
            role: role === "pasniedzējs" ? "teacher" : "student",
            is_active: true,
            metadata: {
              registration_completed: false
            }
          },
          emailRedirectTo: `${window.location.origin}/profile`,
        },
      });

      if (signUpError) {
        console.error('Signup error:', signUpError);
        throw signUpError;
      }

      if (!signUpData.user) {
        console.error('No user data after signup');
        throw new Error('User data is not available after sign-up.');
      }

      console.log('User signed up successfully:', {
        userId: signUpData.user.id,
        email: signUpData.user.email,
        role: signUpData.user.user_metadata?.role
      });

      // Redirect to profile page after successful signup
      router.push("/profile");
    } catch (err) {
      console.error('Registration error:', err);
      const errorMessage = (err as AuthError).message || 'Kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz';
      setError(errorMessage);
    } finally {
      console.log('isSubmitting after signup:', isSubmitting);
      setIsSubmitting(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    let loadingToast = toast.loading('Notiek pieslēgšanās...');
    
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      if (!data.user?.email_confirmed_at) {
        toast.dismiss(loadingToast);
        router.push("/verify-email");
        return;
      }

      // Create or update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: data.user.id,
          email: data.user.email,
          full_name: data.user.user_metadata?.full_name || '',
          role: data.user.user_metadata?.role || 'student',
          is_active: true,
          metadata: {
            registration_completed: true
          }
        }, { 
          onConflict: 'id'
        });

      if (profileError) throw profileError;

      toast.dismiss(loadingToast);
      toast.success('Veiksmīga pieslēgšanās!');
      router.push("/profile");
    } catch (err) {
      toast.dismiss(loadingToast);
      const errorMessage = (err as AuthError).message || 'Kļūda pieslēdzoties. Lūdzu, mēģiniet vēlreiz';
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Error during sign-in:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  function toggleMode() {
    const newMode = isSignUp ? "login" : "signup";
    setIsSignUp(!isSignUp);
    updateMode(newMode);
    router.push(`/${isSignUp ? 'login' : 'register'}?role=${role}`);
  }

  function handleRoleChange(newRole: UserRole) {
    setRole(newRole);
    updateRole(newRole);
  }

  // Dynamic Background & Button Colors based on role
  const bgColor = isSignUp 
    ? (role === "pasniedzējs" ? "bg-secondary/10" : "bg-accent/10") 
    : "bg-base-200";
  const buttonColor = isSignUp 
    ? (role === "pasniedzējs" ? "btn-secondary" : "btn-accent") 
    : "btn-primary";

  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${bgColor}`}>
      <form onSubmit={isSignUp ? handleSignUp : handleSignIn} className="card bg-base-100 shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">{isSignUp ? "Reģistrēties" : "Pieslēgties"}</h1>

        {error && (
          <div className={`alert ${error.includes('veiksmīgi') ? 'alert-success' : 'alert-error'} mb-4`}>
            <span>{error}</span>
          </div>
        )}

        {isSignUp && (
          <>
            <div className="form-control mb-4">
              <label className="label font-semibold">Vārds</label>
              <input
                type="text"
                className="input input-bordered"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
                aria-required="true"
                aria-label="Vārds"
              />
            </div>

            {/* Role Selection */}
            <div className="form-control mb-4">
              <label className="label font-semibold">Loma</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "skolēns" ? "btn-accent" : "btn-outline"}`}
                  onClick={() => handleRoleChange("skolēns")}
                >
                  👩‍🎓 Skolēns
                </button>
                <button
                  type="button"
                  className={`btn w-1/2 ${role === "pasniedzējs" ? "btn-secondary" : "btn-outline"}`}
                  onClick={() => handleRoleChange("pasniedzējs")}
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
            required
            aria-required="true"
            aria-label="E-pasts"
          />
        </div>

        <div className="form-control mb-4">
          <label className="label font-semibold">Parole</label>
          <input
            type="password"
            className="input input-bordered"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            aria-required="true"
            aria-label="Parole"
          />
        </div>

        <button 
          type="submit" 
          className={`btn w-full ${buttonColor}`}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <span className="loading loading-spinner"></span>
              {isSignUp ? "Notiek reģistrācija..." : "Notiek pieslēgšanās..."}
            </>
          ) : (
            isSignUp ? "Reģistrēties" : "Pieslēgties"
          )}
        </button>

        <p className="mt-4 text-center">
          {isSignUp ? "Jau ir konts?" : "Nav konta?"}{" "}
          <button 
            type="button" 
            className="text-blue-500 underline" 
            onClick={toggleMode}
            disabled={isSubmitting}
          >
            {isSignUp ? "Pieslēgties" : "Reģistrēties"}
          </button>
        </p>
      </form>
    </div>
  );
}