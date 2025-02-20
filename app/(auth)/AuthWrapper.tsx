"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import AuthForm from "../../features/auth/components/AuthForm";

export default function AuthWrapper() {
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

  // Sync with URL parameters
  useEffect(() => {
    setMode(modeParam);
    setRole(roleParam);
  }, [modeParam, roleParam]);

  // Function to update URL when role is changed
  function updateRole(newRole: string) {
    setRole(newRole);
    router.push(`/auth?mode=${mode}&role=${newRole}`, { scroll: false });
  }

  // Function to update mode (Signup/Login)
  function updateMode(newMode: string) {
    setMode(newMode);
    router.push(`/auth?mode=${newMode}&role=${role}`, { scroll: false });
  }

  return <AuthForm initialMode={mode} initialRole={role} updateRole={updateRole} updateMode={updateMode} />;
}
