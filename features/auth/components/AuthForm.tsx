// features/auth/components/AuthForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthError } from '@supabase/supabase-js';
import { AuthMode, UserRole } from '../types';
import { toast } from "react-hot-toast";
import { useSupabase } from '@/lib/providers/SupabaseProvider';

interface AuthFormProps {
  readonly initialMode: AuthMode;
  readonly initialRole: UserRole;
  readonly updateRole: (role: 'skolēns' | 'pasniedzējs') => void;
  readonly updateMode: (mode: AuthMode) => void;
  readonly mode: AuthMode;
  readonly onSubmit: (e: React.FormEvent) => Promise<void>;
}

export default function AuthForm({ initialMode, initialRole, updateRole, updateMode, mode, onSubmit }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  
  const [isSignUp, setIsSignUp] = useState(initialMode === "signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState<UserRole | null>(initialRole as UserRole || null);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  // Email validation regex
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

  // Password strength validation
  const isPasswordStrong = (password: string) => {
    // Requires at least 6 characters, one uppercase letter, and one number
    const strongPasswordRegex = /^(?=.*[A-Z])(?=.*\d).{6,}$/;
    return strongPasswordRegex.test(password);
  };

  // Set initial role based on URL when component mounts
  useEffect(() => {
    if (!isSignUp) {
      setRole(null);
    } else {
      const queryRole = searchParams.get('role');
      if (queryRole === 'teacher') {
        setRole('pasniedzējs');
      } else if (queryRole === 'student') {
        setRole('skolēns');
      } else if (initialRole) {
        setRole(initialRole as UserRole);
      } else {
        setRole(null);
      }
    }
    // Use a short timeout to prevent flickering
    setTimeout(() => setIsInitializing(false), 100);
  }, [isSignUp, searchParams, initialRole]);

  // Add check for verified parameter
  useEffect(() => {
    const verified = searchParams.get('verified');
    if (verified === 'true') {
      setError("E-pasts veiksmīgi apstiprināts! Lūdzu piesakieties.");
    }
  }, [searchParams]);

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSignUp) {
      await handleSignUp(e);
    } else {
      await handleSignIn(e);
    }
  };

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    console.log('Sign-up form submitted');
    setError("");
    setIsSubmitting(true);

    // Validate role
    if (!role) {
      setError('Lūdzu izvēlieties lomu (Skolēns vai Pasniedzējs)');
      setIsSubmitting(false);
      return;
    }

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

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          full_name: displayName,
          role,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      toast.success('Reģistrācija veiksmīga! Lūdzu pārbaudiet savu e-pastu.');
      router.push('/verify-email');
    } catch (err) {
      const errorMessage = (err as Error).message || 'Kļūda reģistrējoties. Lūdzu, mēģiniet vēlreiz';
      setError(errorMessage);
      console.error('Sign-up error:', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    let loadingToast = toast.loading('Notiek pieslēgšanās...');

    // Validate email and password before attempting sign-in
    if (!email || !password) {
        setError('Lūdzu, ievadiet e-pastu un paroli');
        setIsSubmitting(false);
        return;
    }

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

      // Log the authentication token
      const { data: { session } } = await supabase.auth.getSession();
      console.log('Authentication token:', session);

      // Redirect to profile page immediately after successful sign-in
      console.log('Redirecting to profile page...');
      router.push("/profile");

      // Create or update profile
      const profileDataToUpsert = {
        id: data.user.id,
        email: data.user.email,
        full_name: data.user.user_metadata?.full_name || '',
        role: data.user.user_metadata?.role || 'student',
        is_active: true,
        metadata: {
          registration_completed: true
        }
      };

      console.log('Upserting profile data:', profileDataToUpsert);

      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert(profileDataToUpsert, { 
          onConflict: 'id'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw profileError;
      } else {
        console.log('Profile data after upsert:', profileData);
      }

      // Retrieve the profile data again after upsert
      const { data: updatedProfileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', profileDataToUpsert.id)
        .single();

      if (fetchError) {
        console.error('Error fetching updated profile data:', fetchError);
      } else {
        console.log('Updated profile data:', updatedProfileData);
      }

      toast.dismiss(loadingToast);
      toast.success('Veiksmīga pieslēgšanās!');
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

  const handleRoleChange = (newRole: UserRole) => {
    setRole(newRole);
    updateRole(newRole);
    // Only update URL if in signup mode
    if (isSignUp) {
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.set('role', newRole === 'pasniedzējs' ? 'teacher' : 'student');
      window.history.pushState({}, '', newUrl);
    }
  };

  const toggleMode = () => {
    const newMode = isSignUp ? "login" : "signup";
    setIsSignUp(!isSignUp);
    updateMode(newMode);
    
    // Clear role when switching to login
    if (newMode === "login") {
      setRole(null);
      router.push('/login');
    } else {
      // When switching to signup, redirect to register with current role if exists
      const roleParam = role ? `?role=${role === 'pasniedzējs' ? 'teacher' : 'student'}` : '';
      router.push(`/register${roleParam}`);
    }
  };

  // Dynamic Background & Button Colors based on role and mode
  const bgColor = isSignUp 
    ? (role === "pasniedzējs" ? "bg-secondary/10" : "bg-accent/10") 
    : "bg-base-200";
  const buttonColor = isSignUp 
    ? (role === "pasniedzējs" ? "btn-secondary" : "btn-accent") 
    : "btn-primary";

  // Render the form based on the role and mode
  return (
    <div className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${bgColor}`}>
      <form onSubmit={handleSubmit} className="card bg-base-100 shadow-xl p-6 w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-center">{isSignUp ? "Reģistrēties" : "Pieslēgties"}</h1>

        {error && (
          <div className={`alert ${error.includes('veiksmīgi') ? 'alert-success' : 'alert-error'} mb-4`}>
            <span>{error}</span>
          </div>
        )}

        <div className={`space-y-4 transition-opacity duration-200 ${isInitializing ? 'opacity-50' : 'opacity-100'}`}>
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
                  disabled={isInitializing}
                />
              </div>

              <div className="form-control mb-4">
                <label className="label font-semibold">Loma</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`btn w-1/2 ${role === "skolēns" ? "btn-accent" : "btn-outline"}`}
                    onClick={() => handleRoleChange("skolēns")}
                    disabled={isInitializing}
                  >
                    👩‍🎓 Skolēns
                  </button>
                  <button
                    type="button"
                    className={`btn w-1/2 ${role === "pasniedzējs" ? "btn-secondary" : "btn-outline"}`}
                    onClick={() => handleRoleChange("pasniedzējs")}
                    disabled={isInitializing}
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
              disabled={isInitializing}
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
              disabled={isInitializing}
            />
          </div>

          <button 
            type="submit" 
            className={`btn w-full ${buttonColor}`}
            disabled={isSubmitting || isInitializing}
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
              disabled={isSubmitting || isInitializing}
            >
              {isSignUp ? "Pieslēgties" : "Reģistrēties"}
            </button>
          </p>
        </div>
      </form>
    </div>
  );
}