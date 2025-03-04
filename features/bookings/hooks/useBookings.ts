'use client';

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId } from '@/lib/utils/helpers';
import type { LocalBooking, LocalBookingStatus } from '../types';
import { toast } from 'react-hot-toast';

interface UseBookingsProps {
  userId?: string;
  status?: LocalBookingStatus;
  role?: 'student' | 'teacher';
}

export const useBookings = ({ userId, status, role = 'student' }: UseBookingsProps = {}) => {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { supabase } = useClerkSupabase();

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId, status, role]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        throw new Error('Database connection not available');
      }

      const formattedId = userId ? formatClerkId(userId) : undefined;
      
      let query = supabase
        .from('bookings')
        .select(`
          *,
          lesson_schedule:lesson_schedule_id (
            *,
            lesson:lesson_id (
              *,
              teacher:teacher_id (*)
            )
          ),
          student:student_id (
            *,
            profile:user_id (*)
          )
        `);

      if (formattedId) {
        if (role === 'student') {
          query = query.eq('student_id', formattedId);
        } else {
          query = query.eq('teacher_id', formattedId);
        }
      }

      if (status) {
        query = query.eq('status', status);
      }

      const { data, error: supabaseError } = await query.order('created_at', { ascending: false });

      if (supabaseError) {
        throw supabaseError;
      }

      if (data) {
        const transformedBookings = data.map(booking => ({
          ...booking,
          lesson: booking.lesson_schedule?.lesson,
          schedule: booking.lesson_schedule,
          profiles: role === 'student' 
            ? booking.lesson_schedule?.lesson?.teacher
            : booking.student?.profile,
          booking_time: booking.lesson_schedule?.start_time || booking.created_at
        })) as LocalBooking[];
        
        setBookings(transformedBookings);
      }
      
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error occurred'));
      console.error('Error fetching bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }

      const { error: supabaseError } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' as LocalBookingStatus })
        .eq('id', bookingId);

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchBookings();
      return { success: true };
    } catch (err) {
      console.error('Error cancelling booking:', err);
      return { success: false, error: err };
    }
  };

  const updateBookingStatus = async (bookingId: string, status: LocalBookingStatus) => {
    try {
      if (!supabase) {
        throw new Error('Database connection not available');
      }

      const { error: supabaseError } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (supabaseError) {
        throw supabaseError;
      }

      await fetchBookings();
      return { success: true };
    } catch (err) {
      console.error('Error updating booking status:', err);
      return { success: false, error: err };
    }
  };

  return {
    bookings,
    loading,
    error,
    fetchBookings,
    cancelBooking,
    updateBookingStatus
  };
}; 