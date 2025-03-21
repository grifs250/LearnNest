import { createServerClient } from '@/lib/supabase/server';
import type { Booking, BookingWithDetails } from '@/types/database';

export async function fetchUserBookings(userId: string): Promise<BookingWithDetails[]> {
  const supabase = await createServerClient();
  
  // Use the stored procedure to get bookings with details
  const { data, error } = await supabase
    .rpc('get_student_bookings', { p_student_id: userId });
  
  if (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }
  
  return data;
}

export async function fetchUpcomingBookings(userId: string): Promise<BookingWithDetails[]> {
  const supabase = await createServerClient();
  
  // Get current date in ISO format
  const now = new Date().toISOString();
  
  // Use the stored procedure to get bookings with details
  const { data, error } = await supabase
    .rpc('get_student_bookings', { p_student_id: userId })
    .filter('schedule.start_time', 'gte', now);
  
  if (error) {
    console.error('Error fetching upcoming bookings:', error);
    return [];
  }
  
  return data;
}

export async function fetchPastBookings(userId: string): Promise<BookingWithDetails[]> {
  const supabase = await createServerClient();
  
  // Get current date in ISO format
  const now = new Date().toISOString();
  
  // Use the stored procedure to get bookings with details
  const { data, error } = await supabase
    .rpc('get_student_bookings', { p_student_id: userId })
    .filter('schedule.start_time', 'lt', now);
  
  if (error) {
    console.error('Error fetching past bookings:', error);
    return [];
  }
  
  return data;
}

export async function createBooking(bookingData: Omit<Booking, 'id' | 'created_at' | 'updated_at'>): Promise<Booking | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .insert(bookingData)
    .select()
    .single();
  
  if (error) {
    console.error('Error creating booking:', error);
    return null;
  }
  
  return data;
}

export async function updateBookingStatus(bookingId: string, status: Booking['status']): Promise<Booking | null> {
  const supabase = await createServerClient();
  
  const { data, error } = await supabase
    .from('bookings')
    .update({ status })
    .eq('id', bookingId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating booking status:', error);
    return null;
  }
  
  return data;
}

export async function cancelBooking(bookingId: string): Promise<boolean> {
  const supabase = await createServerClient();
  
  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId);
  
  if (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
  
  return true;
} 