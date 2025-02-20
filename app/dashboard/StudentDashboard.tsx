'use client';

import { useAuth } from '@/lib/hooks/useAuth';
import { useApiCall } from '@/lib/hooks/useApiCall';
import { useState, useEffect } from 'react';
import { Booking } from '@/types/supabase';
import { getStudentBookings, cancelBooking } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import ErrorBoundary from '@/components/ErrorBoundary';
import ReviewModal from '@/components/ReviewModal';
import ConfirmDialog from '@/components/ui/ConfirmDialog';
import { errorTracker } from '@/lib/utils/errorTracking';

function StudentDashboardContent() {
  const { user } = useAuth();
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);

  // API calls with retry logic
  const {
    execute: fetchBookings,
    data: bookings,
    error: fetchError,
    isLoading: isLoadingBookings,
  } = useApiCall<Booking[]>(
    getStudentBookings,
    {
      errorMessage: 'Failed to load bookings',
      showErrorToast: true,
    }
  );

  const {
    execute: handleCancelBooking,
    isLoading: isCancelling,
  } = useApiCall<Booking>(
    cancelBooking,
    {
      successMessage: 'Lesson cancelled successfully',
      errorMessage: 'Failed to cancel lesson',
      showSuccessToast: true,
      showErrorToast: true,
    }
  );

  // Load bookings on mount
  useEffect(() => {
    if (user) {
      fetchBookings(user.id).catch(error => {
        errorTracker.captureError(error, {
          userId: user.id,
          action: 'fetch_student_bookings',
        });
      });
    }
  }, [user, fetchBookings]);

  const handleCancelConfirm = async () => {
    if (!selectedBooking) return;

    try {
      await handleCancelBooking(selectedBooking.id);
      await fetchBookings(user!.id);
      setIsCancelDialogOpen(false);
      setSelectedBooking(null);
    } catch (error) {
      errorTracker.captureError(error as Error, {
        userId: user!.id,
        action: 'cancel_booking',
        metadata: {
          bookingId: selectedBooking.id,
        },
      });
    }
  };

  const handleReviewSuccess = async () => {
    await fetchBookings(user!.id);
  };

  if (isLoadingBookings) {
    return <LoadingSpinner size="lg" />;
  }

  if (fetchError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4" role="alert">
        <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
        <p className="text-red-600 mt-1">{fetchError.message}</p>
        <button
          onClick={() => fetchBookings(user!.id)}
          className="mt-2 px-4 py-2 bg-red-100 text-red-800 rounded-md hover:bg-red-200"
        >
          Try Again
        </button>
      </div>
    );
  }

  const now = new Date();
  const upcomingBookings = bookings?.filter(
    (booking) => new Date(booking.schedule?.start_time || '') > now
  ) || [];
  const pastBookings = bookings?.filter(
    (booking) => new Date(booking.schedule?.start_time || '') <= now
  ) || [];

  return (
    <div className="space-y-8">
      {/* Upcoming Lessons */}
      <section aria-labelledby="upcoming-lessons-title">
        <h2 id="upcoming-lessons-title" className="text-2xl font-semibold mb-4">
          Upcoming Lessons
        </h2>
        {upcomingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {booking.schedule?.lesson?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Teacher: {booking.schedule?.lesson?.teacher?.profile?.full_name}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-sm ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      booking.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Date: {new Date(booking.schedule?.start_time || '').toLocaleDateString()}
                  </span>
                </div>
                {booking.status !== 'cancelled' && (
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setIsCancelDialogOpen(true);
                    }}
                    className="mt-2 px-3 py-1 text-sm text-red-600 hover:text-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-md"
                    aria-label={`Cancel lesson: ${booking.schedule?.lesson?.title}`}
                  >
                    Cancel Lesson
                  </button>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No upcoming lessons.</p>
        )}
      </section>

      {/* Past Lessons */}
      <section aria-labelledby="past-lessons-title">
        <h2 id="past-lessons-title" className="text-2xl font-semibold mb-4">
          Past Lessons
        </h2>
        {pastBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pastBookings.map((booking) => (
              <div
                key={booking.id}
                className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">
                      {booking.schedule?.lesson?.title}
                    </h3>
                    <p className="text-sm text-gray-600">
                      Teacher: {booking.schedule?.lesson?.teacher?.profile?.full_name}
                    </p>
                  </div>
                  {!booking.review && booking.status === 'completed' && (
                    <button
                      className="px-3 py-1 bg-primary text-white rounded-md text-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                      onClick={() => {
                        setSelectedBooking(booking);
                        setIsReviewModalOpen(true);
                      }}
                      aria-label={`Add review for lesson: ${booking.schedule?.lesson?.title}`}
                    >
                      Add Review
                    </button>
                  )}
                </div>
                <div className="mt-2">
                  <span className="text-sm text-gray-500">
                    Date: {new Date(booking.schedule?.start_time || '').toLocaleDateString()}
                  </span>
                </div>
                {booking.review && (
                  <div className="mt-2 p-2 bg-gray-50 rounded">
                    <p className="text-sm text-gray-700">{booking.review.comment}</p>
                    <div className="flex items-center mt-1" aria-label={`Rating: ${booking.review.rating} out of 5 stars`}>
                      <span className="text-yellow-400" aria-hidden="true">{'★'.repeat(booking.review.rating)}</span>
                      <span className="text-gray-300" aria-hidden="true">{'★'.repeat(5 - booking.review.rating)}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-600">No past lessons.</p>
        )}
      </section>

      {/* Review Modal */}
      {selectedBooking && (
        <ReviewModal
          booking={selectedBooking}
          isOpen={isReviewModalOpen}
          onClose={() => {
            setIsReviewModalOpen(false);
            setSelectedBooking(null);
          }}
          onSuccess={handleReviewSuccess}
        />
      )}

      {/* Cancel Confirmation Dialog */}
      {selectedBooking && (
        <ConfirmDialog
          isOpen={isCancelDialogOpen}
          title="Cancel Lesson"
          message={`Are you sure you want to cancel your lesson "${selectedBooking.schedule?.lesson?.title}"? This action cannot be undone.`}
          confirmLabel="Cancel Lesson"
          confirmVariant="danger"
          isLoading={isCancelling}
          onConfirm={handleCancelConfirm}
          onCancel={() => {
            setIsCancelDialogOpen(false);
            setSelectedBooking(null);
          }}
        />
      )}
    </div>
  );
}

export default function StudentDashboard() {
  return (
    <ErrorBoundary>
      <StudentDashboardContent />
    </ErrorBoundary>
  );
} 