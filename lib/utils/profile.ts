import type { UserResource } from '@clerk/types';
import { createClient } from '@/lib/supabase/client';
import type { Profile, ProfileMetadata } from '@/features/lessons/types';
import type { SupabaseError } from '@/lib/types/supabase';
import { formatClerkId } from './user';

export async function initializeUserProfile(user: UserResource): Promise<Profile> {
  const supabase = createClient();

  const metadata: ProfileMetadata = {
    education: '',
    experience: '',
    specializations: [],
    languages: [],
    hourlyRate: 0,
  };

  const profileData: Partial<Profile> = {
    id: formatClerkId(user.id),
    full_name: user.fullName || '',
    email: user.emailAddresses[0].emailAddress,
    avatar_url: user.imageUrl,
    role: 'student', // Default role
    updated_at: new Date().toISOString(),
    metadata,
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
      metadata: data.metadata as ProfileMetadata,
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