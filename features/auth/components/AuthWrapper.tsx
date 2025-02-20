"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthForm } from "./AuthForm";
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

  function updateRole(newRole: UserRole) {
    setRole(newRole);
    router.push(`/auth?mode=${mode}&role=${newRole}`, { scroll: false });
  }

  function updateMode(newMode: AuthMode) {
    setMode(newMode);
    router.push(`/auth?mode=${newMode}&role=${role}`, { scroll: false });
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthForm 
        mode={mode} 
        initialRole={role} 
        updateRole={updateRole} 
        updateMode={updateMode}
      />
    </Suspense>
  );
} 