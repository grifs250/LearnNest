"use client";

import React from 'react';
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { Suspense } from "react";
import AuthLoading from "./loading";

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // If user is already authenticated and verified, redirect to dashboard
      if (user?.emailVerified) {
        router.push("/dashboard");
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Check for any route references using courseId

  return (
    <Suspense fallback={<AuthLoading />}>
      <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
        <div className="max-w-md w-full">{children}</div>
      </div>
    </Suspense>
  );
} 