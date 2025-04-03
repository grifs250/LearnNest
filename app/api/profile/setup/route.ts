import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';
import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const data = await request.json();
    
    // Create admin client that bypasses RLS
    const supabase = await createAdminClient();
    
    // Check if profile exists by user_id
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id, metadata')
      .eq('user_id', userId)
      .maybeSingle();
    
    console.log('Checking for existing profile:', existingProfile ? 'Found' : 'Not found');
    
    let result;
    
    if (existingProfile) {
      console.log('Updating existing profile with ID:', existingProfile.id);
      // Update existing profile while preserving existing metadata
      result = await supabase
        .from('profiles')
        .update({
          ...data,
          metadata: {
            ...(existingProfile.metadata || {}),
            ...(data.metadata || {})
          }
        })
        .eq('id', existingProfile.id)
        .select()
        .single();
    } else {
      console.log('Creating new profile for user:', userId);
      // Create new profile with user_id = Clerk ID, let Supabase generate UUID for id
      result = await supabase
        .from('profiles')
        .insert({
          ...data,
          user_id: userId, // Ensure user_id is set to Clerk ID
        })
        .select()
        .single();
    }
    
    if (result.error) {
      console.error('Error saving profile:', result.error);
      return NextResponse.json({ error: result.error.message }, { status: 500 });
    }
    
    // Note: Clerk metadata will be updated client-side
    console.log('Profile saved successfully:', result.data.id);
    
    return NextResponse.json({
      success: true,
      profile: result.data
    });
    
  } catch (error) {
    console.error('Error in profile setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 