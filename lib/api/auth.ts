import { auth, currentUser } from '@clerk/nextjs/server';
import { clerkClient } from '@clerk/nextjs/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

/**
 * Get the current authenticated user and their Supabase profile
 */
export async function getCurrentUser() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return { user: null, profile: null };
    }

    const supabase = await createServerSupabaseClient();
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      return { user: { id: userId }, profile: null };
    }

    return { user: { id: userId }, profile };
  } catch (error) {
    console.error('Auth error:', error);
    return { user: null, profile: null };
  }
}

/**
 * Check if the current user has a specific role
 */
export async function checkUserRole(requiredRole: 'student' | 'teacher' | 'admin'): Promise<boolean> {
  const { profile } = await getCurrentUser();
  return profile?.role === requiredRole;
}

/**
 * Get a user's profile by ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
} 