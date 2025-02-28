"use client";

import { useUser, useClerk } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export function useAuth() {
  const { user, isLoaded, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Successfully signed out");
      router.push("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Error signing out");
    }
  };

  return {
    user,
    isLoading: !isLoaded,
    isAuthenticated: !!isSignedIn,
    isTeacher: user?.publicMetadata?.role === "teacher",
    isStudent: user?.publicMetadata?.role === "student",
    signOut: handleSignOut,
  };
} 