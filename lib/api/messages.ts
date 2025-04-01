"use server";
import { supabase } from '@/lib/supabase/client';
import type { Message as DbMessage } from '@/lib/types';

interface ThreadProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

interface MessageThread {
  booking_id: string;
  student: ThreadProfile;
  teacher: ThreadProfile;
  latest_message: DbMessage;
}

interface BookingWithMessages {
  id: string;
  student: {
    profile: ThreadProfile;
  };
  schedule: {
    lesson: {
      teacher: {
        profile: ThreadProfile;
      };
    };
  };
  messages: DbMessage[];
}

interface Message {
  id: string;
  booking_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
  sender_id: string;
}

// Get messages for a booking
export const getBookingMessages = async (bookingId: string) => {
  const { data, error } = await supabase
    .from('messages')
    .select(`
      *,
      sender:sender_id(
        *,
        profile:id(*)
      )
    `)
    .eq('booking_id', bookingId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data as Message[];
};

// Get unread messages count
export const getUnreadMessagesCount = async (userId: string) => {
  const { count, error } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('booking_id', 'bookings.id')
    .eq('is_read', false)
    .or(`bookings.student_id.eq.${userId},bookings.lesson.teacher_id.eq.${userId}`);

  if (error) throw error;
  return count || 0;
};

// Send message
export const sendMessage = async (
  message: {
    booking_id: string;
    sender_id: string;
    content: string;
  }
) => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      ...message,
      is_read: false,
      created_at: new Date().toISOString()
    })
    .select(`
      *,
      sender:sender_id(
        *,
        profile:id(*)
      )
    `)
    .single();

  if (error) throw error;
  return data as Message;
};

// Mark message as read
export const markMessageAsRead = async (messageId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('id', messageId);

  if (error) throw error;
};

// Mark all messages as read
export const markAllMessagesAsRead = async (bookingId: string, userId: string) => {
  const { error } = await supabase
    .from('messages')
    .update({ is_read: true })
    .eq('booking_id', bookingId)
    .neq('sender_id', userId);

  if (error) throw error;
};

// Get user's recent message threads
export const getRecentMessageThreads = async (userId: string): Promise<MessageThread[]> => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      student_id,
      profiles!student_id (
        id,
        full_name,
        avatar_url
      ),
      schedule:schedule_id (
        lesson:lesson_id (
          teacher_id,
          profiles!teacher_id (
            id,
            full_name,
            avatar_url
          )
        )
      ),
      messages (
        id,
        content,
        created_at,
        is_read,
        sender_id,
        booking_id
      )
    `)
    .eq('student_id', userId)
    .or(`teacher_id.eq.${userId}`)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;

  // Map the complex nested data structure to our simpler MessageThread interface
  const threads: MessageThread[] = data.map((item: any) => {
    // Get the student profile
    const studentProfile: ThreadProfile = {
      id: item.profiles?.[0]?.id,
      full_name: item.profiles?.[0]?.full_name,
      avatar_url: item.profiles?.[0]?.avatar_url
    };
    
    // Get the teacher profile
    const teacherProfile: ThreadProfile = {
      id: item.schedule?.[0]?.lesson?.[0]?.profiles?.[0]?.id,
      full_name: item.schedule?.[0]?.lesson?.[0]?.profiles?.[0]?.full_name,
      avatar_url: item.schedule?.[0]?.lesson?.[0]?.profiles?.[0]?.avatar_url
    };
    
    // Get the latest message
    const latestMessage = item.messages?.length > 0 ? item.messages[0] : null;
    
    return {
      booking_id: item.id,
      student: studentProfile,
      teacher: teacherProfile,
      latest_message: latestMessage ? {
        id: latestMessage.id,
        content: latestMessage.content,
        created_at: latestMessage.created_at,
        is_read: latestMessage.is_read,
        sender_id: latestMessage.sender_id,
        booking_id: latestMessage.booking_id
      } as DbMessage : {} as DbMessage
    };
  });

  return threads;
};

// Delete message
export const deleteMessage = async (messageId: string, userId: string) => {
  // Only allow deleting own messages
  const { error } = await supabase
    .from('messages')
    .delete()
    .eq('id', messageId)
    .eq('sender_id', userId);

  if (error) throw error;
};

// Get unread conversations count
export const getUnreadConversationsCount = async (userId: string) => {
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      messages!inner(
        is_read,
        sender_id
      )
    `)
    .or(`student_id.eq.${userId},schedule.lesson.teacher_id.eq.${userId}`);

  if (error) throw error;

  return data.filter(booking => 
    booking.messages.some(msg => 
      !msg.is_read && msg.sender_id !== userId
    )
  ).length;
}; 