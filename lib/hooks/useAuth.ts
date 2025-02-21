'use client';

import { SupabaseProvider } from '@/features/shared/providers/SupabaseProvider';
import { UserRole } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';
import { useSupabase } from '@/lib/hooks/useSupabase';
import { Profile } from '@/features/auth/types';

export function useAuth() {
  const { user, profile, loading, signOut } = useSupabase();

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
    loading,
    isAuthenticated,
    isTeacher,
    isStudent,
    isAdmin,
    checkRole,
    signOut,
  };
} 