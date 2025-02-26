import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Session } from '@supabase/supabase-js';

export async function initializeUserProfile(session: Session) {
  const supabase = createClientComponentClient();
  
  if (!session?.user?.id) {
    throw new Error('No session or user ID');
  }

  try {
    // First check if profile exists
    const { data: profile, error: fetchError } = await supabase
      .from('profiles')
      .select()
      .eq('id', session.user.id)
      .maybeSingle();

    if (fetchError) {
      throw fetchError;
    }

    // If profile exists, return it
    if (profile) {
      return profile;
    }

    // If no profile exists, create one
    const { data: newProfile, error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        full_name: session.user.user_metadata.full_name || '',
        role: 'student',
        avatar_url: null,
        bio: null,
        phone: null,
        timezone: 'UTC',
        language: 'en',
        is_active: true,
        metadata: {}
      })
      .select()
      .single();

    if (insertError) {
      throw insertError;
    }

    return newProfile;

  } catch (error) {
    console.error('Profile initialization error:', error);
    throw error;
  }
} 