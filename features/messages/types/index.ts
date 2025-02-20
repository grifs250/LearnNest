import { BaseEntity } from '@/features/shared/types';
import { User } from '@/features/auth/types';
import { Booking } from '@/features/bookings/types';

export interface Message extends BaseEntity {
  bookingId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  sender?: User;
  booking?: Booking;
  metadata?: Record<string, any>;
}

export interface ThreadProfile {
  id: string;
  fullName: string;
  avatarUrl: string | null;
}

export interface MessageThread {
  bookingId: string;
  student: ThreadProfile;
  teacher: ThreadProfile;
  latestMessage: Message;
}

export interface BookingWithMessages {
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
  messages: Message[];
}

export interface MessageInput {
  bookingId: string;
  senderId: string;
  content: string;
  metadata?: Record<string, any>;
}

export interface MessageFilter {
  bookingId?: string;
  senderId?: string;
  isRead?: boolean;
  startDate?: string;
  endDate?: string;
} 