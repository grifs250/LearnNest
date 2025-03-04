import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';
import { auth } from '@clerk/nextjs/server';
import { Booking } from '@/types/database';
// Check if the admin file exists and import it correctly
// import { adminFunction } from '@/lib/firebase/admin'; // Uncomment and correct if needed

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');
    
    // Build query
    let query = supabase
      .from('bookings_with_details')
      .select('*')
      .eq('student_id', userId);
    
    if (status) {
      query = query.eq('status', status);
    }
    
    const { data, error } = await query;
    
    if (error) {
      console.error('Error fetching bookings:', error);
      return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
    }
    
    return NextResponse.json({ bookings: data });
  } catch (error) {
    console.error('Unexpected error in bookings API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Parse request body
    const body = await request.json();
    const { lessonScheduleId, notes } = body;
    
    // Validation
    if (!lessonScheduleId) {
      return NextResponse.json({ error: 'Lesson schedule ID is required' }, { status: 400 });
    }
    
    // Create booking
    const newBooking: Omit<Booking, 'id' | 'created_at' | 'updated_at'> = {
      student_id: userId,
      lesson_schedule_id: lessonScheduleId,
      status: 'pending',
      payment_status: 'pending',
      payment_id: null,
      notes: notes || null
    };
    
    const { data, error } = await supabase
      .from('bookings')
      .insert(newBooking)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating booking:', error);
      return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
    }
    
    return NextResponse.json({ booking: data });
  } catch (error) {
    console.error('Unexpected error in bookings API:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}
