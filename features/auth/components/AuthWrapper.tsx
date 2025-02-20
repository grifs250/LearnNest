"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "./AuthForm"; // Note: default import

export function AuthWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const modeParam = searchParams.get("mode") || "signup";
  const roleParam = searchParams.get("role") || "skolēns";

  const [mode, setMode] = useState(modeParam);
  const [role, setRole] = useState(roleParam);

  useEffect(() => {
    setMode(modeParam);
    setRole(roleParam);
  }, [modeParam, roleParam]);

  function updateRole(newRole: string) {
    setRole(newRole);
    router.push(`/auth?mode=${mode}&role=${newRole}`, { scroll: false });
  }

  function updateMode(newMode: string) {
    setMode(newMode);
    router.push(`/auth?mode=${newMode}&role=${role}`, { scroll: false });
  }

  return <AuthForm initialMode={mode} initialRole={role} updateRole={updateRole} updateMode={updateMode} />;
} 