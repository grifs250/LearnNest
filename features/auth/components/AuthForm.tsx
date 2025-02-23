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
      // Validate password length
      if (password.length < 6) {
        setError('Parolei jābūt vismaz 6 simbolus garai');
        setIsSubmitting(false);
        return;
      }

      const loadingToast = toast.loading('Reģistrācija notiek...');

      const { data, error: signUpError } = await supabase.auth.signUp({
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

      if (signUpError) throw signUpError;

      toast.dismiss(loadingToast);
      toast.success('Reģistrācija veiksmīga!');
      router.push("/verify-email");
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    
    try {
      const loadingToast = toast.loading('Notiek pieslēgšanās...');

      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) throw signInError;

      toast.dismiss(loadingToast);
      
      if (!data.user?.email_confirmed_at) {
        router.push("/verify-email");
        return;
      }

      toast.success('Veiksmīga pieslēgšanās!');
      router.push("/profile");
    } catch (err) {
      const errorMessage = (err as AuthError).message || 'Kļūda pieslēdzoties. Lūdzu, mēģiniet vēlreiz';
      setError(errorMessage);
      toast.error(errorMessage);
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