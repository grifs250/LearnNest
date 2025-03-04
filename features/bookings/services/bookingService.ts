import { createClerkSupabaseClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase.types';

type LessonSchedule = Database['public']['Tables']['lesson_schedules']['Row'];
type Lesson = Database['public']['Tables']['lessons']['Row'];
type Booking = Database['public']['Tables']['bookings']['Row'];

export interface Vacancy {
  id: string;
  start_time: string;
  end_time: string;
  is_available: boolean;
  lesson: {
    id: string;
    title: string;
    description: string | null;
    price: number;
    duration: number;
  };
  created_at: string | null;
  updated_at: string | null;
}

export async function getVacancies(): Promise<Vacancy[]> {
  const supabase = await createClerkSupabaseClient();
  const { data, error } = await supabase
    .from('lesson_schedules')
    .select(`
      *,
      lesson:lessons (
        id,
        title,
        description,
        price,
        duration
      )
    `)
    .eq('is_available', true);

  if (error) {
    throw new Error('Failed to fetch vacancies');
  }

  return (data as (LessonSchedule & { lesson: Lesson })[]).map(schedule => ({
    id: schedule.id,
    start_time: schedule.start_time,
    end_time: schedule.end_time,
    is_available: schedule.is_available ?? true,
    lesson: {
      id: schedule.lesson.id,
      title: schedule.lesson.title,
      description: schedule.lesson.description,
      price: schedule.lesson.price,
      duration: schedule.lesson.duration
    },
    created_at: schedule.created_at,
    updated_at: schedule.updated_at
  }));
}

export async function createBooking(
  scheduleId: string,
  studentId: string,
  amount: number
): Promise<void> {
  const supabase = await createClerkSupabaseClient();
  
  const { error } = await supabase
    .from('bookings')
    .insert({
      schedule_id: scheduleId,
      student_id: studentId,
      status: 'pending',
      amount,
      payment_status: 'pending'
    });

  if (error) {
    throw new Error('Failed to create booking');
  }
}

export async function getBooking(bookingId: string): Promise<Booking & {
  schedule: LessonSchedule;
  student: Database['public']['Tables']['profiles']['Row'];
}> {
  const supabase = await createClerkSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:lesson_schedules(*),
      student:profiles(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error || !data) {
    throw new Error('Failed to fetch booking');
  }

  return data as any;
}

export async function updateBookingStatus(
  bookingId: string,
  status: Database['public']['Enums']['booking_status']
): Promise<void> {
  const supabase = await createClerkSupabaseClient();
  
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    throw new Error('Failed to update booking status');
  }
}

export async function cancelBooking(bookingId: string): Promise<void> {
  const supabase = await createClerkSupabaseClient();

  // Start a transaction
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({ 
      status: 'cancelled',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId);

  if (bookingError) {
    throw new Error('Failed to cancel booking');
  }

  // Get the schedule ID for this booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('schedule_id')
    .eq('id', bookingId)
    .single();

  if (booking) {
    // Update the schedule to be available again
    const { error: scheduleError } = await supabase
      .from('lesson_schedules')
      .update({ 
        is_available: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking.schedule_id);

    if (scheduleError) {
      throw new Error('Failed to update schedule availability');
    }
  }
} 