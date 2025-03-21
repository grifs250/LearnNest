"use client";

import { Metadata } from "next";
import { ProfileSetupForm } from "@/features/auth/components/ProfileSetupForm";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export default function ProfileSetupPage() {
  const { isLoaded, user, isSignedIn } = useUser();
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);
  
  // Redirect if not signed in
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/login");
    } else if (isLoaded && isSignedIn) {
      // If profile is already completed, redirect to dashboard
      const needsSetup = user?.unsafeMetadata?.profile_needs_setup;
      const profileCompleted = user?.unsafeMetadata?.profile_completed === true;
      
      // Only redirect if profile is definitely complete (needs_setup is false AND completed is true)
      if (needsSetup === false && profileCompleted === true) {
        // User already completed setup, redirect to dashboard based on role
        const userRole = user?.unsafeMetadata?.role as string || 'student';
        
        if (userRole === 'teacher') {
          router.push("/teacher");
        } else {
          router.push("/student");
        }
      } else {
        // Profile needs setup, show the form
        setIsReady(true);
      }
    }
  }, [isLoaded, isSignedIn, user, router]);
  
  // Loading state
  if (!isReady) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-base-200 p-4">
        <div className="max-w-md w-full mx-auto text-center">
          <div className="loading loading-spinner loading-lg mb-4"></div>
          <h2 className="text-xl font-bold">Ielādē profila informāciju</h2>
          <p className="text-base-content/70 mt-2">Lūdzu, uzgaidiet...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-base-200 py-10">
      <div className="container mx-auto px-4">
        <ProfileSetupForm />
      </div>
    </div>
  );
} 