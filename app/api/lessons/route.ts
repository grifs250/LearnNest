import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { Lesson, LessonSchedule, UserProfile } from '@/lib/types';
import dbService from '@/lib/supabase/db';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subjectId = searchParams.get('subjectId');
    const teacherId = searchParams.get('teacherId');
    
    // Build query options
    const options: Record<string, any> = {
      is_active: true
    };
    
    if (subjectId) {
      options.subject_id = subjectId;
    }
    
    if (teacherId) {
      options.teacher_id = teacherId;
    }
    
    const lessons = await dbService.getLessonsWithProfiles(options);
    
    return NextResponse.json({ lessons });
  } catch (error) {
    console.error('Error in lessons API:', error);
    return NextResponse.json({ error: 'Failed to fetch lessons' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Get user profile to check if they're a teacher
    const profile = await dbService.getUserProfile(userId);
    
    if (!profile || profile.profile_type !== 'teacher') {
      return NextResponse.json({ error: 'Only teachers can create lessons' }, { status: 403 });
    }
    
    // Parse request body
    const body = await request.json();
    
    // Validate required fields
    if (!body.title || !body.subject_id || !body.price || !body.duration) {
      return NextResponse.json({ 
        error: 'Missing required fields: title, subject_id, price, duration' 
      }, { status: 400 });
    }
    
    // Add teacher_id to the lesson data
    const lessonData = {
      ...body,
      teacher_id: profile.id,
      is_active: true
    };
    
    // Insert the new lesson using dbService
    const lesson = await dbService.createLesson(lessonData);
    
    if (!lesson) {
      return NextResponse.json({ error: 'Failed to create lesson' }, { status: 500 });
    }
    
    return NextResponse.json({ lesson });
  } catch (error) {
    console.error('Error in lessons API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
} 