import { Profile } from './profile';
import { User } from './user';

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User;
  recipient?: User;
}

export interface Thread {
  id: string;
  participants: Profile[];
  messages: Message[];
  lastMessage?: Message;
  unreadCount: number;
}

export interface ThreadProfile {
  id: string;
  full_name: string;
  avatar_url?: string | null;
} 