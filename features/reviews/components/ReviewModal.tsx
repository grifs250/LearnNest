'use client';

import { useState } from 'react';
import { useClerkSupabase } from '@/lib/hooks/useClerkSupabase';
import { useUser } from '@clerk/nextjs';
import { toast } from 'react-hot-toast';
import type { Database } from '@/types/supabase.types';

type Review = Database['public']['Tables']['reviews']['Row'];

interface ReviewModalProps {
  bookingId: string;
  teacherId: string;
  onClose: () => void;
}

export function ReviewModal({ bookingId, teacherId, onClose }: ReviewModalProps) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase } = useClerkSupabase();
  const { user } = useUser();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('You must be logged in to submit a review');
      return;
    }

    if (!supabase) {
      toast.error('Database connection not available');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          booking_id: bookingId,
          teacher_id: teacherId,
          student_id: user.id,
          rating,
          comment,
        });

      if (error) throw error;

      toast.success('Review submitted successfully');
      onClose();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg mb-4">Leave a Review</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Rating</span>
            </label>
            <div className="rating gap-1">
              {[1, 2, 3, 4, 5].map((value) => (
                <input
                  key={value}
                  type="radio"
                  name="rating"
                  className="mask mask-star-2 bg-orange-400"
                  checked={rating === value}
                  onChange={() => setRating(value)}
                />
              ))}
            </div>
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Comment</span>
            </label>
            <textarea
              className="textarea textarea-bordered h-24"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Share your experience..."
            />
          </div>
          <div className="modal-action">
            <button
              type="button"
              className="btn"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 