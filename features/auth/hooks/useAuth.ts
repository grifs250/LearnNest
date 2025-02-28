"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

export function useAuth() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: !!user,
    isTeacher: user?.publicMetadata?.role === 'teacher',
    isStudent: user?.publicMetadata?.role === 'student',
    signOut: () => signOut().then(() => router.push('/')),
  };
} 