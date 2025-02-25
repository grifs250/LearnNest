'use client';

import { useSearchParams } from 'next/navigation';
import AuthForm from '@/features/auth/components/AuthForm';

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
  const errorMessage = error ? errorMessages[error] || 'Kļūda. Lūdzu, mēģiniet vēlreiz.' : null;

  return (
    <div className="min-h-screen">
      {errorMessage && (
        <div className="alert alert-error max-w-md mx-auto mt-4">
          <span>{errorMessage}</span>
        </div>
      )}
      <AuthForm 
        initialMode="login"
        initialRole="skolēns"
        mode="login"
        updateMode={() => {}}
        updateRole={() => {}}
        onSubmit={async () => {}}
      />
    </div>
  );
} 