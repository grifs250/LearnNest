"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabase } from '@/lib/providers/SupabaseProvider';

export default function VerifyEmail() {
  const router = useRouter();
  const { supabase } = useSupabase();
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user.email_confirmed_at) {
        router.push('/profile/setup');
      } else {
        setEmail(session?.user.email ?? null);
      }
    };

    checkSession();
  }, [router, supabase.auth]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-base-200">
      <div className="card bg-base-100 shadow-xl p-8 max-w-md w-full text-center">
        <h1 className="text-2xl font-bold mb-6">Pārbaudiet savu e-pastu</h1>
        {email ? (
          <>
            <p className="mb-4">
              Mēs nosūtījām verifikācijas e-pastu uz:
              <br />
              <span className="font-semibold">{email}</span>
            </p>
            <p className="mb-6">
              Lūdzu, atveriet e-pastu un noklikšķiniet uz verifikācijas saites, lai pabeigtu reģistrāciju.
            </p>
            <div className="divider">VAI</div>
            <button
              className="btn btn-outline mt-4"
              onClick={async () => {
                const { error } = await supabase.auth.resend({
                  type: 'signup',
                  email: email,
                });
                if (!error) {
                  alert('Verifikācijas e-pasts nosūtīts atkārtoti!');
                }
              }}
            >
              Sūtīt e-pastu vēlreiz
            </button>
          </>
        ) : (
          <p>Ielādē...</p>
        )}
      </div>
    </div>
  );
} 