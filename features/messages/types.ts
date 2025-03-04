// import { User } from '@/features/auth/types'; 

import { BaseEntity } from '@/features/bookings/types';
import { Profile } from '@/types/supabase';

/**
 * Message types for the chat functionality
 */

export interface Message extends BaseEntity {
  booking_id: string;
  content: string;
  sender_id: string;
  is_read: boolean;
  sender?: Profile;
}

export interface ThreadMessage extends Message {
  sender_name: string;
  sender_avatar?: string;
  sent_at: string;
  is_current_user: boolean;
}

export interface ThreadProfile {
  id: string;
  full_name: string;
  avatar_url: string | null;
}

export interface Thread {
  id: string;
  last_message: string;
  last_message_time: string;
  unread_count: number;
  other_participant: ThreadProfile;
}

export interface NewMessagePayload {
  bookingId: string;
  content: string;
  senderId: string;
}

export type SendMessageFunction = (message: NewMessagePayload) => Promise<void>;

export type MarkAsReadFunction = (messageIds: string[]) => Promise<void>;

export interface ChatContextType {
  messages: ThreadMessage[];
  loading: boolean;
  error: Error | null;
  sendMessage: SendMessageFunction;
  markAsRead: MarkAsReadFunction;
} 