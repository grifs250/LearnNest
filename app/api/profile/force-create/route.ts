import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * API endpoint to force create a minimal profile
 * This is a failsafe approach for when the normal profile creation process fails
 */
export async function POST() {
  try {
    // Get current user information
    const user = await currentUser();
    const { userId } = await auth();
    
    if (!userId || !user) {
      console.error('❌ No user is authenticated');
      return NextResponse.json(
        { error: 'Lietotājs nav autentificēts' },
        { status: 401 }
      );
    }
    
    console.log('🔨 Force creating minimal profile for user:', userId);
    
    // Create a minimal profile with admin client (bypasses RLS)
    const supabase = await createAdminClient();
    
    // Check if profile already exists
    const { data: existingProfile, error: checkError } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('user_id', userId)
      .maybeSingle();
    
    if (checkError && checkError.code !== 'PGRST116') {
      console.error('❌ Error checking for existing profile:', checkError);
      return NextResponse.json(
        { error: 'Kļūda pārbaudot profilu' },
        { status: 500 }
      );
    }
    
    // If profile exists, return success message
    if (existingProfile) {
      console.log('✅ Profile already exists, skipping creation');
      return NextResponse.json(
        { 
          success: true,
          message: 'Profils jau eksistē',
          profileId: existingProfile.id,
          role: existingProfile.role
        },
        { status: 200 }
      );
    }
    
    // Extract basic user info from Clerk
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || user.emailAddresses[0]?.emailAddress?.split('@')[0] || 'User';
    
    const email = user.emailAddresses[0]?.emailAddress || '';
    
    // Generate URL slug from name
    const slug = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Determine role from existing metadata or default to student
    // We read from unsafeMetadata since that's where the role is usually stored
    const role = user.unsafeMetadata?.role === 'teacher' ? 'teacher' : 'student';
    
    // Create minimal profile data
    const profileData = {
      id: userId, // Use the Clerk ID directly as the profile ID
      user_id: userId,
      email: email,
      full_name: fullName,
      role: role,
      bio: '',
      is_active: true,
      languages: ['Latviešu'],
      // Add hourly_rate when role is teacher to satisfy DB constraint
      ...(role === 'teacher' ? { hourly_rate: 5.00 } : {}),
      metadata: {
        profile_slug: slug,
        profile_completed: true,
        profile_needs_setup: false,
        profile_completion_date: new Date().toISOString(),
        force_created: true
      }
    };
    
    // Insert the minimal profile
    const { data, error } = await supabase
      .from('profiles')
      .insert([profileData])
      .select();
    
    if (error) {
      console.error('❌ Error creating minimal profile:', error);
      return NextResponse.json(
        { error: 'Kļūda izveidojot profilu' },
        { status: 500 }
      );
    }
    
    console.log('✅ Minimal profile created successfully:', data);
    
    return NextResponse.json(
      { 
        success: true, 
        message: 'Pamata profils veiksmīgi izveidots',
        profileId: data[0].id,
        role: role
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('❌ Error force creating profile:', error);
    return NextResponse.json(
      { error: 'Kļūda izveidojot profilu' },
      { status: 500 }
    );
  }
} 