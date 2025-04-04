import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { auth } from '@clerk/nextjs/server';

// Define types for the API request
interface ProfileSetupRequest {
  user_id: string;
  email: string;
  full_name: string;
  role: 'student' | 'teacher' | 'admin';
  bio: string;
  phone: string;
  age: number | null;
  languages: string[];
  learning_goals?: string[];
  teacher_bio?: string;
  hourly_rate?: number;
  work_hours?: {
    schedule: Record<string, Array<{ start: string; end: string; }>>;
  };
  metadata?: Record<string, any>;
}

export async function POST(req: NextRequest) {
  try {
    // Verify authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse request body
    const data: ProfileSetupRequest = await req.json();
    
    // Create Supabase client
    const supabase = await createServerClient();
    
    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();
    
    console.log(`Profile setup for ${userId}: ${existingProfile ? 'Update existing' : 'Create new'}`);
    
    // Prepare profile data for insertion/update
    const profileData = {
      user_id: userId,
      email: data.email,
      full_name: data.full_name,
      role: data.role,
      bio: data.bio,
      phone: data.phone,
      age: data.age,
      languages: data.languages || [],
      is_active: true,
      // Role-specific fields
      ...((data.role === 'student') ? {
        learning_goals: data.learning_goals || [],
      } : {}),
      ...((data.role === 'teacher') ? {
        teacher_bio: data.teacher_bio || data.bio,
        hourly_rate: data.hourly_rate || 5.00,
      } : {}),
      // Keep minimal metadata
      metadata: {
        ...(existingProfile?.metadata || {}),
        ...(data.metadata || {}),
      },
      updated_at: new Date().toISOString()
    };
    
    let savedProfile;
    
    // Insert or update profile
    if (existingProfile) {
      const { data: updatedProfile, error } = await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', existingProfile.id)
        .select()
        .single();
      
      if (error) {
        console.error('Error updating profile:', error);
        return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
      }
      
      savedProfile = updatedProfile;
    } else {
      const { data: newProfile, error } = await supabase
        .from('profiles')
        .insert(profileData)
        .select()
        .single();
      
      if (error) {
        console.error('Error creating profile:', error);
        return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
      }
      
      savedProfile = newProfile;
    }
    
    // Process teacher availability if applicable
    if (data.role === 'teacher' && data.work_hours?.schedule) {
      try {
        // Remove existing availability records
        await supabase
          .from('teacher_availability')
          .delete()
          .eq('teacher_id', savedProfile.id);
        
        // Process schedule data
        const availabilityRecords = [];
        
        for (const [day, slots] of Object.entries(data.work_hours.schedule)) {
          if (Array.isArray(slots) && slots.length > 0) {
            for (const slot of slots) {
              // Convert day string to day number (0 = Sunday, 1 = Monday, etc.)
              const dayMap: Record<string, number> = {
                'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3, 
                'thursday': 4, 'friday': 5, 'saturday': 6
              };
              const dayNumber = dayMap[day.toLowerCase()] || parseInt(day);
              
              availabilityRecords.push({
                teacher_id: savedProfile.id,
                day_of_week: dayNumber,
                start_time: slot.start,
                end_time: slot.end,
                is_active: true
              });
            }
          }
        }
        
        if (availabilityRecords.length > 0) {
          const { error: availabilityError } = await supabase
            .from('teacher_availability')
            .insert(availabilityRecords);
          
          if (availabilityError) {
            console.error('Error saving teacher availability:', availabilityError);
          } else {
            console.log(`Saved ${availabilityRecords.length} availability records`);
          }
        }
      } catch (error) {
        console.error('Error processing availability:', error);
        // Continue with the process - availability is not critical
      }
    }
    
    return NextResponse.json({
      success: true,
      profile: savedProfile
    });
    
  } catch (error) {
    console.error('Error in profile setup:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
} 