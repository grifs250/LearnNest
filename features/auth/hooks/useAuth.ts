"use client";

import { useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useToast } from '@/features/shared/hooks';
import { errorTracker } from '@/features/monitoring/utils/error-tracking';
import type {
  User,
  UserProfile,
  SignInCredentials,
  SignUpCredentials,
  AuthError,
} from '../types';

interface UseAuthReturn {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (credentials: SignInCredentials) => Promise<void>;
  signUp: (credentials: SignUpCredentials) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { error: showError, success } = useToast();

  // Get current session
  const getSession = useCallback(async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (err) {
      errorTracker.captureError(err as Error);
      return null;
    }
  }, [supabase.auth]);

  // Sign in
  const signIn = useCallback(async (credentials: SignInCredentials) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) throw error;

      success('Signed in successfully');
      router.push('/dashboard');
    } catch (err) {
      const authError = err as AuthError;
      showError(authError.message);
      errorTracker.captureError(authError);
      throw err;
    }
  }, [supabase.auth, router, success, showError]);

  // Sign up
  const signUp = useCallback(async (credentials: SignUpCredentials) => {
    try {
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            full_name: credentials.fullName,
            role: credentials.role,
          },
        },
      });

      if (error) throw error;

      success('Please check your email to verify your account');
      router.push('/auth/verify');
    } catch (err) {
      const authError = err as AuthError;
      showError(authError.message);
      errorTracker.captureError(authError);
      throw err;
    }
  }, [supabase.auth, router, success, showError]);

  // Sign out
  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      success('Signed out successfully');
      router.push('/');
    } catch (err) {
      const authError = err as AuthError;
      showError(authError.message);
      errorTracker.captureError(authError);
      throw err;
    }
  }, [supabase.auth, router, success, showError]);

  // Reset password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;

      success('Password reset instructions sent to your email');
    } catch (err) {
      const authError = err as AuthError;
      showError(authError.message);
      errorTracker.captureError(authError);
      throw err;
    }
  }, [supabase.auth, success, showError]);

  // Get user profile
  const getProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data as UserProfile;
    } catch (err) {
      errorTracker.captureError(err as Error);
      return null;
    }
  }, [supabase]);

  // Subscribe to auth changes
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh();
      }
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase.auth, router]);

  return {
    user: null, // TODO: Implement user state
    profile: null, // TODO: Implement profile state
    isLoading: false, // TODO: Implement loading state
    isAuthenticated: false, // TODO: Implement auth state
    signIn,
    signUp,
    signOut,
    resetPassword,
  };
} 