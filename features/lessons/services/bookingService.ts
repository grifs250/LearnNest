import { supabase } from '@/lib/supabase/db';
import { Booking } from '@/types/supabase';

export async function getBooking(bookingId: string): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id (
        *,
        lesson:lesson_id (
          *,
          teacher:teacher_id (
            *,
            profile:profiles (
              full_name,
              avatar_url
            )
          )
        )
      ),
      review:reviews (*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data;
}

export async function createBooking(
  scheduleId: string,
  studentId: string
): Promise<Booking> {
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
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id (
        *,
        lesson:lesson_id (
          *,
          teacher:teacher_id (
            *,
            profile:profiles (
              full_name,
              avatar_url
            )
          )
        )
      ),
      review:reviews (*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function getTeacherBookings(teacherId: string): Promise<Booking[]> {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id (
        *,
        lesson:lesson_id (
          *,
          teacher:teacher_id (
            *,
            profile:profiles (
              full_name,
              avatar_url
            )
          )
        )
      ),
      student:student_id (
        *,
        profile:profiles (
          full_name,
          avatar_url
        )
      ),
      review:reviews (*)
    `)
    .eq('schedule.lesson.teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

export async function updateBookingStatus(
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
): Promise<Booking> {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data;
} 