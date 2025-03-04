"use client";

import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId } from '@/lib/utils/helpers';
import { LocalBooking, LocalBookingStatus } from '@/features/bookings/types';
import { toast } from 'react-hot-toast';

export function useTeacherBookings() {
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
      const teacherId = formatClerkId(user.id);

      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          lesson_schedule:lesson_schedule_id (
            *,
            lesson:lesson_id (
              *,
              teacher:teacher_id (
                *
              )
            )
          ),
          student:student_id (
            *,
            profile:user_id (*)
          ),
          payment:payment_id (*)
        `)
        .eq('teacher_id', teacherId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const transformedBookings = data.map(booking => ({
          ...booking,
          // Map properties to match what the component expects
          lessons: booking.lesson_schedule?.lesson,
          profiles: booking.student?.profile,
          booking_time: booking.lesson_schedule?.start_time || booking.created_at,
          amount: booking.payment?.amount || (booking.lesson_schedule?.lesson?.price || 0)
        })) as LocalBooking[];
        
        setBookings(transformedBookings);
      } else {
        setBookings([]);
      }
    } catch (error) {
      console.error('Error fetching teacher bookings:', error);
      toast.error('Failed to load bookings');
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId: string, status: LocalBookingStatus) => {
    if (!user || !supabase) {
      toast.error('You must be logged in to update a booking');
      return;
    }

    try {
      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      toast.success(`Booking ${status} successfully`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Failed to update booking status');
    }
  };

  return {
    bookings,
    loading,
    fetchBookings,
    updateBookingStatus
  };
} 