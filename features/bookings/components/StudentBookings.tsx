"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from "@clerk/nextjs";
import { useBookings } from "../hooks/useBookings";
import { toast } from "react-hot-toast";
import type { Booking, BookingStatus } from "../types";
import { createClient, formatClerkId } from "@/lib/utils/supabaseClient";

interface StudentBookingsProps {
  userId: string; // Clerk ID
}

export function StudentBookings({ userId }: StudentBookingsProps) {
  const router = useRouter();
  const { user } = useUser();
  const { getUserBookings, cancelBooking, loading } = useBookings();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const supabase = createClient();
        const formattedId = formatClerkId(userId);
        
        const { data, error } = await supabase
          .from('bookings')
          .select(`
            *,
            schedule:lesson_schedules(*),
            lesson:lessons(*)
          `)
          .eq('student_id', formattedId);
          
        if (error) {
          throw error;
        }

        if (data && Array.isArray(data)) {
          // Transform the data to match the Booking type
          const formattedBookings: Booking[] = data.map((item: any) => ({
            id: item.id || "",
            student_id: item.student_id || "",
            schedule_id: item.schedule_id || "",
            lesson_schedule_id: item.lesson_schedule_id || "",
            status: (item.status as BookingStatus) || "pending",
            payment_status: item.payment_status || "pending",
            created_at: item.created_at,
            updated_at: item.updated_at,
            metadata: item.metadata,
            amount: item.amount,
            schedule: item.schedule,
            lessons: {
              title: item.lesson?.title || "Untitled Lesson",
              id: item.lesson?.id || ""
            }
          }));
          
          setBookings(formattedBookings);
        }
      } catch (error) {
        console.error("Error fetching bookings:", error);
        toast.error('Failed to load bookings');
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id || userId) {
      fetchBookings();
    }
  }, [user?.id, userId]);

  const handleCancel = async (bookingId: string) => {
    try {
      await cancelBooking(bookingId);
      // Refresh bookings after cancellation
      const updatedBookings = await getUserBookings();
      if (updatedBookings && Array.isArray(updatedBookings)) {
        setBookings(updatedBookings);
      } else {
        setBookings([]);
      }
      toast.success('Booking cancelled successfully');
    } catch (error) {
      toast.error('Failed to cancel booking');
    }
  };

  if (isLoading || loading) {
    return <div>Ielādē rezervācijas...</div>;
  }

  if (!bookings.length) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-semibold mb-2">Vēl nav rezervāciju</h3>
        <p className="text-gray-600">Sāc izpētīt nodarbības, lai rezervētu savu pirmo sesiju!</p>
        <button
          onClick={() => router.push('/lessons')}
          className="btn btn-primary mt-4"
        >
          Pārlūkot nodarbības
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="card bg-base-200 shadow-sm">
          <div className="card-body">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-semibold">
                  {booking.lessons?.title || 'Untitled Lesson'}
                </h3>
                <p className="text-sm text-gray-600">
                  {new Date(booking.schedule?.start_time || '').toLocaleString()}
                </p>
                <div className="mt-2">
                  <span className={`badge ${
                    booking.status === 'confirmed' ? 'badge-success' :
                    booking.status === 'canceled' ? 'badge-error' :
                    booking.status === 'completed' ? 'badge-info' :
                    'badge-warning'
                  }`}>
                    {booking.status === 'confirmed' ? 'Apstiprināts' :
                     booking.status === 'canceled' ? 'Atcelts' :
                     booking.status === 'completed' ? 'Pabeigts' :
                     'Gaida apstiprinājumu'}
                  </span>
                  {booking.amount && (
                    <span className="badge ml-2">
                      ${booking.amount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {booking.status === 'pending' && (
                  <button
                    onClick={() => handleCancel(booking.id)}
                    className="btn btn-error btn-sm"
                    disabled={loading}
                  >
                    Atcelt
                  </button>
                )}
                {booking.status === 'confirmed' && (
                  <button
                    onClick={() => router.push(`/lessons/meet/${booking.id}`)}
                    className="btn btn-primary btn-sm"
                  >
                    Pievienoties nodarbībai
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 