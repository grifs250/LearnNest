"use server";
import { supabase } from '@/lib/supabase/client';
import { Notification } from '@/lib/types';

// Get user's notifications
export const getUserNotifications = async (userId: string) => {
  const { data, error } = await supabase
    .from('notifications')
    .select(`
      *,
      user:user_id(
        *,
        teacher_profile:teacher_profiles(*),
        student_profile:student_profiles(*)
      )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Notification[];
};

// Get unread notifications count
export const getUnreadNotificationsCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('is_read', false);

  if (error) throw error;
  return count ?? 0;
};

// Create notification
export const createNotification = async (
  notification: {
    user_id: string;
    type: string;
    title: string;
    message: string;
    metadata?: Record<string, any>;
  }
) => {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      ...notification,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select()
    .single();

  if (error) throw error;
  return data as Notification;
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', userId);

  if (error) throw error;
};

// Delete notification
export const deleteNotification = async (notificationId: string, userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('id', notificationId)
    .eq('user_id', userId); // Ensure user owns the notification

  if (error) throw error;
};

// Delete all notifications
export const deleteAllNotifications = async (userId: string) => {
  const { error } = await supabase
    .from('notifications')
    .delete()
    .eq('user_id', userId);
  
  if (error) throw error;
};

// Get recent notifications
export const getRecentNotifications = async (userId: string, limit = 5) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  if (error) throw error;
  return data as Notification[];
};

// Create booking notification
export const createBookingNotification = async (
  userId: string,
  bookingId: string,
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
) => {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      student:student_id(profile:id(*)),
      schedule:schedule_id(
        *,
        lesson:lesson_id(
          *,
          title,
          teacher:teacher_id(profile:id(*))
        )
      )
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const title = status === 'pending' ? 'New Booking Request' :
    status === 'confirmed' ? 'Booking Confirmed' :
    status === 'cancelled' ? 'Booking Cancelled' :
    'Lesson Completed';

  const message = status === 'pending' ?
    `${booking.student.profile.full_name} has requested to book ${booking.schedule.lesson.title}` :
    status === 'confirmed' ?
    `Your booking for ${booking.schedule.lesson.title} has been confirmed` :
    status === 'cancelled' ?
    `The booking for ${booking.schedule.lesson.title} has been cancelled` :
    `Your lesson ${booking.schedule.lesson.title} has been completed`;

  return createNotification({
    user_id: userId,
    type: `booking_${status}`,
    title,
    message,
    metadata: {
      booking_id: bookingId,
      lesson_id: booking.schedule.lesson_id,
      student_id: booking.student_id,
      teacher_id: booking.schedule.lesson.teacher_id
    }
  });
};

// Create review notification
export const createReviewNotification = async (
  teacherId: string,
  reviewId: string
) => {
  const { data: review, error: reviewError } = await supabase
    .from('reviews')
    .select(`
      *,
      student:student_id(profile:id(*)),
      booking:booking_id(
        schedule:schedule_id(
          lesson:lesson_id(title)
        )
      )
    `)
    .eq('id', reviewId)
    .single();

  if (reviewError) throw reviewError;

  return createNotification({
    user_id: teacherId,
    type: 'new_review',
    title: 'New Review Received',
    message: `${review.student.profile.full_name} has left a ${review.rating}-star review for ${review.booking.schedule.lesson.title}`,
    metadata: {
      review_id: reviewId,
      booking_id: review.booking_id,
      student_id: review.student_id,
      rating: review.rating
    }
  });
};

// Create payment notification
export const createPaymentNotification = async (
  userId: string,
  bookingId: string,
  status: 'paid' | 'refunded' | 'failed'
) => {
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(`
      *,
      schedule:schedule_id(
        lesson:lesson_id(title)
      )
    `)
    .eq('id', bookingId)
    .single();

  if (bookingError) throw bookingError;

  const title = status === 'paid' ? 'Payment Successful' :
    status === 'refunded' ? 'Payment Refunded' :
    'Payment Failed';

  const message = status === 'paid' ?
    `Payment of $${booking.amount} for ${booking.schedule.lesson.title} has been processed` :
    status === 'refunded' ?
    `$${booking.amount} has been refunded for ${booking.schedule.lesson.title}` :
    `Payment of $${booking.amount} for ${booking.schedule.lesson.title} has failed`;

  return createNotification({
    user_id: userId,
    type: `payment_${status}`,
    title,
    message,
    metadata: {
      booking_id: bookingId,
      amount: booking.amount,
      payment_status: status
    }
  });
}; 