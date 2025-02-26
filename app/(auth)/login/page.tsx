'use client';

import AuthForm from '@/features/auth/components/AuthForm';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

const errorMessages: { [key: string]: string } = {
  verification_expired: 'Verifikācijas saite ir nederīga vai ir beigusies. Lūdzu, pieprasiet jaunu verifikācijas e-pastu.',
  verification_failed: 'Verifikācija neizdevās. Lūdzu, mēģiniet vēlreiz.',
  no_session: 'Sesija nav atrasta. Lūdzu, mēģiniet pieslēgties vēlreiz.',
  invalid_request: 'Nederīgs pieprasījums. Lūdzu, mēģiniet vēlreiz.',
  system_error: 'Sistēmas kļūda. Lūdzu, mēģiniet vēlreiz vēlāk.',
  access_denied: 'Piekļuve liegta. Lūdzu, mēģiniet vēlreiz.',
};

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');
  const verified = searchParams.get('verified');

  useEffect(() => {
    if (verified === 'true') {
      toast.success('E-pasts veiksmīgi apstiprināts! Lūdzu piesakieties.');
    } else if (error) {
      toast.error(errorMessages[error] || 'Kļūda. Lūdzu, mēģiniet vēlreiz.');
    }
  }, [verified, error]);

  return (
    <div className="min-h-screen bg-base-200">
      <AuthForm
        initialMode="login"
        initialRole="skolēns"
        onSubmit={async () => {}} // Auth is now handled in AuthForm
      />
    </div>
  );
} 