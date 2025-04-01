"use server";
import { supabase } from '@/lib/supabase/client';
import { Booking, BookingStatus, PaymentStatus } from '@/lib/types';
import { Booking as BookingType } from '@/types/booking';

// Get booking by ID
export const getBookingById = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      schedule:schedule_id(
        *,
        lesson:lesson_id(
          *,
          teacher:teacher_id(
            *,
            profile:id(*)
          ),
          subject:subject_id(*)
        )
      )
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data as Booking;
};

// Get student's bookings
export const getStudentBookings = async (studentId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id(
        *,
        lesson:lesson_id(
          *,
          teacher:teacher_id(
            *,
            profile:id(*)
          )
        )
      ),
      review:reviews(*)
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as BookingType[];
};

// Get teacher's bookings
export const getTeacherBookings = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      schedule:schedule_id!inner(
        *,
        lesson:lesson_id!inner(*)
      )
    `)
    .eq('schedule.lesson.teacher_id', teacherId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Booking[];
};

// Get bookings by schedule
export const getScheduleBookings = async (scheduleId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      )
    `)
    .eq('schedule_id', scheduleId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Booking[];
};

// Create booking
export const createBooking = async (
  booking: {
    student_id: string;
    schedule_id: string;
    amount: number;
    status?: BookingStatus;
    payment_status?: PaymentStatus;
    metadata?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('bookings')
    .insert({
      ...booking,
      status: booking.status || 'pending',
      payment_status: booking.payment_status || 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

// Update booking status
export const updateBookingStatus = async (
  bookingId: string,
  status: BookingStatus
) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

// Update payment status
export const updatePaymentStatus = async (
  bookingId: string,
  paymentStatus: PaymentStatus
) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      payment_status: paymentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

// Get pending bookings
export const getPendingBookings = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      schedule:schedule_id!inner(
        *,
        lesson:lesson_id!inner(*)
      )
    `)
    .eq('schedule.lesson.teacher_id', teacherId)
    .eq('status', 'pending')
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Booking[];
};

// Get upcoming bookings
export const getUpcomingBookings = async (userId: string, role: 'student' | 'teacher') => {
  const query = supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      schedule:schedule_id!inner(
        *,
        lesson:lesson_id!inner(
          *,
          teacher:teacher_id(
            *,
            profile:id(*)
          )
        )
      )
    `)
    .eq('status', 'confirmed')
    .gt('schedule.start_time', new Date().toISOString())
    .order('schedule.start_time', { ascending: true });

  if (role === 'student') {
    query.eq('student_id', userId);
  } else {
    query.eq('schedule.lesson.teacher_id', userId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data as Booking[];
};

// Cancel booking
export const cancelBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

// Complete booking
export const completeBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      updated_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (error) throw error;
  return data as Booking;
};

// Get a single booking
export const getBooking = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id(
        *,
        lesson:lesson_id(
          *,
          teacher:teacher_id(
            *,
            profile:id(*)
          )
        )
      ),
      review:reviews(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error) throw error;
  return data as BookingType;
}; 