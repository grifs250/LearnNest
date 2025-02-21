'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/Dialog';
import { LoadingSpinner } from '@/shared/components/ui/LoadingSpinner';
import { supabase } from '@/lib/supabase/db';
import { toast } from 'react-hot-toast';

interface ReviewModalProps {
  lessonId: string;
  teacherId: string;
  studentId: string;
  bookingId: string;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void | Promise<void>;
}

export function ReviewModal({
  lessonId,
  teacherId,
  studentId,
  bookingId,
  isOpen,
  onClose,
  onSuccess,
}: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          lesson_id: lessonId,
          teacher_id: teacherId,
          student_id: studentId,
          booking_id: bookingId,
          rating,
          comment,
        });

      if (error) throw error;

      toast.success('Review submitted successfully');
      await onSuccess();
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Leave a Review</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Rating</label>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setRating(value)}
                  className={`text-2xl ${
                    value <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                  aria-label={`Rate ${value} out of 5 stars`}
                >
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="comment" className="block text-sm font-medium mb-2">
              Comment
            </label>
            <textarea
              id="comment"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full min-h-[100px] p-3 border rounded-lg"
              placeholder="Share your experience..."
              required
            />
          </div>
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-ghost"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <LoadingSpinner size="sm" />
                  <span>Submitting...</span>
                </>
              ) : (
                'Submit Review'
              )}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 