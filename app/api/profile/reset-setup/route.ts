import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * API endpoint to reset the profile setup status
 * This allows a user to go through the onboarding process again
 * 
 * Note: Due to Clerk API limitations, this endpoint only removes the Supabase profile,
 * and the client-side component will handle the Clerk metadata update.
 */
export async function POST() {
  try {
    // Get current user ID from auth
    const authState = await auth();
    const userId = authState.userId;

    if (!userId) {
      console.error('❌ No user is authenticated');
      return NextResponse.json(
        { error: 'Lietotājs nav autentificēts' },
        { status: 401 }
      );
    }

    console.log('🔄 Resetting profile for user:', userId);

    // Delete the current profile from Supabase if it exists
    const supabase = await createAdminClient();
    
    // Check if profile exists
    const { data: profile, error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (queryError && queryError.code !== 'PGRST116') {
      // PGRST116 is "No rows returned" which is fine
      console.error('❌ Error checking for existing profile:', queryError);
      // Continue with response anyway
    }

    // If profile exists, delete it to allow creating a new one
    if (profile?.id) {
      console.log('🗑️ Deleting existing profile with ID:', profile.id);
      const { error: deleteError } = await supabase
        .from('profiles')
        .delete()
        .eq('user_id', userId);

      if (deleteError) {
        console.error('❌ Error deleting profile:', deleteError);
        return NextResponse.json(
          { error: 'Kļūda dzēšot profilu Supabase' },
          { status: 500 }
        );
      }
    }

    console.log('✅ Profile removed successfully');
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Profils veiksmīgi atiestatīts. Tagad varat no jauna iestatīt savu profilu.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('❌ Error resetting profile:', error);
    return NextResponse.json(
      { error: 'Kļūda atiestatot profilu' },
      { status: 500 }
    );
  }
} 