import { createServerClient } from '@/lib/supabase/server';
import type { UserProfile } from '@/lib/types';

/**
 * Fetches a user profile by user ID
 * 
 * @param {string} userId - The user ID
 * @returns {Promise<UserProfile | null>} The user profile or null if not found
 */
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const supabase = await createServerClient();
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return data;
}

/**
 * Creates or updates a user profile
 * 
 * @param {Partial<UserProfile> & { user_id: string }} profile - The profile data to update
 * @returns {Promise<UserProfile | null>} The updated profile or null if operation failed
 */
export async function updateUserProfile(
  profile: Partial<UserProfile> & { user_id: string }
): Promise<UserProfile | null> {
  const supabase = await createServerClient();
  
  // Check if profile exists
  const { data: existing } = await supabase
    .from('user_profiles')
    .select('id')
    .eq('user_id', profile.user_id)
    .maybeSingle();
  
  // Insert or update
  const operation = existing ? 'update' : 'insert';
  const query = supabase.from('user_profiles');
  
  if (operation === 'update') {
    const { data, error } = await query
      .update(profile)
      .eq('user_id', profile.user_id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }
    
    return data;
  } else {
    const { data, error } = await query
      .insert(profile)
      .select()
      .single();
      
    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }
    
    return data;
  }
} 