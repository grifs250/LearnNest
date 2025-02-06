"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AuthForm from "./AuthForm";

export default function AuthWrapper() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthContent />
    </Suspense>
  );
}

function AuthContent() {
  const params = useSearchParams();
  const mode = params.get("mode") || "signup"; // Default to signup
  const role = params.get("role") || "skolēns"; // Default role: Skolēns

  return <AuthForm initialMode={mode} initialRole={role} />;
}
