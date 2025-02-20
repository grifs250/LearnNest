'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { getBooking } from '@/lib/api/bookings';
import { Booking } from '@/types/booking';
import { errorTracker } from '@/lib/utils/errorTracking';
import LoadingSpinner from '@/components/LoadingSpinner';
import Chat from '@/components/Chat';

export default function LessonMeetPage() {
  const { lessonId } = useParams();
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);

  const {
    execute: fetchBooking,
    isLoading,
    error
  } = useApiCall<Booking>(
    getBooking,
    {
      errorMessage: 'Failed to load lesson details',
      showErrorToast: true
    }
  );

  useEffect(() => {
    if (lessonId && user) {
      fetchBooking(lessonId as string).then(setBooking).catch(error => {
        errorTracker.captureError(error as Error, {
          userId: user.id,
          action: 'fetch_booking',
          metadata: { lessonId }
        });
      });
    }
  }, [lessonId, user, fetchBooking]);

  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
        <p className="text-red-600">{error.message}</p>
        <button
          onClick={() => fetchBooking(lessonId as string)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Lesson not found</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lesson Details */}
        <div className="lg:col-span-2">
          <h1 className="text-2xl font-bold mb-4">{booking.schedule?.lesson?.title}</h1>
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Meeting Details</h2>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Teacher:</span>{' '}
              {booking.schedule?.lesson?.teacher?.profile?.full_name}
            </p>
            <p className="text-gray-600 mb-2">
              <span className="font-medium">Date:</span>{' '}
              {new Date(booking.schedule?.start_time || '').toLocaleDateString()}
            </p>
            <p className="text-gray-600 mb-4">
              <span className="font-medium">Time:</span>{' '}
              {new Date(booking.schedule?.start_time || '').toLocaleTimeString()}
            </p>
            {/* Add video call component here */}
          </div>
        </div>

        {/* Chat */}
        <div className="lg:col-span-1">
          <h2 className="text-xl font-semibold mb-4">Chat</h2>
          <Chat bookingId={booking.id} />
        </div>
      </div>
    </div>
  );
} 