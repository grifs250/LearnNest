"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSupabase } from '@/lib/providers/SupabaseProvider';
import { toast } from 'react-hot-toast';

export default function VerifyEmail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [cooldown, setCooldown] = useState(0);

  // Get email from URL params or session
  useEffect(() => {
    const emailParam = searchParams.get('email');
    if (emailParam) {
      setEmail(emailParam);
      setIsLoading(false);
      return;
    }

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user.email_confirmed_at) {
          router.push('/profile/setup');
        } else if (session?.user.email) {
          setEmail(session.user.email);
        } else {
          router.push('/login');
        }
      } catch (error) {
        console.error('Session check error:', error);
        toast.error('Kļūda pārbaudot sesiju');
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router, searchParams, supabase.auth]);

  // Cooldown timer for resend button
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const handleResendEmail = async () => {
    if (!email || cooldown > 0) return;

    try {
      setIsLoading(true);
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
      });

      if (error) throw error;
      
      setCooldown(60); // 1 minute cooldown
      toast.success('Verifikācijas e-pasts nosūtīts atkārtoti!');
    } catch (error) {
      console.error('Resend error:', error);
      toast.error('Kļūda sūtot e-pastu');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-200">
        <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full text-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Pārbaudiet savu e-pastu</h1>
        {email ? (
          <>
            <div className="mb-6 space-y-4">
              <p>
                Mēs nosūtījām verifikācijas e-pastu uz:
                <br />
                <span className="font-semibold">{email}</span>
              </p>
              <p className="text-sm text-base-content/70">
                Lūdzu, atveriet e-pastu un noklikšķiniet uz verifikācijas saites, 
                lai pabeigtu reģistrāciju.
              </p>
              <p className="text-sm text-base-content/70">
                Ja neredzat e-pastu, pārbaudiet arī mēstuļu mapi.
              </p>
            </div>

            <div className="divider">VAI</div>

            <button
              className="btn btn-outline w-full"
              onClick={handleResendEmail}
              disabled={cooldown > 0}
            >
              {cooldown > 0 ? (
                `Gaidiet ${cooldown} sekundes`
              ) : (
                'Sūtīt e-pastu vēlreiz'
              )}
            </button>

            <button
              className="btn btn-ghost btn-sm mt-4"
              onClick={() => router.push('/login')}
            >
              Atgriezties uz pieslēgšanos
            </button>
          </>
        ) : (
          <div className="alert alert-error">
            <span>Nav atrasta derīga sesija. Lūdzu, mēģiniet reģistrēties vēlreiz.</span>
          </div>
        )}
      </div>
    </div>
  );
} 