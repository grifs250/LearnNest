'use client';

import { useSupabase } from '@/components/providers/SupabaseProvider';
import { UserRole } from '@/types/supabase';

export function useAuth() {
  const { user, profile, isLoading, signOut } = useSupabase();

  const isAuthenticated = !!user;
  const isTeacher = profile?.role === 'teacher';
  const isStudent = profile?.role === 'student';
  const isAdmin = profile?.role === 'admin';

  const checkRole = (role: UserRole) => {
    return profile?.role === role;
  };

  return {
    user,
    profile,
    isLoading,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin,
    checkRole,
    signOut,
  };
} 