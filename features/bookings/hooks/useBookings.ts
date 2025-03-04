'use client';

import { useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import type { BookingStatus, Booking } from '../types';
import { toast } from 'react-hot-toast';

export function useBookings() {
  const [loading, setLoading] = useState(false);
  const { user } = useUser();
  const { supabase } = useClerkSupabase();

  const createBooking = async (
    scheduleId: string,
    amount: number,
    metadata?: Record<string, any>
  ) => {
    if (!user) {
      throw new Error('User must be logged in to create a booking');
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .insert({
          schedule_id: scheduleId,
          student_id: user.id,
          status: 'pending',
          amount,
          payment_status: 'pending',
          metadata
        });

      if (error) throw error;

      // Update schedule availability
      const { error: scheduleError } = await supabase
        .from('lesson_schedules')
        .update({ is_available: false })
        .eq('id', scheduleId);

      if (scheduleError) throw scheduleError;

      toast.success('Booking created successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to create booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user) {
      throw new Error('User must be logged in to cancel a booking');
    }

    setLoading(true);
    try {
      // Get the booking first to check permissions
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('*')
        .eq('id', bookingId)
        .single();

      if (bookingError) throw bookingError;

      // Check if user owns this booking
      if (booking.student_id !== user.id) {
        throw new Error('Not authorized to cancel this booking');
      }

      // Update booking status
      const { error: updateError } = await supabase
        .from('bookings')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (updateError) throw updateError;

      // Make schedule available again
      const { error: scheduleError } = await supabase
        .from('lesson_schedules')
        .update({ 
          is_available: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', booking.schedule_id);

      if (scheduleError) throw scheduleError;

      toast.success('Booking cancelled successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel booking');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const getUserBookings = async (status?: BookingStatus): Promise<Booking[]> => {
    if (!user) {
      throw new Error('User must be logged in to view bookings');
    }

    try {
      const query = supabase
        .from('bookings')
        .select(`
          *,
          schedule:lesson_schedules (
            *,
            lesson:lessons (*)
          ),
          student:profiles (*)
        `)
        .eq('student_id', user.id)
        .order('created_at', { ascending: false });

      if (status) {
        query.eq('status', status);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as unknown as Booking[];
    } catch (error: any) {
      toast.error(error.message || 'Failed to fetch bookings');
      throw error;
    }
  };

  return {
    loading,
    createBooking,
    cancelBooking,
    getUserBookings
  };
} 