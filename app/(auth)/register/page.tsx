"use client";

import AuthForm from '@/features/auth/components/AuthForm';

export default function RegisterPage() {
  return (
    <div>
      <AuthForm
        initialMode="register"
        initialRole="skolēns"
        onSubmit={async () => {}} // Auth is now handled in AuthForm
      />
    </div>
  );
}