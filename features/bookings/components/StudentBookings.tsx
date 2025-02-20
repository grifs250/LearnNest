"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { db } from "@/lib/firebase/client";
import { writeBatch, doc } from "firebase/firestore";
import { StudentBookingsProps, BookingStatus } from "../types";
import { useStudentBookings } from "../hooks/useStudentBookings";
import { Button } from "@/shared/components/ui";
import { toast } from "react-hot-toast";

export function StudentBookings({ userId }: StudentBookingsProps) {
  const router = useRouter();
  const { bookings, loading, error, refreshBookings } = useStudentBookings(userId);
  const [view, setView] = useState<'upcoming' | 'past'>('upcoming');

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const batch = writeBatch(db);
      const bookingRef = doc(db, 'bookings', bookingId);
      batch.update(bookingRef, { status: 'cancelled' as BookingStatus });
      await batch.commit();
      await refreshBookings();
      toast.success('Booking cancelled successfully');
    } catch (err) {
      console.error('Error cancelling booking:', err);
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (error) {
    return <div className="text-error">Error loading bookings: {typeof error === 'string' ? error : 'Unknown error'}</div>;
  }

  const now = new Date();
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = new Date(booking.date);
    return view === 'upcoming' ? bookingDate >= now : bookingDate < now;
  });

  return (
    <div className="space-y-4">
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${view === 'upcoming' ? 'tab-active' : ''}`}
          onClick={() => setView('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`tab ${view === 'past' ? 'tab-active' : ''}`}
          onClick={() => setView('past')}
        >
          Past
        </button>
      </div>

      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <p className="text-center text-gray-500">No {view} bookings found</p>
        ) : (
          filteredBookings.map((booking) => (
            <div key={booking.id} className="card bg-base-200 shadow-xl">
              <div className="card-body">
                <div className="flex justify-between items-center">
                  <h3 className="card-title">
                    {booking.subject}
                  </h3>
                  <div className="badge badge-primary">{booking.status}</div>
                </div>
                
                <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                <p>Time: {booking.time}</p>
                <p>Teacher: {booking.teacherName}</p>
                
                {view === 'upcoming' && booking.status !== 'cancelled' && (
                  <div className="card-actions justify-end mt-4">
                    <Button
                      variant="error"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel Booking
                    </Button>
                    {booking.status === 'accepted' && (
                      <Button
                        variant="primary"
                        onClick={() => router.push(`/lessons/meet/${booking.lessonId}`)}
                      >
                        Join Lesson
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
} 