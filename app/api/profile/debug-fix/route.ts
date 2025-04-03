import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { createAdminClient } from '@/lib/supabase/server';

/**
 * API endpoint to diagnose and fix profile issues
 * This endpoint helps diagnose and fix common issues with profiles
 */
export async function GET() {
  try {
    // Get current user information
    const user = await currentUser();
    const { userId } = await auth();
    
    if (!userId || !user) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }
    
    // Connect to Supabase as admin to bypass RLS
    const supabase = await createAdminClient();
    
    // Check for any profile with this user_id
    console.log('⚙️ Checking for profile with user_id:', userId);
    const { data: profileByUserId, error: userIdError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();
    
    // Check for any profile with this ID (direct match)
    console.log('⚙️ Checking for profile with id:', userId);
    const { data: profileById, error: idError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    // Extract user metadata
    const email = user.emailAddresses[0]?.emailAddress || '';
    const fullName = user.firstName && user.lastName 
      ? `${user.firstName} ${user.lastName}`
      : user.firstName || email.split('@')[0] || 'User';
    
    // Generate URL slug from name
    const slug = fullName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
    
    // Determine role from metadata or default to student
    const role = user.unsafeMetadata?.role === 'teacher' ? 'teacher' : 'student';
    
    // Results object
    const results = {
      userId,
      email,
      fullName,
      profileFoundByUserId: !!profileByUserId,
      profileFoundById: !!profileById,
      role,
      actions: [] as string[]
    };
    
    // If no profile exists, create one
    if (!profileByUserId && !profileById) {
      console.log('📝 No profile found, creating new profile');
      
      // Create profile data
      const profileData = {
        id: userId,
        user_id: userId,
        email: email,
        full_name: fullName,
        role: role,
        bio: '',
        is_active: true,
        languages: ['Latviešu'],
        ...(role === 'teacher' ? { hourly_rate: 5.00 } : {}),
        metadata: {
          profile_slug: slug,
          profile_completed: true,
          profile_needs_setup: false,
          profile_completion_date: new Date().toISOString(),
          force_created: true
        }
      };
      
      // Insert the profile
      const { data: newProfile, error: createError } = await supabase
        .from('profiles')
        .insert([profileData])
        .select();
      
      if (createError) {
        results.actions.push(`Failed to create profile: ${createError.message}`);
        console.error('❌ Error creating profile:', createError);
      } else {
        results.actions.push('Created new profile');
        console.log('✅ Profile created:', newProfile);
      }
    } else {
      console.log('✅ Profile already exists');
      results.actions.push('Profile already exists');
      
      // If we found a profile by user_id but not by id, update the id
      if (profileByUserId && !profileById && profileByUserId.id !== userId) {
        console.log('🔄 Updating profile id to match Clerk id');
        
        // First check if there's no collision
        const { data: existingWithTargetId } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', userId)
          .maybeSingle();
        
        if (existingWithTargetId) {
          console.log('⚠️ Cannot update profile id, another profile with target id exists');
          results.actions.push('Cannot update profile id (collision)');
        } else {
          // Update the profile id
          const { error: updateError } = await supabase
            .from('profiles')
            .update({ id: userId })
            .eq('id', profileByUserId.id);
          
          if (updateError) {
            console.error('❌ Error updating profile id:', updateError);
            results.actions.push(`Failed to update profile id: ${updateError.message}`);
          } else {
            console.log('✅ Profile id updated');
            results.actions.push('Updated profile id to match Clerk id');
          }
        }
      }
    }
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('❌ Error in debug-fix endpoint:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 