"use server";
import { supabase } from '@/lib/supabase/client';
import { Review } from '@/types/supabase';

// Get review by ID
export const getReviewById = async (reviewId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      teacher:teacher_id(
        *,
        profile:id(*)
      ),
      booking:booking_id(
        *,
        schedule:schedule_id(
          lesson:lesson_id(*)
        )
      )
    `)
    .eq('id', reviewId)
    .single();

  if (error) throw error;
  return data as Review;
};

// Get reviews by teacher
export const getTeacherReviews = async (teacherId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      booking:booking_id(
        schedule:schedule_id(
          lesson:lesson_id(*)
        )
      )
    `)
    .eq('teacher_id', teacherId)
    .eq('is_public', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
};

// Get reviews by student
export const getStudentReviews = async (studentId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      teacher:teacher_id(
        *,
        profile:id(*)
      ),
      booking:booking_id(
        schedule:schedule_id(
          lesson:lesson_id(*)
        )
      )
    `)
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Review[];
};

// Create review
export const createReview = async (
  review: {
    booking_id: string;
    student_id: string;
    teacher_id: string;
    rating: number;
    comment?: string;
    is_public?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('reviews')
    .insert({
      ...review,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;

  // Update teacher rating
  await updateTeacherRating(review.teacher_id);

  return data as Review;
};

// Update review
export const updateReview = async (
  reviewId: string,
  updates: {
    rating?: number;
    comment?: string;
    is_public?: boolean;
  }
) => {
  const { data, error } = await supabase
    .from('reviews')
    .update({
      ...updates,
      updated_at: new Date().toISOString()
    })
    .eq('id', reviewId)
    .select()
    .single();

  if (error) throw error;

  // Get the review to update teacher rating
  const review = await getReviewById(reviewId);
  await updateTeacherRating(review.teacher_id);

  return data as Review;
};

// Delete review
export const deleteReview = async (reviewId: string) => {
  // Get the review first to update teacher rating after deletion
  const review = await getReviewById(reviewId);

  const { error } = await supabase
    .from('reviews')
    .delete()
    .eq('id', reviewId);

  if (error) throw error;

  // Update teacher rating after deletion
  await updateTeacherRating(review.teacher_id);
};

// Get review by booking
export const getBookingReview = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('reviews')
    .select(`
      *,
      student:student_id(
        *,
        profile:id(*)
      ),
      teacher:teacher_id(
        *,
        profile:id(*)
      )
    `)
    .eq('booking_id', bookingId)
    .single();

  if (error) throw error;
  return data as Review;
};

// Helper function to update teacher rating
const updateTeacherRating = async (teacherId: string) => {
  // Calculate new rating from reviews
  const { data: reviews, error: reviewsError } = await supabase
    .from('reviews')
    .select('rating')
    .eq('teacher_id', teacherId)
    .eq('is_public', true);

  if (reviewsError) throw reviewsError;

  const totalReviews = reviews.length;
  const averageRating = totalReviews > 0
    ? reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews
    : 0;

  // Update teacher profile with new rating
  const { error: updateError } = await supabase
    .from('teacher_profiles')
    .update({
      rating: averageRating,
      total_reviews: totalReviews,
      updated_at: new Date().toISOString()
    })
    .eq('id', teacherId);

  if (updateError) throw updateError;
}; 