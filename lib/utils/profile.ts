import type { UserResource } from '@clerk/types';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database.types';
import type { SupabaseError } from '@/lib/types/supabase';
import { formatClerkId } from './user';

export async function initializeUserProfile(user: UserResource): Promise<Profile> {
  const supabase = createClient();

  const metadata: Record<string, any> = {
    education: '',
    experience: '',
    specializations: [],
    languages: [],
    hourly_rate: 0,
  };

  const profileData: Partial<Profile> = {
    id: formatClerkId(user.id),
    full_name: user.fullName || '',
    email: user.emailAddresses[0]?.emailAddress || '',
    user_id: formatClerkId(user.id),
    avatar_url: user.imageUrl,
    role: 'student', // Default role
    is_active: true,
    metadata
  };

  try {
    const { data, error } = await supabase
      .from('profiles')
      .insert(profileData)
      .select()
      .single();

    if (error) {
      const supaError = error as SupabaseError;
      console.error('Profile creation error:', {
        code: supaError.code,
        message: supaError.message,
        details: supaError.details
      });
      throw new Error(`Failed to create profile: ${supaError.message}`);
    }

    if (!data) {
      throw new Error('No profile data returned');
    }

    return {
      ...data,
      metadata: data.metadata as Record<string, any>,
    } as Profile;
  } catch (error) {
    const err = error as Error;
    console.error('Profile initialization error:', {
      message: err.message,
      stack: err.stack
    });
    throw error;
  }
} 