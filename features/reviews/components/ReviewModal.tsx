'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useApiCall } from '@/features/shared/hooks/useApiCall';
import { createReview } from '@/lib/api/reviews';
import { reviewSchema } from '../validations';
import { Booking } from '@/features/bookings/types';
import { LoadingSpinner } from '@/features/shared/components';
import { errorTracker } from '@/features/monitoring/utils/error-tracking';

interface ReviewModalProps {
  booking: Booking;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ReviewModal({
  booking,
  isOpen,
  onClose,
  onSuccess
}: ReviewModalProps) {
  const { user } = useAuth();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const {
    execute: submitReview,
    isLoading: isSubmitting
  } = useApiCall();

  const validateForm = () => {
    const result = reviewSchema.safeParse({
      rating,
      comment,
      booking_id: booking.id,
      student_id: user?.id,
      teacher_id: booking.schedule?.lesson?.teacher?.id,
      is_public: true
    });

    if (!result.success) {
      const formErrors: Record<string, string> = {};
      result.error.errors.forEach(error => {
        formErrors[error.path[0]] = error.message;
      });
      setErrors(formErrors);
      return false;
    }

    setErrors({});
    return true;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || isSubmitting) return;

    if (!validateForm()) return;

    try {
      await submitReview(
        () => createReview({
          booking_id: booking.id,
          student_id: user!.id,
          teacher_id: booking.schedule?.lesson?.teacher?.id!,
          rating,
          comment,
          is_public: true
        }),
        {
          successMessage: 'Review submitted successfully',
          errorMessage: 'Failed to submit review'
        }
      );

      onSuccess();
      onClose();
    } catch (error) {
      errorTracker.captureError(error as Error, {
        userId: user.id,
        action: 'submit_review',
        metadata: { bookingId: booking.id }
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity" />

        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:w-full sm:max-w-lg">
          <div className="bg-white px-4 pb-4 pt-5 sm:p-6">
            <h2 className="text-2xl font-semibold mb-4">
              Review {booking.schedule?.lesson?.title}
            </h2>

            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Rating
                </label>
                <div className="flex space-x-2">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => setRating(value)}
                      className={`p-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                        value <= rating
                          ? 'text-yellow-400 hover:text-yellow-500'
                          : 'text-gray-300 hover:text-gray-400'
                      }`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                {errors.rating && (
                  <p className="mt-1 text-sm text-red-600">{errors.rating}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="comment"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Comment
                </label>
                <textarea
                  id="comment"
                  rows={4}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                  placeholder="Share your experience..."
                />
                {errors.comment && (
                  <p className="mt-1 text-sm text-red-600">{errors.comment}</p>
                )}
              </div>

              <div className="mt-5 sm:mt-6 sm:flex sm:flex-row-reverse">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto sm:ml-3 mb-2 sm:mb-0 inline-flex justify-center rounded-md bg-primary px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                >
                  {isSubmitting ? <LoadingSpinner size="sm" /> : 'Submit Review'}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto inline-flex justify-center rounded-md bg-white px-6 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 