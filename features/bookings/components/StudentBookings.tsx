"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId } from '@/lib/utils/helpers';
import { LocalBooking as Booking, LocalBookingStatus as BookingStatus } from '@/features/bookings/types';
import { toast } from 'react-hot-toast';

interface StudentBookingsProps {
  userId: string; // Clerk ID
}

export function StudentBookings({ userId }: StudentBookingsProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { supabase } = useClerkSupabase();

  useEffect(() => {
    if (userId) {
      fetchBookings();
    }
  }, [userId]);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      if (!supabase) {
        toast.error('Database connection not available');
        setLoading(false);
        return;
      }

      const formattedId = formatClerkId(userId);
      
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          lesson_schedule:schedule_id (
            *,
            lesson:lesson_id (
              *
            )
          )
        `)
        .eq('student_id', formattedId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data && Array.isArray(data)) {
        const transformedBookings = data.map(booking => ({
          ...booking,
          // Map properties to match what the component expects
          lesson: booking.lesson_schedule?.lesson || null,
          schedule: booking.lesson_schedule || null,
          amount: booking.amount || (booking.lesson_schedule?.lesson?.price || 0)
        })) as Booking[];
        
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

  const handleCancel = async (bookingId: string) => {
    try {
      if (!supabase) {
        toast.error('Database connection not available');
        return;
      }

      // Support both spellings in our API
      const status: BookingStatus = 'cancelled';

      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      toast.success('Nodarbība atcelta');
      fetchBookings();
    } catch (error) {
      console.error('Error cancelling booking:', error);
      toast.error('Neizdevās atcelt nodarbību');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  if (bookings.length === 0) {
    return (
      <div className="card bg-base-100 shadow-lg">
        <div className="card-body">
          <h2 className="card-title">Nav rezervētu nodarbību</h2>
          <p>Jums pašlaik nav nevienas rezervētas nodarbības.</p>
          <button
            onClick={() => router.push('/')}
            className="btn btn-primary mt-4"
          >
            Meklēt nodarbības
          </button>
        </div>
      </div>
    );
  }

  // Function to determine if the booking is cancelled (supports both spellings)
  const isCancelled = (status: BookingStatus) => status === 'cancelled' || status === 'canceled';

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bookings.map((booking) => (
        <div key={booking.id} className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <div>
              <h3 className="text-lg font-semibold">
                {booking.lesson?.title || 'Untitled Lesson'}
              </h3>
              <p className="text-sm text-gray-600">
                {booking.schedule?.start_time 
                  ? new Date(booking.schedule.start_time).toLocaleString() 
                  : 'Time not available'}
              </p>
              <div className="mt-2">
                <span
                  className={`badge ${
                    booking.status === 'confirmed'
                      ? 'badge-success'
                      : isCancelled(booking.status)
                      ? 'badge-error'
                      : booking.status === 'completed'
                      ? 'badge-info'
                      : 'badge-warning'
                  }`}
                >
                  {booking.status === 'confirmed'
                    ? 'Apstiprināts'
                    : isCancelled(booking.status)
                    ? 'Atcelts'
                    : booking.status === 'completed'
                    ? 'Pabeigts'
                    : 'Gaida apstiprinājumu'}
                </span>
                {booking.amount && (
                  <span className="badge ml-2">
                    ${booking.amount}
                  </span>
                )}
              </div>
            </div>
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => router.push(`/student/bookings/${booking.id}`)}
                className="btn btn-primary btn-sm"
              >
                Detaļas
              </button>
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => handleCancel(booking.id)}
                  className="btn btn-outline btn-error btn-sm"
                >
                  Atcelt
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 