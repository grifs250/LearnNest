"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId } from '@/lib/utils/helpers';
import { LocalBooking, LocalBookingStatus } from '@/features/bookings/types';
import { toast } from 'react-hot-toast';

export function useStudentBookings() {
  const [bookings, setBookings] = useState<LocalBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useUser();
  const { supabase } = useClerkSupabase();

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user]);

  const fetchBookings = async () => {
    if (!user || !supabase) return;

    try {
      setLoading(true);
      const studentId = formatClerkId(user.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          lesson_schedule:lesson_schedule_id (
            *,
            lesson:lesson_id (
              *
            )
          ),
          payment:payment_id (*)
        `)
        .eq('student_id', studentId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const transformedBookings = data.map(booking => ({
          ...booking,
          // Map properties to match what the component expects
          lesson: booking.lesson_schedule?.lesson,
          schedule: booking.lesson_schedule,
          amount: booking.payment?.amount || (booking.lesson_schedule?.lesson?.price || 0)
        })) as LocalBooking[];
        
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching student bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const cancelBooking = async (bookingId: string) => {
    if (!user || !supabase) {
      toast.error('You must be logged in to cancel a booking');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'cancelled' as LocalBookingStatus })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      toast.success('Booking cancelled successfully');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Failed to cancel booking');
    }
  };

  return {
    bookings,
    loading,
    fetchBookings,
    cancelBooking
  };
} 