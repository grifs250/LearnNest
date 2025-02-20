import { Profile } from './profile';
import { User } from './user';

export interface Message {
  id: string;
  booking_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
  sender?: User & {
    profile?: Profile;
  };
} 