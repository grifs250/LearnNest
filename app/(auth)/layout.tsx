"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/lib/firebase/client";
import { onAuthStateChanged } from "firebase/auth";
import { Suspense } from "react";
import AuthLoading from "./loading";

interface AuthLayoutProps {
  readonly children: React.ReactNode;
}

export const metadata = {
  title: 'Authentication',
  description: 'Login or register to access your account'
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  const router = useRouter();

  useEffect(() => {
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
      <div className="min-h-screen flex items-center justify-center">
        {children}
      </div>
    </Suspense>
  );
} 