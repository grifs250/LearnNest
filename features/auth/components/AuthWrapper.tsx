"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "./AuthForm";
import { AuthMode, UserRole } from '../types';

interface AuthWrapperProps {
  readonly initialMode: AuthMode;
}

export function AuthWrapper({ initialMode }: Readonly<AuthWrapperProps>) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const roleParam = searchParams.get("role") as UserRole || "skolēns";

  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [role, setRole] = useState<UserRole>(roleParam);

  console.log('Current Mode:', mode);
  console.log('Current Role:', role);

  function updateRole(newRole: string) {
    setRole(newRole as UserRole);
    router.push(`/${mode === 'signup' ? 'register' : 'login'}?role=${newRole}`, { scroll: false });
  }

  function updateMode(newMode: string) {
    setMode(newMode as AuthMode);
    router.push(`/${newMode === 'signup' ? 'register' : 'login'}?role=${role}`, { scroll: false });
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm 
        mode={mode} 
        initialMode={initialMode}
        initialRole={role} 
        updateRole={updateRole} 
        updateMode={updateMode}
      />
    </Suspense>
  );
} 