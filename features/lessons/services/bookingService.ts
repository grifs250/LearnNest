import { createServerSupabaseClient } from '@/lib/supabase/server';
import type { Booking } from '@/types/supabase.types';

export async function getBooking(bookingId: string): Promise<Booking> {
  const supabase = await createServerSupabaseClient();
  
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

  return data as Booking;
}

export async function createBooking(
  scheduleId: string,
  studentId: string
): Promise<Booking> {
  const supabase = await createServerSupabaseClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      schedule_id: scheduleId,
      student_id: studentId,
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function cancelBooking(bookingId: string): Promise<Booking> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getStudentBookings(studentId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id (
        *,
        lesson:lesson_id (*)
      )
    `)
    .eq('student_id', studentId);

  if (error) throw error;
  return data;
}

export async function getTeacherBookings(teacherId: string): Promise<Booking[]> {
  const supabase = await createServerSupabaseClient();
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id (*),
      student:student_id (*)
    `)
    .eq('teacher_id', teacherId);

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(
  bookingId: string, 
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<void> {
  const supabase = await createServerSupabaseClient();
  
  const { error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId);

  if (error) {
    throw new Error('Failed to update booking status');
  }
} 