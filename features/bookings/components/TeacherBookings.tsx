"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTeacherBookings } from "../hooks/useTeacherBookings";
import { UserInfoModal } from '@/features/shared/components/UserInfoModal';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { toast } from "react-hot-toast";
import { updateBooking } from '@/lib/supabase/db';
import { TeacherBookingsProps, BookingStatus } from "../types";

export function TeacherBookings({ teacherId }: TeacherBookingsProps) {
  const router = useRouter();
  const { bookings, loading, error, refreshBookings } = useTeacherBookings(teacherId);
  const [view, setView] = useState<'pending' | 'accepted' | 'paid'>('pending');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    try {
      await updateBooking(bookingId, { status: newStatus });
      await refreshBookings();
      toast.success('Booking status updated successfully');
    } catch (err) {
      console.error('Error updating booking status:', err);
      toast.error('Failed to update booking status');
    }
  };

  if (loading) {
    return <div className="loading loading-spinner loading-lg"></div>;
  }

  if (error) {
    return <div className="text-error">Error loading bookings: {typeof error === 'string' ? error : 'Unknown error'}</div>;
  }

  const filteredBookings = bookings.filter(booking => booking.status === view);

  return (
    <div className="space-y-4">
      <div className="tabs tabs-boxed">
        <button 
          className={`tab ${view === 'pending' ? 'tab-active' : ''}`}
          onClick={() => setView('pending')}
        >
          Pending
        </button>
        <button 
          className={`tab ${view === 'accepted' ? 'tab-active' : ''}`}
          onClick={() => setView('accepted')}
        >
          Accepted
        </button>
        <button 
          className={`tab ${view === 'paid' ? 'tab-active' : ''}`}
          onClick={() => setView('paid')}
        >
          Paid
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
                    Booking from {booking.studentName}
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => {
                        if (booking.studentId) {
                          setSelectedUserId(booking.studentId);
                          setIsUserModalOpen(true);
                        }
                      }}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </h3>
                  <div className="badge badge-primary">{booking.status}</div>
                </div>
                
                <p>Date: {new Date(booking.date).toLocaleDateString()}</p>
                <p>Time: {booking.time}</p>
                <p>Subject: {booking.subject}</p>
                
                <div className="card-actions justify-end mt-4">
                  {view === 'pending' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleStatusChange(booking.id, 'accepted')}
                      >
                        Accept
                      </button>
                      <button
                        className="btn btn-error"
                        onClick={() => handleStatusChange(booking.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {view === 'accepted' && (
                    <button
                      className="btn btn-success"
                      onClick={() => handleStatusChange(booking.id, 'paid')}
                    >
                      Mark as Paid
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {selectedUserId && (
        <UserInfoModal
          isOpen={isUserModalOpen}
          onClose={() => {
            setIsUserModalOpen(false);
            setSelectedUserId(null);
          }}
          userId={selectedUserId}
        />
      )}
    </div>
  );
} 