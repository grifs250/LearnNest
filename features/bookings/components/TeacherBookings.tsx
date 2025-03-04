"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { formatClerkId, formatDateTime, isBookingCancelled } from '@/lib/utils/helpers';
import { LocalBooking as Booking, LocalBookingStatus as BookingStatus } from '@/features/bookings/types';
import { toast } from 'react-hot-toast';

interface TeacherBookingsProps {
  userId: string; // Clerk ID
}

export function TeacherBookings({ userId }: TeacherBookingsProps) {
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
      
      // First get the teacher's lessons
      const { data: lessons, error: lessonsError } = await supabase
        .from('lessons')
        .select('id')
        .eq('teacher_id', formattedId);
        
      if (lessonsError) {
        throw lessonsError;
      }
      
      if (!lessons || lessons.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const lessonIds = lessons.map(lesson => lesson.id);
      
      // Then get the schedules for those lessons
      const { data: schedules, error: schedulesError } = await supabase
        .from('lesson_schedules')
        .select('id')
        .in('lesson_id', lessonIds);
        
      if (schedulesError) {
        throw schedulesError;
      }
      
      if (!schedules || schedules.length === 0) {
        setBookings([]);
        setLoading(false);
        return;
      }
      
      const scheduleIds = schedules.map(schedule => schedule.id);
      
      // Finally get the bookings for those schedules
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          lesson_schedule:schedule_id (
            *,
            lesson:lesson_id (
              *
            )
          ),
          profiles:student_id (
            *
          )
        `)
        .in('schedule_id', scheduleIds)
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
          amount: booking.amount || (booking.lesson_schedule?.lesson?.price || 0),
          student: booking.profiles || null
        })) as Booking[];
        
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

  const handleUpdateStatus = async (bookingId: string, status: BookingStatus) => {
    try {
      if (!supabase) {
        toast.error('Database connection not available');
        return;
      }

      const { error } = await supabase
        .from('bookings')
        .update({ status })
        .eq('id', bookingId);

      if (error) {
        throw error;
      }

      toast.success(`Statuss mainīts uz: ${status}`);
      fetchBookings();
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast.error('Neizdevās atjaunināt statusu');
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
          <h2 className="card-title">Nav rezervāciju</h2>
          <p>Jums pašlaik nav nevienas nodarbību rezervācijas.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {bookings.map((booking) => (
        <div key={booking.id} className="card bg-base-100 shadow-lg">
          <div className="card-body">
            <h2 className="card-title">{booking.lesson?.title || 'Untitled Lesson'}</h2>
            <p><strong>Students:</strong> {booking.student?.full_name || 'Unknown Student'}</p>
            <p><strong>Datums:</strong> {formatDateTime(booking.schedule?.start_time || booking.created_at)}</p>
            <div className="mt-2">
              <span
                className={`badge ${
                  booking.status === 'confirmed'
                    ? 'badge-success'
                    : isBookingCancelled(booking.status)
                    ? 'badge-error'
                    : booking.status === 'completed'
                    ? 'badge-info'
                    : 'badge-warning'
                }`}
              >
                {booking.status === 'confirmed'
                  ? 'Apstiprināts'
                  : isBookingCancelled(booking.status)
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
            <div className="card-actions justify-end mt-4">
              <button
                onClick={() => router.push(`/teacher/bookings/${booking.id}`)}
                className="btn btn-primary btn-sm"
              >
                Detaļas
              </button>
              {booking.status === 'pending' && (
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'confirmed')}
                  className="btn btn-success btn-sm"
                >
                  Apstiprināt
                </button>
              )}
              {(booking.status === 'pending' || booking.status === 'confirmed') && (
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'cancelled')}
                  className="btn btn-outline btn-error btn-sm"
                >
                  Atcelt
                </button>
              )}
              {booking.status === 'confirmed' && (
                <button
                  onClick={() => handleUpdateStatus(booking.id, 'completed')}
                  className="btn btn-info btn-sm"
                >
                  Atzīmēt kā pabeigtu
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}